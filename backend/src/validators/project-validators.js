import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),

  description: z.string().optional(),

  status: z
    .enum(["Planning", "In Progress", "On Hold", "Completed", "Cancelled"])
    .default("Planning"),

  startDate: z
    .string()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Invalid start date format (expected YYYY-MM-DD)"
    )
    .optional(),

  dueDate: z
    .string()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Invalid due date format (expected YYYY-MM-DD)"
    )
    .optional(),

  members: z
    .array(
      z.object({
        user: z.string().min(1, "User ID is required"),
        role: z
          .enum(["manager", "contributor", "viewer"])
          .optional()
          .default("contributor"),
      })
    )
    .optional()
    .default([]),
});
