import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    functionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Function",
      required: true,
    },
    executionId: {
      type: String,
      required: true,
    },
    logs: [
      {
        level: { type: String, enum: ["log", "error", "warn", "info"] },
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["success", "error", "timeout"],
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    memoryUsed: {
      type: Number,
      required: true,
    },
    error: {
      type: String,
    },
  },
  { timestamps: true }
);

logSchema.index({ functionId: 1 });
logSchema.index({ executionId: 1 });

const Log = mongoose.model("Log", logSchema);

export default Log;
