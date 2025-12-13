import User from "../../shared/models/user.model.js";
import generateToken from "../../shared/utils/token.util.js";
import { clearCookie, setCookie } from "../../shared/utils/cookie.util.js";
import generateApiKey from "../../shared/utils/apikey.util.js";
import sendVerificationEmail from "../services/email.service.js";

const loginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Account not verified. Please check your email." });
    }

    const token = generateToken(user);
    setCookie(res, token);

    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const signupController = async (req, res) => {
  const { fullName, userName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const existingUserName = await User.findOne({ userName });
    if (existingUserName) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); 

    const newUser = new User({
      fullName,
      userName,
      email,
      password,
      verificationCode,
      verificationCodeExpires,
      isVerified: false,
    });
    newUser.apiKey = generateApiKey();
    await newUser.save();

    await sendVerificationEmail(email, verificationCode);

    return res.status(201).json({ message: "Verification code sent to email" });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifyEmailController = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (
      user.verificationCode !== code ||
      user.verificationCodeExpires < Date.now()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    const token = generateToken(user);
    setCookie(res, token);

    return res
      .status(200)
      .json({ message: "Email verified successfully", token });
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logoutController = async (req, res) => {
  try {
    clearCookie(res);
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMeController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(200).json(null);
    }
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(200).json(null);
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const resendVerificationController = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); 

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    await sendVerificationEmail(email, verificationCode);

    return res.status(200).json({ message: "Verification code sent to email" });
  } catch (error) {
    console.error("Resend verification error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  loginController,
  signupController,
  verifyEmailController,
  logoutController,
  getMeController,
  resendVerificationController,
};
