import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "admin", "member", "viewer"]).optional(),
});
