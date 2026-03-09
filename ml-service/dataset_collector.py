import cv2
import mediapipe as mp
import csv

mp_tasks = mp.tasks
vision = mp_tasks.vision

BaseOptions = mp_tasks.BaseOptions
HandLandmarker = vision.HandLandmarker
HandLandmarkerOptions = vision.HandLandmarkerOptions
VisionRunningMode = vision.RunningMode

options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path="hand_landmarker.task"),
    running_mode=VisionRunningMode.VIDEO,
    num_hands=1
)

landmarker = HandLandmarker.create_from_options(options)

cap = cv2.VideoCapture(0)

label = input("Enter gesture label (A,B,C...): ")

file = open(f"dataset_{label}.csv", "a", newline="")
writer = csv.writer(file)

while True:

    ret, frame = cap.read()
    if not ret:
        break

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=frame_rgb
    )

    result = landmarker.detect_for_video(
        mp_image,
        int(cap.get(cv2.CAP_PROP_POS_MSEC))
    )

    if result.hand_landmarks:

        for hand in result.hand_landmarks:

            row = []

            for lm in hand:
                row.extend([lm.x, lm.y, lm.z])

            writer.writerow(row)

            print("Sample saved")

    cv2.imshow("Dataset Collector", frame)

    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
file.close()
cv2.destroyAllWindows()