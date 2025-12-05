import jwt from "jsonwebtoken";
import User from "../../shared/models/user.model.js";

export const withAuth = (controller) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.token;

      if (!token) {
        return res.status(401).json({ message: "No token found" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;

      return controller(req, res, next);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};

export const withOptionalAuth = (controller) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.token;

      if (!token) {
        // No token, proceed without user
        return controller(req, res, next);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (user) {
        req.user = user;
      }

      return controller(req, res, next);
    } catch (error) {
      // If token is invalid, just proceed without user (treat as guest)
      return controller(req, res, next);
    }
  };
};

export default withAuth;
