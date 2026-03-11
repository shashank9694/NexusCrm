import express from "express";
import { 
  getProjects, 
  createProject, 
  updateProject, 
  assignMembers, 
  addComment, 
  getProjectProgressReport 
} from "../controllers/projectController.ts";
import { authenticate, authorize } from "../middleware/auth.ts";

const router = express.Router();

router.get("/", authenticate, getProjects);
router.get("/report", authenticate, getProjectProgressReport);
router.post("/", authenticate, authorize(['admin', 'manager']), createProject);
router.put("/:id", authenticate, authorize(['admin', 'manager']), updateProject);
router.patch("/:id/assign", authenticate, authorize(['admin', 'manager']), assignMembers);
router.post("/:id/comments", authenticate, authorize(['admin', 'manager']), addComment);

export default router;
