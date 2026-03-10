import express from "express";
import { getActivityLogs } from "../controllers/activityController.ts";
import { authenticate, authorize } from "../middleware/auth.ts";

const router = express.Router();

router.get("/", authenticate, authorize(['admin']), getActivityLogs);

export default router;
