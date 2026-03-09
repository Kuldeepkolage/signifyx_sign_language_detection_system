const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Test route
app.get("/", (req, res) => {
  res.send("Backend working");
});

// Predict route
app.post("/predict", async (req, res) => {
  try {
    const { image } = req.body;

    const response = await axios.post("http://localhost:8000/predict", {
      image: image
    });

    res.json(response.data);

  } catch (error) {
    res.status(500).json({ error: "Prediction failed" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});