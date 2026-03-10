import express from "express";
import { getNotifications, markAsRead } from "../controllers/notificationController.ts";
import { authenticate } from "../middleware/auth.ts";

const router = express.Router();

router.get("/", authenticate, getNotifications);
router.patch("/:id/read", authenticate, markAsRead);

export default router;
