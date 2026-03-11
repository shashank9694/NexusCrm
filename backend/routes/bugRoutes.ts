import express from "express";
import { getBugs, createBug, updateBugStatus } from "../controllers/bugController.ts";
import { authenticate } from "../middleware/auth.ts";

export default () => {
  const router = express.Router();

  router.get("/", authenticate, getBugs);
  router.post("/", authenticate, createBug);
  router.patch("/:id/status", authenticate, updateBugStatus);

  return router;
};
