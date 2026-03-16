import pandas as pd
import glob
from sklearn.ensemble import RandomForestClassifier
import joblib

files = glob.glob("dataset_*.csv")

X = []
y = []

for file in files:

    label = file.split("_")[1].split(".")[0]

    data = pd.read_csv(file, header=None)

    for row in data.values:
        X.append(row)
        y.append(label)

print("Samples:", len(X))

model = RandomForestClassifier()

model.fit(X, y)

joblib.dump(model, "gesture_model.pkl")

print("Model trained and saved as gesture_model.pkl")