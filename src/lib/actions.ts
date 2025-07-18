// "use server"

// import { revalidatePath } from "next/cache";
import { resourceSchema, updateResourceSchema } from "./schema";

export async function getResourcesAction() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/resources-data`, {
      method: "GET",
      cache: "no-store",
    });
    
    if (!res.ok) throw new Error();
    
    const data = await res.json();
    return data.resources || [];
  } catch (error) {
    console.error("Failed to fetch resources:", error);
    return { error: "Failed to fetch resources. Please try again." };
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validatedFields.data),
    });

    if (!res.ok) throw new Error();
  } catch (error) {
    return {
      errors: { _form: ["Failed to add resource. Please try again."] },
    };
  }

  // revalidatePath("/");
  // revalidatePath("/dashboard");
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/resources/${resourceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validatedFields.data),
    });

    if (!res.ok) throw new Error();
  } catch (error) {
    return {
      errors: { _form: ["Failed to update resource. Please try again."] },
    };
  }

  // revalidatePath("/");
  // revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteResourceAction(resourceId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/resources/${resourceId}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error();

    // revalidatePath("/");
    // revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete resource:", error);
    return { error: "Failed to delete resource. Please try again." };
  }
}

export async function starResourceAction(resourceId: string, userId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/resources/${resourceId}/star`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
      credentials: "include",
    });

    if (!res.ok) throw new Error();

    // revalidatePath("/");
    // revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to star resource:", error);
    return { error: "Failed to star resource. Please try again." };
  }
}