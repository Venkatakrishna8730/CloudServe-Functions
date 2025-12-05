import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import { executeFunction } from "./sandbox.runner.js";

const app = express();

// Increase payload limit for code/context
app.use(express.json({ limit: "50mb" }));

app.post("/execute", async (req, res) => {
  try {
    const { code, context } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "No code provided",
        logs: [],
      });
    }

    // Execute the code using the existing runner logic
    const result = await executeFunction(code, context || {});
    res.json(result);
  } catch (error) {
    console.error("Sandbox execution error:", error);
    res.status(500).json({
      success: false,
      error: "Internal Sandbox Error",
      logs: [],
    });
  }
});

const PORT = process.env.SANDBOX_PORT || 5002;

app.listen(PORT, () => {
  console.log(`Sandbox Service running on port ${PORT}`);
});
