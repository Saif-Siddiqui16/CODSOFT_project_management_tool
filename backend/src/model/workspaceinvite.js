import mongoose from "mongoose";

const WorkspaceInviteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
    token: { type: String },
    role: {
      type: String,
      enum: ["admin", "member", "viewer"],
      default: "member",
    },
    expiresAt: Date,
  },
  { timestamps: true }
);

const WorkspaceInvite = mongoose.model(
  "WorkspaceInvite",
  WorkspaceInviteSchema
);

export default WorkspaceInvite;
