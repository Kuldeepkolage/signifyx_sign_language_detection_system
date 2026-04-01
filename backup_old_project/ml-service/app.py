from flask import Flask, jsonify, request
from flask_cors import CORS
import mediapipe as mp
import numpy as np
import joblib
import cv2
import base64

app = Flask(__name__)
CORS(app)

# Load trained model
model = joblib.load("gesture_model.pkl")

# Setup MediaPipe
mp_tasks = mp.tasks
vision = mp_tasks.vision

BaseOptions = mp_tasks.BaseOptions
HandLandmarker = vision.HandLandmarker
HandLandmarkerOptions = vision.HandLandmarkerOptions
VisionRunningMode = vision.RunningMode

options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path="hand_landmarker.task"),
    running_mode=VisionRunningMode.IMAGE,  # ✅ IMAGE mode, not VIDEO
    num_hands=1
)

landmarker = HandLandmarker.create_from_options(options)

def decode_base64_image(base64_string):
    """Convert base64 image from frontend to OpenCV image"""
    # Remove header like "data:image/jpeg;base64,"
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    
    img_bytes = base64.b64decode(base64_string)
    img_array = np.frombuffer(img_bytes, dtype=np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    return img

@app.route("/predict", methods=["GET", "POST"])
def predict():
    # GET request - return status
    if request.method == "GET":
        return jsonify({"status": "ML service running", "gesture": None})

    try:
        data = request.get_json()

        if not data or "image" not in data:
            return jsonify({"error": "No image provided"}), 400

        # Decode image
        img = decode_base64_image(data["image"])

        if img is None:
            return jsonify({"error": "Invalid image"}), 400

        # Convert to RGB for MediaPipe
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Create MediaPipe image
        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=img_rgb
        )

        # Detect landmarks — IMAGE mode, no timestamp needed
        result = landmarker.detect(mp_image)

        if not result.hand_landmarks:
            return jsonify({
                "gesture": None,
                "confidence": 0,
                "message": "No hand detected in image"
            })

        # Extract landmarks
        row = []
        for lm in result.hand_landmarks[0]:  # first hand
            row.extend([lm.x, lm.y, lm.z])

        # Predict gesture
        prediction = model.predict([row])
        
        # Get confidence if model supports it
        try:
            proba = model.predict_proba([row])
            confidence = float(np.max(proba))
        except:
            confidence = 0.95

        gesture = str(prediction[0])
        print(f"Detected gesture: {gesture} ({confidence:.2f})")

        return jsonify({
            "gesture": gesture,
            "confidence": confidence
        })

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)