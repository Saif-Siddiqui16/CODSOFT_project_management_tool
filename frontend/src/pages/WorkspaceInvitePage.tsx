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
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [visible, setVisible] = useState(false);

  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleAcceptInvite = async () => {
    if (!token || !workspaceId) {
      setIsError(true);
      setMessage("Invalid or expired invitation link.");
      setVisible(true);
      timerRef.current = window.setTimeout(() => setVisible(false), 5000);
      return;
    }

    setLoading(true);
    clearTimer();

    try {
      const response = await dispatch(acceptInvite({ token, workspaceId }));

      if (response.meta.requestStatus === "fulfilled") {
        setIsError(false);
        setMessage("🎉 Invitation accepted!");
      } else {
        setIsError(true);
        setMessage(
          (response.payload as string) || "Failed to accept invitation."
        );
      }

      setVisible(true);
      timerRef.current = window.setTimeout(() => setVisible(false), 5000);
    } catch {
      setIsError(true);
      setMessage("Something went wrong while accepting the invitation.");
      setVisible(true);
      timerRef.current = window.setTimeout(() => setVisible(false), 5000);
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
          {/* message area always present */}
          <p
            className={`text-center transition-opacity duration-700 ${
              visible ? "opacity-100" : "opacity-0"
            } ${isError ? "text-red-600" : "text-green-600"}`}
          >
            {message}
          </p>

          {!visible && (
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
