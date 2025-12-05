import { OAuth2Client } from "google-auth-library";
import User from "../../shared/models/user.model.js";
import generateToken from "../../shared/utils/token.util.js";
import { setCookie } from "../../shared/utils/cookie.util.js";
import generateApiKey from "../../shared/utils/apikey.util.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuthController = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "No credential provided" });
    }

    // Frontend sends access_token as 'credential'
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${credential}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user info from Google");
    }

    const payload = await response.json();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (user) {
      if (user.authType !== "google") {
        // Allow login but maybe update authType or just proceed
        // For now, we just proceed.
      }
    } else {
      // Create new user
      const apiKey = generateApiKey();
      let userName = email.split("@")[0];
      let existingUser = await User.findOne({ userName });
      if (existingUser) {
        userName = `${userName}${Math.floor(Math.random() * 1000)}`;
      }

      user = new User({
        fullName: name,
        userName,
        email,
        authType: "google",
        apiKey,
      });
      await user.save();
    }

    const token = generateToken(user);
    setCookie(res, token);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      userName: user.userName,
      email: user.email,
      apiKey: user.apiKey,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
};
