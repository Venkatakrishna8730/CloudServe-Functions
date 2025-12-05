import "./env.js";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "5d",
  });
  return token;
};

export default generateToken;
