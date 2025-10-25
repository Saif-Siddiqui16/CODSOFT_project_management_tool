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
import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";

const WorkspaceInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("tk");
  const { workspaceId } = useParams();

  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const errorTimer = useRef<number | null>(null);
  const successTimer = useRef<number | null>(null);

  const clearTimers = () => {
    if (errorTimer.current) clearTimeout(errorTimer.current);
    if (successTimer.current) clearTimeout(successTimer.current);
  };

  const handleAcceptInvite = async () => {
    if (!token || !workspaceId) {
      setError("Invalid or expired invitation link.");
      return;
    }

    setLoading(true);
    clearTimers();

    try {
      const response = await dispatch(acceptInvite({ token, workspaceId }));

      if (response.meta.requestStatus === "fulfilled") {
        setSuccess("🎉 Invitation accepted!");
        successTimer.current = window.setTimeout(() => setSuccess(""), 5000);
      } else {
        const errMsg =
          (response.payload as string) || "Failed to accept invitation.";
        setError(errMsg);
        errorTimer.current = window.setTimeout(() => setError(""), 5000);
      }
    } catch {
      setError("Something went wrong while accepting the invitation.");
      errorTimer.current = window.setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-md transition-all duration-300">
        <CardHeader>
          <CardTitle>Workspace Invitation</CardTitle>
          <CardDescription>
            {workspaceId
              ? `You’ve been invited to join workspace ${workspaceId}.`
              : "Invalid workspace ID."}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 mt-4">
          {error && (
            <p className="text-red-600 text-center transition-opacity duration-500">
              {error}
            </p>
          )}

          {success && (
            <p className="text-green-600 text-center transition-opacity duration-500">
              {success}
            </p>
          )}

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
