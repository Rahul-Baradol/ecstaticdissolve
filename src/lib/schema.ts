import { z } from "zod";

export const resourceSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  url: z.string().url("Please enter a valid URL."),
  category: z.string().min(1, "Please select a category."),
  tags: z.array(z.string()).min(1, "Please add at least one tag."),
  authorEmail: z.string().email().optional(),
  reviewed: z.boolean().optional(), 
});

export const updateResourceSchema = resourceSchema.omit({ url: true, authorEmail: true });