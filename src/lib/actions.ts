"use server";

import { z } from "zod";
import { suggestResourceTags } from "@/ai/flows/suggest-resource-tags";
import { addResource, deleteResource, starResource, updateResource } from "./db";
import { revalidatePath } from "next/cache";

const resourceSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  url: z.string().url("Please enter a valid URL."),
  category: z.string().min(1, "Please select a category."),
  tags: z.array(z.string()).min(1, "Please add at least one tag."),
  authorEmail: z.string().email().optional(),
});

const updateResourceSchema = resourceSchema.omit({ url: true, authorEmail: true });


export async function suggestTagsAction(title: string, description: string) {
  if (!title || !description) {
    return { error: "Title and description are required to suggest tags." };
  }
  try {
    const result = await suggestResourceTags({
      resourceTitle: title,
      resourceDescription: description,
    });
    return { tags: result.suggestedTags };
  } catch (error) {
    console.error(error);
    return { error: "Failed to suggest tags. Please try again." };
  }
}

export async function submitResourceAction(formData: FormData) {
  const data = {
    title: formData.get("title"),
    description: formData.get("description"),
    url: formData.get("url"),
    category: formData.get("category"),
    tags: formData.getAll("tags[]"),
    authorEmail: formData.get("authorEmail"),
  };

  const validatedFields = resourceSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await addResource(validatedFields.data);
  } catch (error) {
    return {
      errors: { _form: ["Failed to add resource. Please try again."] },
    };
  }
  
  revalidatePath("/");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateResourceAction(resourceId: string, formData: FormData) {
  const data = {
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    tags: formData.getAll("tags[]"),
  };

  const validatedFields = updateResourceSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await updateResource(resourceId, validatedFields.data);
  } catch(error) {
    return {
      errors: { _form: ["Failed to update resource. Please try again."] },
    };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteResourceAction(resourceId: string) {
    try {
        await deleteResource(resourceId);
        revalidatePath("/");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete resource:", error);
        return { error: "Failed to delete resource. Please try again." };
    }
}

export async function starResourceAction(resourceId: string, userId: string) {
  try {
    await starResource(resourceId, userId);
    revalidatePath("/");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Failed to star resource:", error);
    return { error: "Failed to star resource. Please try again." };
  }
}
