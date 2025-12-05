import express from "express";
import withAuth from "../middilewares/auth.middleware.js";
import { getApiKeyController, regenerateApiKeyController } from "../controllers/apikey.controller.js";

const apikeyRoute = express.Router();

apikeyRoute.get("/apikey", withAuth(getApiKeyController));
apikeyRoute.post("/apikey/regenerate", withAuth(regenerateApiKeyController));

export default apikeyRoute;