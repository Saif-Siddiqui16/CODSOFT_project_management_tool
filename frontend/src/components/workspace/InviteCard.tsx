import { useAppDispatch } from "@/hooks/hook";
import { inviteUser } from "@/store/workspace/workspace-slice";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface InviteCardProps {
  workspaceId: string;
}

const InviteCard: React.FC<InviteCardProps> = ({ workspaceId }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [visible, setVisible] = useState(false);

  const dispatch = useAppDispatch();
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const showMessage = (msg: string, type: "error" | "success") => {
    clearTimer();
    setIsError(type === "error");
    setMessage(msg);
    setVisible(true);

    timerRef.current = window.setTimeout(() => setVisible(false), 5000);
  };

  const handleInvite = async () => {
    if (!email.trim()) {
      showMessage("Email is required", "error");
      return;
    }

    try {
      setLoading(true);

      const response = await dispatch(inviteUser({ email, role, workspaceId }));

      if (response.meta.requestStatus === "fulfilled") {
        showMessage(
          (response.payload as any)?.message || "Invitation sent successfully!",
          "success"
        );
        setEmail("");
        setRole("member");
      } else {
        showMessage(
          (response.payload as any)?.message || "Failed to send invitation.",
          "error"
        );
      }
    } catch {
      showMessage("An unexpected error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => clearTimer, []);

  return (
    <>
      <Button
        variant="outline"
        className="bg-white hover:bg-gray-100 border"
        onClick={() => setOpen(true)}
      >
        Invite Member
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md w-[90%] max-w-sm">
          <DialogHeader>
            <DialogTitle>Invite a Member</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="inviteEmail">Email</Label>
              <Input
                id="inviteEmail"
                placeholder="Enter member email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="inviteRole">Role</Label>
              <Input
                id="inviteRole"
                placeholder="Role (default: member)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            {/* Smoothly fading message */}
            <p
              className={`text-sm text-center transition-opacity duration-700 ${
                visible ? "opacity-100" : "opacity-0"
              } ${isError ? "text-red-600" : "text-green-600"}`}
            >
              {message}
            </p>
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={loading}>
              {loading ? "Sending..." : "Send Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InviteCard;
