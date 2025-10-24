import express from "express";
import {
  acceptGenerateInvite,
  acceptInviteByToken,
  createWorkspace,
  deleteWorkspace,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkspaces,
  inviteUserToWorkspace,
  removeMember,
} from "../controllers/workspace-controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/", authMiddleware, createWorkspace);
router.get("/", authMiddleware, getWorkspaces);
router.get("/:workspaceId", authMiddleware, getWorkspaceDetails);

router.post("/:workspaceId/invite", authMiddleware, inviteUserToWorkspace);
router.post("/:workspaceId/invite/accept", authMiddleware, acceptInviteByToken);
router.post(
  "/:workspaceId/accept-generate-invite",
  authMiddleware,
  acceptGenerateInvite
);
router.delete("/:workspaceId/members/:userId", authMiddleware, removeMember);

router.get("/:workspaceId/projects", authMiddleware, getWorkspaceProjects);
router.delete("/:workspaceId", authMiddleware, deleteWorkspace);

export default router;
