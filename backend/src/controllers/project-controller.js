import asyncHandler from "../middleware/asyncHandler.js";
import Project from "../model/project.js";
import Task from "../model/task.js";
import Workspace from "../model/workspace.js";
import { createProjectSchema } from "../validators/project-validators.js";

export const createProject = asyncHandler(async (req, res) => {
  const parse = createProjectSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: parse.error.errors });
  }

  const { title, description, status, startDate, dueDate, members } =
    parse.data;
  const { workspaceId } = req.params;

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace)
    return res.status(404).json({ message: "Workspace not found" });

  const isMember = workspace.members.some(
    (m) => m.user.toString() === req.user._id.toString()
  );
  if (!isMember)
    return res.status(403).json({ message: "Not a workspace member" });

  const project = await Project.create({
    title,
    description,
    status,
    workspace: workspaceId,
    startDate: startDate ? new Date(startDate) : undefined,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    members,
    createdBy: req.user._id,
  });

  workspace.projects.push(project._id);
  await workspace.save();

  res.status(201).json(project);
});
export const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).populate({
      path: "members.user",
      select: "name email",
    });
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }
    res.status(200).json(project);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate("members.user");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const tasks = await Task.find({
      project: projectId,
      isArchived: false,
    })
      .populate("assignees", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      project,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const listProjectsForWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const projects = await Project.find({
    workspace: workspaceId,
    isArchived: false,
  }).sort({ createdAt: -1 });
  res.json(projects);
});

export const calculateProjectProgress = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  const tasks = await Task.find({ project: projectId, isArchived: false });
  if (tasks.length === 0) {
    project.progress = 0;
  } else {
    const completed = tasks.filter((t) => t.status === "Done").length;
    project.progress = Math.round((completed / tasks.length) * 100);
  }
  await project.save();
  res.json({ progress: project.progress });
});

export const editProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { title, description, status, startDate, dueDate, members } = req.body;

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  const workspace = await Workspace.findById(project.workspace);
  if (!workspace)
    return res.status(404).json({ message: "Workspace not found" });

  const isMember = workspace.members.some(
    (m) => m.user.toString() === req.user._id.toString()
  );
  if (!isMember)
    return res.status(403).json({ message: "Not a workspace member" });

  if (title) project.title = title;
  if (description) project.description = description;
  if (status) project.status = status;
  if (startDate) project.startDate = new Date(startDate);
  if (dueDate) project.dueDate = new Date(dueDate);
  if (members) project.members = members;

  await project.save();
  res.status(200).json(project);
});

export const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  const workspace = await Workspace.findById(project.workspace);
  if (!workspace)
    return res.status(404).json({ message: "Workspace not found" });

  if (project.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Only project creator can delete" });
  }

  await project.deleteOne();

  workspace.projects = workspace.projects.filter(
    (pId) => pId.toString() !== projectId
  );
  await workspace.save();

  res.status(200).json({ message: "Project deleted successfully" });
});
