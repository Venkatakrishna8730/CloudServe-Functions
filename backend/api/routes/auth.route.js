import express from "express";
import {
  loginController,
  signupController,
  verifyEmailController,
  logoutController,
  getMeController,
} from "../controllers/auth.controller.js";
import { googleAuthController } from "../controllers/googleAuth.controller.js";
import { withAuth, withOptionalAuth } from "../middilewares/auth.middleware.js";

const authRoute = express.Router();

authRoute.post("/auth/login", loginController);
authRoute.post("/auth/signup", signupController);
authRoute.post("/auth/verify", verifyEmailController);
authRoute.post("/auth/logout", logoutController);
authRoute.get("/auth/me", withOptionalAuth(getMeController));
authRoute.post("/auth/google", googleAuthController);

export default authRoute;
