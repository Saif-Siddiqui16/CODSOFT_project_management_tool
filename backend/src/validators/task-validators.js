import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),

  description: z.string().optional(),

  status: z.enum(["To Do", "In Progress", "Done"]).default("To Do"),

  priority: z.enum(["High", "Medium", "Low"]).default("Medium"),

  dueDate: z
    .string()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Invalid date format (expected YYYY-MM-DD)"
    )
    .optional(),

  assignees: z
    .array(z.string().min(1, "Assignee ID is required"))
    .optional()
    .default([]),
});
