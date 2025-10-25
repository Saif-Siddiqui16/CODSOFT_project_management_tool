import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppDispatch } from "@/hooks/hook";
import { acceptInvite, cancelInvite } from "@/store/workspace/workspace-slice";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

const WorkspaceInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("tk");
  const { workspaceId } = useParams();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [visible, setVisible] = useState(false);

  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const showMessage = (msg: string, error = false, redirect?: boolean) => {
    setMessage(msg);
    setIsError(error);
    setVisible(true);

    clearTimer();
    timerRef.current = window.setTimeout(() => {
      setVisible(false);
      if (redirect && workspaceId) navigate(`/workspace/${workspaceId}`);
    }, 3000);
  };

  const handleAcceptInvite = async () => {
    if (!token || !workspaceId) {
      showMessage("Invalid or expired invitation link.", true);
      return;
    }

    setLoading(true);
    try {
      const response = await dispatch(acceptInvite({ workspaceId, token }));

      if (response.meta.requestStatus === "fulfilled") {
        showMessage("🎉 Invitation accepted!", false, true);
      } else {
        showMessage(
          (response.payload as string) || "Failed to accept invitation.",
          true
        );
      }
    } catch {
      showMessage("Something went wrong while accepting the invitation.", true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvite = async () => {
    if (!token || !workspaceId) {
      showMessage("Invalid or expired invitation link.", true);
      return;
    }

    setLoading(true);
    try {
      const response = await dispatch(cancelInvite({ workspaceId, token }));

      if (response.meta.requestStatus === "fulfilled") {
        showMessage("❌ Invitation canceled.", false, true);
      } else {
        showMessage(
          (response.payload as string) || "Failed to cancel invitation.",
          true
        );
      }
    } catch {
      showMessage("Something went wrong while canceling the invitation.", true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => clearTimer, []);

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
          {/* message area */}
          <p
            className={`text-center transition-opacity duration-700 ${
              visible ? "opacity-100" : "opacity-0"
            } ${isError ? "text-red-600" : "text-green-600"}`}
          >
            {message}
          </p>

          {!visible && (
            <>
              <Button
                onClick={handleAcceptInvite}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Processing..." : "Accept Invitation"}
              </Button>
              <Button
                onClick={handleCancelInvite}
                disabled={loading}
                variant="outline"
                className="w-full mt-2"
              >
                {loading ? "Processing..." : "Cancel Invitation"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkspaceInvitePage;
