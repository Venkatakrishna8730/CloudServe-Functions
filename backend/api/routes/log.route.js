import express from "express";

import withAuth from "../middilewares/auth.middleware.js";
import {
  getLogs,
  clearLogs,
  getLog,
  deleteLog,
} from "../controllers/log.controller.js";

const logsRoute = express.Router();

logsRoute.get("/logs/:functionId", withAuth(getLogs));
logsRoute.delete("/logs/:functionId", withAuth(clearLogs));
logsRoute.get("/logs/:functionId/:logId", withAuth(getLog));
logsRoute.delete("/logs/:functionId/:logId", withAuth(deleteLog));

export default logsRoute;
