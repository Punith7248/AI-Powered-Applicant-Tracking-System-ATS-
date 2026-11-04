import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.get("/api/health", (req, res) => res.json({ status: "ok", service: "AI ATS API" }));

const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ai_ats")
  .then(() => app.listen(port, () => console.log(`ATS API running on ${port}`)))
  .catch(err => { console.error("MongoDB connection failed:", err.message); process.exit(1); });
