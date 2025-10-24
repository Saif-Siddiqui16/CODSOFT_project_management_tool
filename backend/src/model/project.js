import mongoose from "mongoose";

const ProjectMemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: {
    type: String,
    enum: ["manager", "contributor", "viewer"],
    default: "contributor",
  },
});

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
    status: {
      type: String,
      enum: ["Planning", "In Progress", "On Hold", "Completed", "Cancelled"],
      default: "Planning",
    },
    startDate: Date,
    dueDate: Date,
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    progress: { type: Number, min: 0, max: 100, default: 0 },
    members: [ProjectMemberSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", ProjectSchema);

export default Project;
