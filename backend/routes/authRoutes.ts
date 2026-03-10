import express from "express";
import { login, getUsers, createUser, updateUser, getProfile, changePassword } from "../controllers/userController.ts";
import { authenticate, authorize } from "../middleware/auth.ts";

const router = express.Router();

router.post("/login", login);
router.get("/users", authenticate, getUsers);
router.post("/users", authenticate, authorize(['admin', 'hr']), createUser);
router.patch("/users/:id", authenticate, authorize(['admin', 'hr']), updateUser);
router.get("/profile", authenticate, getProfile);
router.post("/change-password", authenticate, changePassword);

export default router;
