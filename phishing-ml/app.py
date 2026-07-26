from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

model = joblib.load("phishing_model.pkl")
feature_columns = joblib.load("feature_columns.pkl")


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    features = data.get("features")

    if not features or len(features) != len(feature_columns):
        return (
            jsonify(
                {
                    "error": "Expected "
                    + str(len(feature_columns))
                    + " features, got "
                    + str(len(features) if features else 0)
                }
            ),
            400,
        )

    input_array = np.array(features).reshape(1, -1)
    prediction = model.predict(input_array)[0]
    probabilities = model.predict_proba(input_array)[0]

    # probabilities[0] corresponds to class -1 (phishing), probabilities[1] to class 1 (legit)
    # model.classes_ tells us the actual order
    classes = list(model.classes_)
    phishing_index = classes.index(-1)
    phishing_probability = float(probabilities[phishing_index])

    return jsonify(
        {
            "prediction": "phishing" if prediction == -1 else "legitimate",
            "phishing_probability": round(phishing_probability * 100, 2),
        }
    )

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)