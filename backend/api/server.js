import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "../shared/utils/db.util.js";

import authRoute from "./routes/auth.route.js";
import functionsRoute from "./routes/function.route.js";
import apikeyRoute from "./routes/apikey.route.js";
import logsRoute from "./routes/log.route.js";
import usagesRoute from "./routes/usage.route.js";

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.API_PORT || 3000;

app.use("/api", authRoute);
app.use("/api", functionsRoute);
app.use("/api", apikeyRoute);
app.use("/api", logsRoute);
app.use("/api", usagesRoute);

import { initMinio } from "../shared/services/storage.service.js";

app.listen(PORT, async () => {
  await connectDB();
  try {
    await initMinio();
  } catch (err) {
    console.error(
      "WARNING: Failed to initialize MinIO. File storage will not work.",
      err.message
    );
  }
  console.log(`Server is running on port ${PORT}`);
});
