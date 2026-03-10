import express from "express";
import { applyLeave, getLeaves, updateLeaveStatus } from "../controllers/leaveController.ts";
import { authenticate, authorize } from "../middleware/auth.ts";

const router = express.Router();

router.post("/", authenticate, applyLeave);
router.get("/", authenticate, getLeaves);
router.patch("/:id", authenticate, authorize(['admin', 'hr', 'manager']), updateLeaveStatus);

export default router;
