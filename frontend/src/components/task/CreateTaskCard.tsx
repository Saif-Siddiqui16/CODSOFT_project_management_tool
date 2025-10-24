import React, { useState, useCallback, useEffect } from "react";
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
import { Textarea } from "../ui/textarea";
import { useAppDispatch } from "@/hooks/hook";
import { createTask, fetchTasks } from "@/store/task/task-slice";
import {
  fetchProjectDetails,
  type Project,
} from "@/store/project/project-slice";

interface CreateTaskCardProps {
  projectId: string;
}

const CreateTaskCard: React.FC<CreateTaskCardProps> = ({ projectId }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    title: string;
    description: string;
    status: "To Do" | "In Progress" | "Done";
    priority: "Low" | "Medium" | "High";
    dueDate: string;
  }>({
    title: "",
    description: "",
    status: "To Do",
    priority: "Medium",
    dueDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<
    { user: { _id: string; name?: string; email?: string }; role: string }[]
  >([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  const dispatch = useAppDispatch();

  const handleChange = useCallback(
    (field: keyof typeof form, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleToggleAssignee = useCallback((userId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const handleCreateTask = useCallback(async () => {
    if (!form.title.trim()) {
      setError("Task title is required");
      return;
    }

    if (members.length === 0) {
      setError("Invite members before creating a task.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await dispatch(
        createTask({
          projectId,
          title: form.title,
          description: form.description,
          status: form.status,
          priority: form.priority,
          dueDate: form.dueDate || undefined,
          assignees: selectedAssignees,
        })
      );

      if (response.meta.requestStatus === "fulfilled") {
        setForm({
          title: "",
          description: "",
          status: "To Do",
          priority: "Medium",
          dueDate: "",
        });
        setSelectedAssignees([]);
        setOpen(false);
        dispatch(fetchTasks(projectId));
      } else {
        setError("Failed to create task");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [dispatch, form, projectId, selectedAssignees, members.length]);

  useEffect(() => {
    if (!open) return;
    const fetchMembers = async () => {
      const response = await dispatch(fetchProjectDetails(projectId));

      const project = response.payload as Project | undefined;
      const membersData = project?.members || [];
      setMembers(membersData);
    };
    fetchMembers();
  }, [dispatch, open, projectId]);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Create Task</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto p-4">
          <DialogHeader>
            <DialogTitle>Create a New Task</DialogTitle>
            <DialogDescription>
              Fill out the task details and assign it to project members.
            </DialogDescription>
          </DialogHeader>

          <Card className="mt-4 border-none shadow-none">
            <CardContent className="p-0 space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Task title"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Task description"
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
                    className="border rounded p-2"
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Done</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    className="border rounded p-2"
                    value={form.priority}
                    onChange={(e) => handleChange("priority", e.target.value)}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    type="date"
                    id="dueDate"
                    value={form.dueDate}
                    onChange={(e) => handleChange("dueDate", e.target.value)}
                  />
                </div>

                {members.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <Label>Assign Members</Label>
                    <div className="flex flex-col gap-1 border rounded p-2">
                      {members.map((m) => (
                        <label
                          key={m.user._id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedAssignees.includes(m.user._id)}
                            onChange={() => handleToggleAssignee(m.user._id)}
                          />
                          <span>
                            {m.user.name || m.user.email || m.user._id}{" "}
                            <span className="text-xs text-gray-500">
                              ({m.role})
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-red-600">
                    No members yet. Invite members before creating a task.
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
              onClick={handleCreateTask}
              disabled={!form.title.trim() || loading || members.length === 0}
            >
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default React.memo(CreateTaskCard);
