import { Button } from "@/components/ui/button";
import CreateWorkspaceCard from "@/components/workspace/CreateWorkspaceCard";
import { useAppDispatch, useAppSelector } from "@/hooks/hook";
import {
  fetchProjectProgress,
  fetchProjects,
} from "@/store/project/project-slice";
import type { RootState } from "@/store/store";
import {
  deleteWorkspace,
  fetchWorkspaces,
} from "@/store/workspace/workspace-slice";
import { Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const WorkspacePage = () => {
  const { workspaces } = useAppSelector((state: RootState) => state.workspace);
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { projects } = useAppSelector((state: RootState) => state.project);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [workspaceProgress, setWorkspaceProgress] = useState<
    Record<string, number>
  >({});
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  useEffect(() => {
    if (workspaces.length > 0) {
      workspaces.forEach((ws) => dispatch(fetchProjects(ws._id)));
    }
  }, [workspaces, dispatch]);

  useEffect(() => {
    const fetchAllProgress = async () => {
      setLoadingProgress(true);
      try {
        const allProgressPromises = projects.map(async (project) => {
          const res: any = await dispatch(fetchProjectProgress(project._id));
          return {
            projectId: project._id,
            workspaceId: project.workspace,
            progress: res.payload?.progress || 0,
          };
        });

        const results = await Promise.all(allProgressPromises);

        const progressMap: Record<string, number[]> = {};
        results.forEach((r) => {
          if (!r.workspaceId) return;
          const wsId = String(r.workspaceId);
          (progressMap[wsId] ??= []).push(r.progress);
        });

        const avgProgress: Record<string, number> = {};
        for (const wsId in progressMap) {
          const arr = progressMap[wsId];
          avgProgress[wsId] = Math.round(
            arr.reduce((a, b) => a + b, 0) / arr.length
          );
        }

        setWorkspaceProgress(avgProgress);
      } finally {
        setLoadingProgress(false);
      }
    };

    if (projects.length > 0) fetchAllProgress();
  }, [projects, dispatch]);

  const handleDelete = async (workspaceId: string) => {
    if (window.confirm("Are you sure you want to delete this workspace?")) {
      const resultAction = await dispatch(deleteWorkspace(workspaceId));

      if (deleteWorkspace.fulfilled.match(resultAction)) {
        dispatch(fetchWorkspaces());
      }
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Workspaces</h1>
        <CreateWorkspaceCard />
      </div>

      {workspaces.length === 0 ? (
        <p className="text-gray-600 text-center mt-20 text-lg">
          No workspaces found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {workspaces.map((workspace) => {
            const progress = workspaceProgress[workspace._id] || 0;
            const isOwner = workspace.owner === user?.id;
            return (
              <div
                key={workspace._id}
                className="relative cursor-pointer bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow"
              >
                <div onClick={() => navigate(`/workspace/${workspace._id}`)}>
                  <h2 className="font-semibold text-lg">{workspace.name}</h2>
                  <p className="text-gray-500 mt-1">{workspace.description}</p>

                  <div className="w-full bg-gray-200 h-3 rounded mt-4">
                    <div
                      className="bg-blue-600 h-3 rounded transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1 text-right">
                    {loadingProgress ? "Loading..." : `${progress}%`}
                  </p>
                </div>

                {isOwner && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(workspace._id);
                    }}
                    variant="destructive"
                    className="absolute top-2 right-2  font-semibold"
                  >
                    <Trash />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkspacePage;
