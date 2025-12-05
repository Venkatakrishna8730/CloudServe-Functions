import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      default: null,
    },
    authType: {
      type: String,
      enum: ["google", "manual"],
      default: "manual",
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    verificationCodeExpires: {
      type: Date,
    },
    usage: {
      executed: { type: Number, default: 0 },
      avgLatency: { type: Number, default: 0 },
      lastExecuted: { type: Date },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
