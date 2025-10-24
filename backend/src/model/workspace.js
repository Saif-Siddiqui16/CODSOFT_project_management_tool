import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: {
    type: String,
    enum: ["owner", "admin", "member", "viewer"],
    default: "member",
  },
  joinedAt: { type: Date, default: Date.now },
});

const WorkspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    members: [MemberSchema],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  },
  { timestamps: true }
);

const Workspace = mongoose.model("Workspace", WorkspaceSchema);

export default Workspace;
