import { resourceSchema, updateResourceSchema } from "./schema";

export async function getResourceByIdAction(docId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/resource-by-id?docId=${docId}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) throw new Error();

    const data = await res.json();
    return data.resource;
  } catch (error) {
    console.error("Failed to fetch resource by ID:", error);
    return { error: "Failed to fetch resource. Please try again." };
  }
}

export async function getResourcesAction(docId?: string) {
  try {
    let res;

    if (docId) {
      res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/resources-data?docId=${docId}`, {
        method: "GET",
        cache: "no-store",
      });
    } else {
      res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/resources-data`, {
        method: "GET",
        cache: "no-store",
      });
    }

    if (!res.ok) throw new Error();

    const data = await res.json();
    return data.resources || [];
  } catch (error) {
    console.error("Failed to fetch resources:", error);
    return { error: "Failed to fetch resources. Please try again." };
  }
}

export async function getResourcesByAuthorAction(docId?: string) {
  try {
    let res;

    if (docId) {
      res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/resources-by-author?lastCreatedAt=${docId}`, {
        method: "GET",
        credentials: "include",
      });
    } else {
      res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/resources-by-author`, {
        method: "GET",
        credentials: "include",
      });
    }

    if (!res.ok) throw new Error();

    const data = await res.json();
    return data.resources || [];
  } catch (error) {
    console.error("Failed to fetch resources by author:", error);
    return { error: "Failed to fetch resources by author. Please try again." };
  }
}

export async function submitResourceAction(formData: FormData) {
  const data = {
    title: formData.get("title"),
    description: formData.get("description"),
    url: formData.get("url"),
    category: formData.get("category"),
    tags: formData.getAll("tags[]")
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

  return { success: true };
}

export async function deleteResourceAction(resourceId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/resources/${resourceId}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error();

    return { success: true };
  } catch (error) {
    console.error("Failed to delete resource:", error);
    return { error: "Failed to delete resource. Please try again." };
  }
}

export async function starResourceAction(resourceId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/resources/${resourceId}/star`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) throw new Error();

    return { success: true };
  } catch (error) {
    console.error("Failed to star resource:", error);
    return { error: "Failed to star resource. Please try again." };
  }
}