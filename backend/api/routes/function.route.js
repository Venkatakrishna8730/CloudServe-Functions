import express from "express";
import withAuth from "../middilewares/auth.middleware.js";
import {
  functionDeploy,
  getFunctions,
  getFunctionWithId,
  deleteFunction,
  updateFunction,
  redeployFunction,
} from "../controllers/function.controller.js";

const functionsRoute = express.Router();

functionsRoute.post("/functions/deploy", withAuth(functionDeploy));
functionsRoute.get("/functions", withAuth(getFunctions));
functionsRoute.get("/functions/:id", withAuth(getFunctionWithId));
functionsRoute.put("/functions/:id", withAuth(updateFunction));
functionsRoute.delete("/functions/:id", withAuth(deleteFunction));
functionsRoute.post("/functions/:id/redeploy", withAuth(redeployFunction));

export default functionsRoute;
