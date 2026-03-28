// routes/predict.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/predict-price", async (req, res) => {
    try {
        const { data } = await axios.post("http://localhost:8000/predict", req.body);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "ML service unavailable" });
    }
});

module.exports = router;

// In your app.js:
// app.use("/api", require("./routes/predict"));