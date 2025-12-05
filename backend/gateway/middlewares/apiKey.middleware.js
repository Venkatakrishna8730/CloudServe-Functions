import User from "../../shared/models/user.model.js";
import crypto from "crypto";

const validateApiKey = (controller) => {
  return async (req, res) => {
    const apiKey = req.headers["api-key"];

    if (!apiKey) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ apiKey });

    if (!user || user.userName !== req.params.userName) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;

    return controller(req, res);
  };
};

export default validateApiKey;
