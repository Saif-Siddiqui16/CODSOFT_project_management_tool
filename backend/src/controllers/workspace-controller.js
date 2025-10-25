import asyncHandler from "../middleware/asyncHandler.js";
import Workspace from "../model/workspace.js";
import WorkspaceInvite from "../model/workspaceinvite.js";
import User from "../model/user.js";
import jwt from "jsonwebtoken";
import sendMail from "../libs/send-email.js";
import {
  createWorkspaceSchema,
  inviteMemberSchema,
} from "../validators/workspace-validators.js";
import { recordActivity } from "../libs/record-activity.js";
import project from "../model/project.js";
import Project from "../model/project.js";

export const createWorkspace = asyncHandler(async (req, res) => {
  const parse = createWorkspaceSchema.safeParse(req.body);
  if (!parse.success)
    return res.status(400).json({ message: parse.error.errors });

  const { name, description } = parse.data;
  const workspace = await Workspace.create({
    name,
    description,
    owner: req.user._id,
    members: [{ user: req.user._id, role: "owner", joinedAt: new Date() }],
  });

  await recordActivity(
    req.user._id,
    "created_workspace",
    "Workspace",
    workspace._id,
    { name }
  );

  res.status(201).json(workspace);
});

export const getWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({ "members.user": req.user._id })
    .sort({ createdAt: -1 })
    .populate("members.user", "name email");
  res.json(workspaces);
});

export const getWorkspaceDetails = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const workspace = await Workspace.findById(workspaceId).populate(
    "members.user",
    "name email profilePicture"
  );
  if (!workspace)
    return res.status(404).json({ message: "Workspace not found" });
  res.json(workspace);
});

export const getWorkspaceProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user._id,
    }).populate("members.user", "name email profilePicture");

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const projects = await project
      .find({
        workspace: workspaceId,
        isArchived: false,
        members: { $elemMatch: { user: req.user._id } },
      })
      .populate("tasks", "status")
      .sort({ createdAt: -1 });

    res.status(200).json({ projects, workspace });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const inviteUserToWorkspace = asyncHandler(async (req, res) => {
  const parse = inviteMemberSchema.safeParse(req.body);
  if (!parse.success)
    return res.status(400).json({ message: parse.error.errors });

  const { email, role } = parse.data;
  const { workspaceId } = req.params;
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace)
    return res.status(404).json({ message: "Workspace not found" });

  const inviterMember = workspace.members.find(
    (m) => m.user.toString() === req.user._id.toString()
  );

  if (!inviterMember || !["owner", "admin"].includes(inviterMember.role))
    return res.status(403).json({ message: "Not authorized" });
  const existingUser = await User.findOne({ email });
  if (!existingUser) return res.status(400).json({ message: "User not found" });
  const isMember = workspace.members.some(
    (m) => m.user.toString() === existingUser._id.toString()
  );
  if (isMember)
    return res.status(400).json({ message: "User already a member" });

  const existingInvite = await WorkspaceInvite.findOne({
    user: existingUser._id,
    workspaceId,
  });
  if (existingInvite && existingInvite.expiresAt > new Date())
    return res.status(400).json({ message: "User already invited" });
  if (existingInvite && existingInvite.expiresAt < new Date())
    await WorkspaceInvite.deleteOne({ _id: existingInvite._id });

  const inviteToken = jwt.sign(
    { user: existingUser._id, workspaceId, role: role || "member" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.INVITE_JWT_EXPIRES_IN || "7d" }
  );

  await WorkspaceInvite.create({
    user: existingUser._id,
    workspaceId,
    token: inviteToken,
    role: role || "member",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const invitationLink = `${process.env.FRONTEND_URL}/workspace-invite/${workspace._id}?tk=${inviteToken}`;

  await sendMail({
    to: existingUser.email,
    subject: "Workspace invitation",
    html: `<p>You were invited to join <strong>${workspace.name}</strong>.</p>
           <p>Click to accept: <a href="${invitationLink}">${invitationLink}</a></p>`,
  });

  await recordActivity(req.user._id, "added_member", "Workspace", workspaceId, {
    invited: existingUser._id,
  });

  res.json({ message: "Invitation sent" });
});

export const acceptInviteByToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Token required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { user: userId, workspaceId, role } = decoded;

    if (userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Invalid token for this user" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace)
      return res.status(404).json({ message: "Workspace not found" });

    const isMember = workspace.members.some(
      (m) => m.user.toString() === userId.toString()
    );
    if (isMember) return res.status(400).json({ message: "Already a member" });

    workspace.members.push({
      user: userId,
      role: role || "member",
      joinedAt: new Date(),
    });
    await workspace.save();

    await WorkspaceInvite.deleteMany({ workspaceId, user: userId });
    await recordActivity(
      req.user._id,
      "joined_workspace",
      "Workspace",
      workspaceId,
      {}
    );

    res.json({ message: "Invitation accepted" });
  } catch (err) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
});

export const acceptGenerateInvite = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "You are already a member of this workspace",
      });
    }

    workspace.members.push({
      user: req.user._id,
      role: "member",
      joinedAt: new Date(),
    });

    await workspace.save();

    await recordActivity(
      req.user._id,
      "joined_workspace",
      "Workspace",
      workspaceId,
      {
        description: `Joined ${workspace.name} workspace`,
      }
    );

    res.status(200).json({
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const removeMember = asyncHandler(async (req, res) => {
  const { workspaceId, userId } = req.params;
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace)
    return res.status(404).json({ message: "Workspace not found" });

  const inviterMember = workspace.members.find(
    (m) => m.user.toString() === req.user._id.toString()
  );
  if (!inviterMember || !["owner", "admin"].includes(inviterMember.role))
    return res.status(403).json({ message: "Not authorized" });

  workspace.members = workspace.members.filter(
    (m) => m.user.toString() !== userId
  );
  await workspace.save();

  await recordActivity(
    req.user._id,
    "removed_member",
    "Workspace",
    workspaceId,
    { removed: userId }
  );

  res.json({ message: "Member removed", workspace });
});

export const deleteWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    return res.status(404).json({ message: "Workspace not found" });
  }

  if (workspace.owner.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to delete this workspace" });
  }

  await WorkspaceInvite.deleteMany({ workspaceId });

  await Project.deleteMany({ workspace: workspaceId });

  await workspace.deleteOne();

  await recordActivity(
    req.user._id,
    "deleted_workspace",
    "Workspace",
    workspaceId,
    {
      name: workspace.name,
    }
  );

  res.status(200).json({ message: "Workspace deleted successfully" });
});

export const cancelInviteByToken = asyncHandler(async (req, res) => {
  const { workspaceId, token } = req.body;

  if (!workspaceId || !token) {
    return res.status(400).json({ message: "workspaceId and token required" });
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace)
    return res.status(404).json({ message: "Workspace not found" });

  // Check if the requester is owner/admin
  const requester = workspace.members.find(
    (m) => m.user.toString() === req.user._id.toString()
  );
  if (!requester || !["owner", "admin"].includes(requester.role)) {
    return res
      .status(403)
      .json({ message: "Not authorized to cancel invitations" });
  }

  const invite = await WorkspaceInvite.findOne({ workspaceId, token });
  if (!invite) {
    return res
      .status(404)
      .json({ message: "Invitation not found or already used" });
  }

  await invite.deleteOne();

  await recordActivity(
    req.user._id,
    "canceled_invitation",
    "Workspace",
    workspaceId,
    { canceledUser: invite.user }
  );

  res.status(200).json({ message: "Invitation canceled successfully" });
});
