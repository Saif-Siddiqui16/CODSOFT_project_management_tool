import CreateTaskCard from "@/components/task/CreateTaskCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/hooks/hook";
import {
  fetchProjectDetails,
  type Project,
} from "@/store/project/project-slice";
import {
  deleteTask,
  fetchTasks,
  updateTaskAssignees,
  updateTaskDescription,
  updateTaskPriority,
  updateTaskStatus,
  updateTaskTitle,
  type Task,
} from "@/store/task/task-slice";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ProjectDetailsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  const { tasks, loading } = useAppSelector((state) => state.task);
  const { user } = useAppSelector((state) => state.auth);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "",
    priority: "",
  });
  const [members, setMembers] = useState<
    { _id: string; name: string; email?: string }[]
  >([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (projectId) dispatch(fetchTasks(projectId));
  }, [projectId, dispatch]);

  useEffect(() => {
    if (!projectId) return;
    const fetchMembers = async () => {
      const response = await dispatch(fetchProjectDetails(projectId));
      const projectData = response.payload as Project | undefined;
      const membersData = projectData?.members || [];
      setMembers(
        membersData.map((m: any) => ({
          _id: m.user._id,
          name: m.user.name,
          email: m.user.email,
        }))
      );
    };
    fetchMembers();
  }, [dispatch, projectId]);

  if (!projectId) return <p>Project not found</p>;

  const projectTasks = projectId ? tasks[projectId] || [] : [];

  const visibleTasks = projectTasks.filter((task) => {
    const isAssignee = task.assignees?.includes(user?._id || "");
    const isCreator = task.createdBy === user?._id;
    return isAssignee || isCreator;
  });

  const handleDelete = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await dispatch(deleteTask(taskId));
      if (res.meta.requestStatus === "fulfilled") {
        setSuccessMessage("✅ Task deleted successfully!");
        dispatch(fetchTasks(projectId!));
      } else {
        setError("❌ Failed to delete task.");
      }
    } catch {
      setError("Something went wrong while deleting the task.");
    } finally {
      setTimeout(() => {
        setSuccessMessage("");
        setError("");
      }, 3000);
    }
  };

  const handleEdit = (task: Task) => {
    const isCreator = task.createdBy === user?._id;

    setSelectedTask(task);
    setEditForm({
      title: isCreator ? task.title : "",
      description: isCreator ? task.description || "" : "",
      status: task.status,
      priority: isCreator ? task.priority : "",
    });

    setSelectedAssignees(task.assignees || []);
    setOpen(true);
  };

  const toggleAssignee = (id: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!selectedTask) return;

    const isCreator = selectedTask.createdBy === user?._id;
    const isAssignee = selectedTask.assignees?.includes(user?._id || "");

    try {
      if (isCreator) {
        await Promise.all([
          editForm.title !== selectedTask.title &&
            dispatch(
              updateTaskTitle({
                taskId: selectedTask._id,
                title: editForm.title,
              })
            ),
          editForm.description !== selectedTask.description &&
            dispatch(
              updateTaskDescription({
                taskId: selectedTask._id,
                description: editForm.description,
              })
            ),
          editForm.priority !== selectedTask.priority &&
            dispatch(
              updateTaskPriority({
                taskId: selectedTask._id,
                priority: editForm.priority,
              })
            ),
          editForm.status !== selectedTask.status &&
            dispatch(
              updateTaskStatus({
                taskId: selectedTask._id,
                status: editForm.status,
              })
            ),
          JSON.stringify(selectedAssignees) !==
            JSON.stringify(selectedTask.assignees) &&
            dispatch(
              updateTaskAssignees({
                taskId: selectedTask._id,
                assignees: selectedAssignees,
              })
            ),
        ]);
      } else if (isAssignee && editForm.status !== selectedTask.status) {
        await dispatch(
          updateTaskStatus({
            taskId: selectedTask._id,
            status: editForm.status,
          })
        );
      }

      setSuccessMessage("✅ Task updated successfully!");
      setOpen(false);
      dispatch(fetchTasks(projectId!));
    } catch {
      setError("❌ Failed to update the task.");
    } finally {
      setTimeout(() => {
        setSuccessMessage("");
        setError("");
      }, 3000);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Project Details</h1>
        <CreateTaskCard projectId={projectId} />
      </div>

      {(successMessage || error) && (
        <div className="text-center mb-4">
          {successMessage && (
            <p className="text-green-600 font-medium">{successMessage}</p>
          )}
          {error && <p className="text-red-600 font-medium">{error}</p>}
        </div>
      )}

      {loading ? (
        <p className="text-gray-600 mt-10 text-center">Loading tasks...</p>
      ) : visibleTasks.length === 0 ? (
        <p className="text-gray-600 mt-10 text-center">
          No tasks available for you.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleTasks.map((task: Task) => {
            const isCreator = task.createdBy === user?._id;
            const isAssignee = task.assignees?.includes(user?._id || "");

            return (
              <div
                key={task._id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold">{task.title}</h2>

                  {(isCreator || isAssignee) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(task)}
                    >
                      Edit
                    </Button>
                  )}

                  {isCreator && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(task._id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>

                {task.description && (
                  <p className="text-gray-500 mt-1">{task.description}</p>
                )}

                <p className="text-sm text-gray-400 mt-2">
                  Status: {task.status}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedTask && selectedTask.createdBy === user?._id ? (
              <>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <select
                    className="border rounded p-2 w-full"
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Done</option>
                  </select>
                </div>

                <div>
                  <Label>Priority</Label>
                  <select
                    className="border rounded p-2 w-full"
                    value={editForm.priority}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                <div>
                  <Label>Assignees</Label>
                  <div className="flex flex-col gap-1 border rounded p-2 max-h-40 overflow-y-auto">
                    {members.map((m) => (
                      <label
                        key={m._id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAssignees.includes(m._id)}
                          onChange={() => toggleAssignee(m._id)}
                        />
                        <span>
                          {m.name}{" "}
                          {m.email && (
                            <span className="text-xs text-gray-500">
                              ({m.email})
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <Label>Status</Label>
                <select
                  className="border rounded p-2 w-full"
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetailsPage;
