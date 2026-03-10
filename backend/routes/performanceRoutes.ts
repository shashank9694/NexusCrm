import express from "express";
import { getPerformance, createPerformanceReview } from "../controllers/performanceController.ts";
import { authenticate, authorize } from "../middleware/auth.ts";

const router = express.Router();

router.get("/:userId", authenticate, getPerformance);
router.post("/", authenticate, authorize(['admin', 'hr', 'manager']), createPerformanceReview);

export default router;
