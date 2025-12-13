import mongoose from "mongoose";

const functionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["pending", "deploying", "active", "failed"],
      default: "pending",
    },
    deployError: {
      type: String,
    },
    deployedAt: {
      type: Date,
    },
    
    sourcePath: {
      type: String,
      required: true,
    },
    bundlePath: {
      type: String,
      required: true,
    },
    sourceHash: {
      type: String,
      required: true,
    },
    bundleHash: {
      type: String,
      required: false,
    },
    depHash: {
      type: String,
      required: false,
    },
    endpoint: {
      type: String,
      required: true,
      unique: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    stats: {
      executed: { type: Number, default: 0 },
      errors: { type: Number, default: 0 },
      avgLatency: { type: Number, default: 0 },
      avgMemory: { type: Number, default: 0 },
      lastExecuted: { type: Date },
    },
  },
  { timestamps: true }
);

const Function = mongoose.model("Function", functionSchema);

export default Function;
