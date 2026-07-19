const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Welcome to HireFlow AI Backend");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "HireFlow AI Backend Running"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});