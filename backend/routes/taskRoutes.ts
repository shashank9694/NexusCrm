import express from "express";
import { getTasks, createTask, updateTaskStatus } from "../controllers/taskController.ts";
import { authenticate } from "../middleware/auth.ts";

export default (io: any) => {
  const router = express.Router();

  router.get("/", authenticate, getTasks);
  router.post("/", authenticate, (req, res) => createTask(req, res, io));
  router.patch("/:id", authenticate, updateTaskStatus);

  return router;
};
