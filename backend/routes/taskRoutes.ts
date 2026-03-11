import express from "express";
import { getTasks, createTask, updateTask } from "../controllers/taskController.ts";
import { authenticate } from "../middleware/auth.ts";

export default (io: any) => {
  const router = express.Router();

  router.get("/", authenticate, getTasks);
  router.post("/", authenticate, (req, res) => createTask(req, res, io));
  router.put("/:id", authenticate, updateTask);
  router.patch("/:id", authenticate, updateTask);

  return router;
};
