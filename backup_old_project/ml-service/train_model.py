import pandas as pd
import glob
from sklearn.ensemble import RandomForestClassifier
import joblib

X = []
y = []

files = glob.glob("dataset_*.csv")

for file in files:
    
    label = file.split("_")[1].split(".")[0]   # extract label
    
    df = pd.read_csv(file)

    for row in df.values:
        X.append(row)
        y.append(label)

print("Samples:", len(X))

model = RandomForestClassifier(n_estimators=100)

model.fit(X, y)

joblib.dump(model, "gesture_model.pkl")

print("Model trained and saved")