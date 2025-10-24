import express from "express";
import {
  createProject,
  listProjectsForWorkspace,
  calculateProjectProgress,
  getProjectDetails,
  getProjectTasks,
  editProject,
  deleteProject,
} from "../controllers/project-controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:workspaceId", authMiddleware, createProject);
router.get("/:workspaceId/list", authMiddleware, listProjectsForWorkspace);
router.get("/progress/:projectId", authMiddleware, calculateProjectProgress);
router.get("/:projectId", authMiddleware, getProjectDetails);

router.get("/:projectId/tasks", authMiddleware, getProjectTasks);

router.put("/:projectId", authMiddleware, editProject);
router.delete("/:projectId", authMiddleware, deleteProject);
export default router;
