import express from "express";
import {
  createTask,
  deleteTask,
  getMyTasks,
  getTaskById,
  listTasksForProject,
  updateTaskAssignees,
  updateTaskDescription,
  updateTaskPriority,
  updateTaskStatus,
  updateTaskTitle,
} from "../controllers/task-controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:projectId", authMiddleware, createTask);
router.patch("/status/:taskId", authMiddleware, updateTaskStatus);

router.get("/:projectId/list", authMiddleware, listTasksForProject);

router.put("/:taskId/title", authMiddleware, updateTaskTitle);

router.put("/:taskId/description", authMiddleware, updateTaskDescription);

router.put("/:taskId/assignees", authMiddleware, updateTaskAssignees);

router.put("/:taskId/priority", authMiddleware, updateTaskPriority);
router.delete("/:taskId", authMiddleware, deleteTask);
router.get("/my-tasks", authMiddleware, getMyTasks);

router.get("/:taskId", authMiddleware, getTaskById);

export default router;
