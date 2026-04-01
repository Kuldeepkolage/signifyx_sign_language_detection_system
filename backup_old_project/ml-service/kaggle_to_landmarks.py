import cv2
import mediapipe as mp
import csv
import os

dataset_path = "dataset"

mp_tasks = mp.tasks
vision = mp_tasks.vision

BaseOptions = mp_tasks.BaseOptions
HandLandmarker = vision.HandLandmarker
HandLandmarkerOptions = vision.HandLandmarkerOptions
VisionRunningMode = vision.RunningMode

options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path="hand_landmarker.task"),
    running_mode=VisionRunningMode.IMAGE,
    num_hands=1
)

landmarker = HandLandmarker.create_from_options(options)

for label in os.listdir(dataset_path):

    label_path = os.path.join(dataset_path, label)

    if not os.path.isdir(label_path):
        continue

    csv_file = open(f"dataset_{label}.csv", "w", newline="")
    writer = csv.writer(csv_file)

    for image_name in os.listdir(label_path):

        image_path = os.path.join(label_path, image_name)

        image = cv2.imread(image_path)
        if image is None:
            continue

        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=image_rgb
        )

        result = landmarker.detect(mp_image)

        if result.hand_landmarks:

            for hand in result.hand_landmarks:

                row = []

                for lm in hand:
                    row.extend([lm.x, lm.y, lm.z])

                writer.writerow(row)

    csv_file.close()
    print(f"{label} dataset created")

print("Conversion complete.")