import mongoose from "mongoose";

const usageSchema = new mongoose.Schema(
  {
    functionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Function",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    executionId: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    memoryUsed: {
      type: Number,
      default: 0, 
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["success", "error"],
      default: "success",
    },
    error: {
      type: String,
    },
  },
  { timestamps: true }
);

usageSchema.index({ functionId: 1 });
usageSchema.index({ userId: 1 });

const Usage = mongoose.model("Usage", usageSchema);

export default Usage;
