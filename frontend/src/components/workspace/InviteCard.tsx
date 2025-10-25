import { useAppDispatch } from "@/hooks/hook";
import { inviteUser } from "@/store/workspace/workspace-slice";
import React, { useState } from "react";
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const dispatch = useAppDispatch();

  const showMessage = (message: string, type: "error" | "success") => {
    if (type === "error") setError(message);
    else setSuccess(message);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
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
          response.payload?.message || "Invitation sent successfully!",
          "success"
        );
        setEmail("");
        setRole("member");
        setOpen(false);
      } else {
        showMessage(
          (response.payload as any)?.message || "Failed to send invitation.",
          "error"
        );
        setEmail("");
        setRole("member");
        setOpen(false);
      }
    } catch (err) {
      showMessage("An unexpected error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

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
        <DialogContent className="sm:max-w-md">
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

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
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
