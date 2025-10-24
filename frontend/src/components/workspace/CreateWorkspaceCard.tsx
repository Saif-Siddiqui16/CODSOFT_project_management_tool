import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useAppDispatch } from "@/hooks/hook";
import { createWorkspace } from "@/store/workspace/workspace-slice";

const CreateWorkspaceCard = React.memo(() => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useAppDispatch();

  const handleCreateWorkspace = async () => {
    if (!form.name.trim()) return setError("Workspace name is required");
    setLoading(true);
    setError("");

    try {
      const response = await dispatch(createWorkspace(form));
      if (response.payload?.name) {
        setForm({ name: "", description: "" });
        setOpen(false);
      } else {
        setError("Failed to create workspace");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Create Workspace</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a New Workspace</DialogTitle>
            <DialogDescription>
              Add a name for your workspace. You can update it later.
            </DialogDescription>
          </DialogHeader>

          <Card className="mt-4 border-none shadow-none">
            <CardContent className="p-0 space-y-4">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="workspaceName">Workspace Name</Label>
                  <Input
                    id="workspaceName"
                    placeholder="Enter workspace name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Enter description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateWorkspace}
              disabled={!form.name.trim() || loading}
            >
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

export default CreateWorkspaceCard;
