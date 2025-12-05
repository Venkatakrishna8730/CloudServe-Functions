import express from "express";
import gatewayController from "./gateway.controller.js";
import validateApiKey from "./middlewares/apiKey.middleware.js";
const gatewayRouter = express.Router();

gatewayRouter.all(
  "/:userName/:functionName",
  validateApiKey(gatewayController)
);

export default gatewayRouter;
