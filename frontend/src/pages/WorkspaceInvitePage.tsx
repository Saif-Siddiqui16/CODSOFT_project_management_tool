import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppDispatch } from "@/hooks/hook";
import { acceptInvite } from "@/store/workspace/workspace-slice";
import React, { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

const WorkspaceInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("tk");
  const { workspaceId } = useParams();

  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleAcceptInvite = async () => {
    if (!token || !workspaceId) {
      setError("Invalid invitation link.");
      return;
    }

    setLoading(true);
    try {
      const response = await dispatch(acceptInvite({ token, workspaceId }));
      if (response.meta.requestStatus === "fulfilled") {
        setSuccess("Invitation accepted!");
      } else {
        setError(
          (response.payload as string) || "Failed to accept invitation."
        );
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle>Workspace Invitation</CardTitle>
          <CardDescription>
            {workspaceId
              ? `You have been invited to join workspace ${workspaceId}.`
              : "Invalid workspace."}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 mt-4">
          {error && <p className="text-red-600 text-center">{error}</p>}
          {success && <p className="text-green-600 text-center">{success}</p>}

          {!success && !error && (
            <Button
              onClick={handleAcceptInvite}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Accepting..." : "Accept Invitation"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkspaceInvitePage;
