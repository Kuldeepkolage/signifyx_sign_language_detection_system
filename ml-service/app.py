from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/predict", methods=["GET"])
def predict():
    return jsonify({
        "gesture": "A"
    })

if __name__ == "__main__":
    app.run(port=5000)