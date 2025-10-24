import CreateProjectCard from "@/components/project/CreateProjectCard";
import InviteCard from "@/components/workspace/InviteCard";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/hook";
import { deleteProject, fetchProjects } from "@/store/project/project-slice";
import type { RootState } from "@/store/store";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const WorkspaceDetailsPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { projects, loading } = useAppSelector(
    (state: RootState) => state.project
  );
  const { user } = useAppSelector((state: RootState) => state.auth);

  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchProjects(workspaceId));
    }
  }, [workspaceId, dispatch]);

  const visibleProjects = useMemo(() => {
    if (!user || !projects) return [];

    const userId = user?._id || user?.id;

    return projects.filter((project) => {
      if (project.createdBy?.toString() === userId) return true;

      return project.members?.some((member) => {
        const memberId =
          typeof member.user === "string" ? member.user : member.user?._id;
        return memberId?.toString() === userId;
      });
    });
  }, [projects, user]);

  const handleDelete = async (projId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    try {
      const res = await dispatch(deleteProject(projId));

      if (res.meta.requestStatus === "fulfilled") {
        setSuccessMessage("✅ Project deleted successfully!");
        if (workspaceId) dispatch(fetchProjects(workspaceId));
      } else {
        setError("❌ Failed to delete project. Please try again.");
      }
    } catch {
      setError("❌ Something went wrong while deleting the project.");
    } finally {
      setTimeout(() => {
        setSuccessMessage("");
        setError("");
      }, 3000);
    }
  };

  if (!workspaceId) {
    return (
      <p className="text-center text-gray-600 mt-10">Workspace ID not found.</p>
    );
  }

  if (!user) {
    return (
      <p className="text-center text-gray-600 mt-10">
        Loading user information...
      </p>
    );
  }

  const userId = user?._id || user?.id;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workspace Details</h1>
        <div className="flex gap-2">
          <CreateProjectCard workspaceId={workspaceId} />
          <InviteCard workspaceId={workspaceId} />
        </div>
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
        <p className="text-gray-600 text-center mt-10">Loading projects...</p>
      ) : visibleProjects.length === 0 ? (
        <p className="text-gray-600 text-center mt-10">No projects found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {visibleProjects.map((project) => {
            const isOwner = project.createdBy?.toString() === userId;

            return (
              <div
                key={project._id}
                className="cursor-pointer bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow"
                onClick={() =>
                  navigate(`/workspace/${workspaceId}/project/${project._id}`)
                }
              >
                <div className="flex justify-between items-start">
                  <h2 className="font-semibold text-lg">{project.title}</h2>
                  {isOwner && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => handleDelete(project._id, e)}
                    >
                      <Trash size={16} />
                    </Button>
                  )}
                </div>

                {project.description && (
                  <p className="text-gray-500 mt-1">{project.description}</p>
                )}
                <p className="text-sm text-gray-400 mt-2">
                  Progress: {project.progress}%
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkspaceDetailsPage;
