import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import express from "express";
import cors from "cors";
import connectDB from "../shared/utils/db.util.js";
import { initMinio } from "../shared/services/storage.service.js";
import gatewayRouter from "./gateway.route.js";

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());


app.use("/run", gatewayRouter);

const PORT = process.env.GATEWAY_PORT || 5001;

app.listen(PORT, async () => {
  await connectDB();
  try {
    await initMinio();
  } catch (err) {
    console.error(
      "WARNING: Failed to initialize MinIO in Gateway.",
      err.message
    );
  }
  console.log(`Gateway Service running on port ${PORT}`);
});
