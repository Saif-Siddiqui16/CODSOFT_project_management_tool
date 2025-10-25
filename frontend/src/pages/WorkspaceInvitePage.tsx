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
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const errorTimer = useRef<number | null>(null);
  const successTimer = useRef<number | null>(null);

  const clearTimers = () => {
    if (errorTimer.current) clearTimeout(errorTimer.current);
    if (successTimer.current) clearTimeout(successTimer.current);
  };

  const handleAcceptInvite = async () => {
    if (!token || !workspaceId) {
      setError("Invalid or expired invitation link.");
      setShowError(true);
      errorTimer.current = window.setTimeout(() => setShowError(false), 4800);
      return;
    }

    setLoading(true);
    clearTimers();

    try {
      const response = await dispatch(acceptInvite({ token, workspaceId }));

      if (response.meta.requestStatus === "fulfilled") {
        setSuccess("🎉 Invitation accepted!");
        setShowSuccess(true);
        successTimer.current = window.setTimeout(
          () => setShowSuccess(false),
          4800
        );
      } else {
        const errMsg =
          (response.payload as string) || "Failed to accept invitation.";
        setError(errMsg);
        setShowError(true);
        errorTimer.current = window.setTimeout(() => setShowError(false), 4800);
      }
    } catch {
      setError("Something went wrong while accepting the invitation.");
      setShowError(true);
      errorTimer.current = window.setTimeout(() => setShowError(false), 4800);
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
          {showError && (
            <p
              className={`text-red-600 text-center transition-opacity duration-700 ${
                showError ? "opacity-100" : "opacity-0"
              }`}
            >
              {error}
            </p>
          )}

          {showSuccess && (
            <p
              className={`text-green-600 text-center transition-opacity duration-700 ${
                showSuccess ? "opacity-100" : "opacity-0"
              }`}
            >
              {success}
            </p>
          )}

          {!showSuccess && !showError && (
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
