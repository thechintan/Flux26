from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib, numpy as np

app = Flask(__name__)
CORS(app)

model  = joblib.load("model.pkl")
le_cat = joblib.load("le_cat.pkl")
le_sub = joblib.load("le_sub.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    try:
        cat_enc = le_cat.transform([data["main_category"]])[0]
        sub_enc = le_sub.transform([data["sub_category"]])[0]
        qty_log = np.log1p(float(data["quantity_kg"]))

        price = model.predict([[cat_enc, sub_enc, qty_log]])[0]
        return jsonify({ "predicted_price_per_kg": round(float(price), 2) })

    except ValueError as e:
        return jsonify({ "error": f"Unknown category: {str(e)}" }), 400

@app.route("/health", methods=["GET"])
def health():
    return jsonify({ "status": "ok" })

if __name__ == "__main__":
    app.run(port=8000, debug=True)