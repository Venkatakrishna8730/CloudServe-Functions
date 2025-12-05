import express from "express";

import withAuth from "../middilewares/auth.middleware.js";
import {
  getUsages,
  clearUsages,
  getUsage,
  deleteUsage,
  getAllUsages,
} from "../controllers/usage.controller.js";

const usagesRoute = express.Router();

usagesRoute.get("/usages", withAuth(getAllUsages));
usagesRoute.get("/usages/:functionId", withAuth(getUsages));
usagesRoute.delete("/usages/:functionId", withAuth(clearUsages));
usagesRoute.get("/usages/:functionId/:logId", withAuth(getUsage));
usagesRoute.delete("/usages/:functionId/:logId", withAuth(deleteUsage));

export default usagesRoute;
