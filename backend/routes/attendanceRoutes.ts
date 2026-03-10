import express from "express";
import { checkIn, checkOut, getMyAttendance, getAllAttendance, getAttendanceStats } from "../controllers/attendanceController.ts";
import { authenticate, authorize } from "../middleware/auth.ts";

const router = express.Router();

router.post("/check-in", authenticate, checkIn);
router.post("/check-out", authenticate, checkOut);
router.get("/me", authenticate, getMyAttendance);
router.get("/all", authenticate, authorize(['admin', 'hr']), getAllAttendance);
router.get("/stats", authenticate, authorize(['admin', 'hr']), getAttendanceStats);

export default router;
