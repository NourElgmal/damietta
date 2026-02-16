/**
 * Main Express app configuration.
 * Exports the configured Express `app` so the Vercel serverless entrypoint can call it.
 */
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import cors from "cors";

import usersRouter from "./routes/users.js";
import inventoryRouter from "./routes/inventory.js";
import reportsRouter from "./routes/reports.js";

dotenv.config();

const app = express();

// Basic security + parsing
app.use(helmet());
app.use(cors());
app.use(express.json());

// Connect to MongoDB using Mongoose
// Connection uses `MONGODB_URI` and optional `MONGODB_DB` from environment.
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(mongoUri)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));
} else {
  console.warn("MONGODB_URI not set — DB disabled until configured");
}

// Routes
app.use("/api/users", usersRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/reports", reportsRouter);

// Basic health check
app.get("/", (req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() }),
);

export default app;
