import React, { useEffect, useState, useCallback } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useAppDispatch } from "@/hooks/hook";
import { fetchWorkspaceProjects } from "@/store/workspace/workspace-slice";
import { createProject } from "@/store/project/project-slice";

interface CreateProjectCardProps {
  workspaceId: string;
}

const CreateProjectCard: React.FC<CreateProjectCardProps> = ({
  workspaceId,
}) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "Planning" as
      | "Planning"
      | "In Progress"
      | "On Hold"
      | "Completed"
      | "Cancelled",
    startDate: "",
    dueDate: "",
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [members, setMembers] = useState<
    { user: { _id: string; name: string; email?: string }; role: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchMembers = async () => {
      const result = await dispatch(fetchWorkspaceProjects(workspaceId));
      if (result.payload?.workspace?.members) {
        setMembers(result.payload.workspace.members);
      }
    };
    fetchMembers();
  }, [dispatch, workspaceId]);

  const handleChange = useCallback(
    (field: string, value: string) =>
      setForm((prev) => ({ ...prev, [field]: value })),
    []
  );

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreateProject = useCallback(async () => {
    if (!form.title.trim()) return setError("Project title is required");

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const membersForBackend = selectedMembers.map((id) => ({
        user: id,
        role: "contributor",
      }));

      const response = await dispatch(
        createProject({
          workspaceId,
          title: form.title,
          description: form.description,
          startDate: form.startDate,
          dueDate: form.dueDate,
          status: form.status,
          members: membersForBackend,
        })
      );

      if (response.type.endsWith("/fulfilled")) {
        setSuccessMessage("✅ Project created successfully!");
        setForm({
          title: "",
          description: "",
          status: "Planning",
          startDate: "",
          dueDate: "",
        });
        setSelectedMembers([]);
        dispatch(fetchWorkspaceProjects(workspaceId));

        setTimeout(() => {
          setSuccessMessage("");
          setOpen(false);
        }, 3000);
      } else {
        setError("❌ Failed to create project. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [dispatch, form, selectedMembers, workspaceId]);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Create Project</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto p-4">
          <DialogHeader>
            <DialogTitle>Create a New Project</DialogTitle>
            <DialogDescription>
              Add a title, description, optional start/due dates, select status,
              and members.
            </DialogDescription>
          </DialogHeader>

          <Card className="mt-4 border-none shadow-none">
            <CardContent className="p-0 space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter project title"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Enter description"
                    value={form.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="border p-2 rounded"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => handleChange("dueDate", e.target.value)}
                  />
                </div>

                {members.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <Label>Members</Label>
                    <div className="flex flex-col gap-1 border rounded p-2 max-h-40 overflow-y-auto">
                      {members.map((m) => (
                        <label
                          key={m.user._id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(m.user._id)}
                            onChange={() => toggleMember(m.user._id)}
                          />
                          <span>
                            {m.user.name}{" "}
                            {m.user.email && (
                              <span className="text-xs text-gray-500">
                                ({m.user.email})
                              </span>
                            )}{" "}
                            ({m.role})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {successMessage && (
                  <p className="text-green-600 text-sm font-medium">
                    {successMessage}
                  </p>
                )}

                {error && <p className="text-red-600 text-sm">{error}</p>}
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="sticky bottom-0 bg-white pt-4 space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!form.title.trim() || loading}
            >
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default React.memo(CreateProjectCard);
