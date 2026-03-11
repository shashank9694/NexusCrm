import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.ts";
import { authenticate } from "../middleware/auth.ts";

const router = express.Router();

router.get("/stats", authenticate, getDashboardStats);

export default router;
