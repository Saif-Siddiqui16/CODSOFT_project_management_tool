import asyncHandler from "../middleware/asyncHandler.js";
import Task from "../model/task.js";
import Project from "../model/project.js";
import Workspace from "../model/workspace.js";
import { createTaskSchema } from "../validators/task-validators.js";
import { recordActivity } from "../libs/record-activity.js";
import mongoose from "mongoose";

export const createTask = asyncHandler(async (req, res) => {
  const parse = createTaskSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: parse.error.errors });
  }

  const { title, description, status, priority, dueDate, assignees } =
    parse.data;
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  const workspace = await Workspace.findById(project.workspace);
  if (!workspace)
    return res.status(404).json({ message: "Workspace not found" });

  const isMember = workspace.members.some(
    (member) => member.user.toString() === req.user._id.toString()
  );
  if (!isMember)
    return res
      .status(403)
      .json({ message: "You are not a member of this workspace" });

  const assigneesFormatted = Array.isArray(assignees)
    ? assignees.map((id) => new mongoose.Types.ObjectId(id))
    : [];

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    project: projectId,
    assignees: assigneesFormatted,
    createdBy: req.user._id,
  });

  project.tasks.push(task._id);
  await project.save();

  res.status(201).json(task);
});

export const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId)
    .populate("assignees", "name profilePicture")
    .populate("watchers", "name profilePicture");

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  const project = await Project.findById(task.project).populate(
    "members.user",
    "name profilePicture"
  );

  res.status(200).json({ task, project });
});

export const updateTaskTitle = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title } = req.body;

  const task = await Task.findById(taskId);

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  const project = await Project.findById(task.project);

  if (!project) {
    return res.status(404).json({
      message: "Project not found",
    });
  }

  const isMember = project.members.some(
    (member) => member.user.toString() === req.user._id.toString()
  );

  if (!isMember) {
    return res.status(403).json({
      message: "You are not a member of this project",
    });
  }

  const oldTitle = task.title;

  task.title = title;
  await task.save();

  await recordActivity(req.user._id, "updated_task", "Task", taskId, {
    description: `updated task title from ${oldTitle} to ${title}`,
  });

  res.status(200).json(task);
});

export const updateTaskDescription = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { description } = req.body;

  const task = await Task.findById(taskId);

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  const project = await Project.findById(task.project);

  if (!project) {
    return res.status(404).json({
      message: "Project not found",
    });
  }

  const isMember = project.members.some(
    (member) => member.user.toString() === req.user._id.toString()
  );

  if (!isMember) {
    return res.status(403).json({
      message: "You are not a member of this project",
    });
  }

  const oldDescription =
    task.description.substring(0, 50) +
    (task.description.length > 50 ? "..." : "");
  const newDescription =
    description.substring(0, 50) + (description.length > 50 ? "..." : "");

  task.description = description;
  await task.save();

  await recordActivity(req.user._id, "updated_task", "Task", taskId, {
    description: `updated task description from ${oldDescription} to ${newDescription}`,
  });

  res.status(200).json(task);
});
export const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  const project = await Project.findById(task.project);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const isMember = project.members.some(
    (member) => member.user.toString() === req.user._id.toString()
  );
  if (!isMember) {
    return res.status(403).json({
      message: "You are not a member of this project",
    });
  }

  await task.deleteOne();

  project.tasks = project.tasks.filter((tId) => tId.toString() !== taskId);
  await project.save();

  await recordActivity(req.user._id, "deleted_task", "Task", taskId, {
    description: `deleted task "${task.title}"`,
  });

  res.status(200).json({ message: "Task deleted successfully", taskId });
});

export const listTasksForProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const tasks = await Task.find({ project: projectId, isArchived: false })
    .sort({ createdAt: -1 })
    .populate("assignees", "name email");
  res.json(tasks);
});

export const updateTaskAssignees = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { assignees } = req.body;

  const task = await Task.findById(taskId);

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  const project = await Project.findById(task.project);

  if (!project) {
    return res.status(404).json({
      message: "Project not found",
    });
  }

  const isMember = project.members.some(
    (member) => member.user.toString() === req.user._id.toString()
  );

  if (!isMember) {
    return res.status(403).json({
      message: "You are not a member of this project",
    });
  }

  const oldAssignees = task.assignees;

  task.assignees = assignees;
  await task.save();

  await recordActivity(req.user._id, "updated_task", "Task", taskId, {
    description: `updated task assignees from ${oldAssignees.length} to ${assignees.length}`,
  });

  res.status(200).json(task);
});

export const updateTaskPriority = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { priority } = req.body;

  const task = await Task.findById(taskId);

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  const project = await Project.findById(task.project);

  if (!project) {
    return res.status(404).json({
      message: "Project not found",
    });
  }

  const isMember = project.members.some(
    (member) => member.user.toString() === req.user._id.toString()
  );

  if (!isMember) {
    return res.status(403).json({
      message: "You are not a member of this project",
    });
  }

  const oldPriority = task.priority;

  task.priority = priority;
  await task.save();

  await recordActivity(req.user._id, "updated_task", "Task", taskId, {
    description: `updated task priority from ${oldPriority} to ${priority}`,
  });

  res.status(200).json(task);
});

export const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ assignees: { $in: [req.user._id] } })
    .populate("project", "title workspace")
    .sort({ createdAt: -1 });
  res.status(200).json(tasks);
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  const task = await Task.findById(taskId);

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  const project = await Project.findById(task.project);

  if (!project) {
    return res.status(404).json({
      message: "Project not found",
    });
  }

  const isMember = project.members.some(
    (member) => member.user.toString() === req.user._id.toString()
  );

  if (!isMember) {
    return res.status(403).json({
      message: "You are not a member of this project",
    });
  }

  const oldStatus = task.status;

  task.status = status;
  await task.save();

  await recordActivity(req.user._id, "updated_task", "Task", taskId, {
    description: `updated task status from ${oldStatus} to ${status}`,
  });

  res.status(200).json(task);
});
