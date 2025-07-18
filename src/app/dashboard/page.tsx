"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Resource } from "@/types";
import { ResourceCard } from "@/components/resource-card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditResourceDialog } from "@/components/edit-resource-dialog";
import { deleteResourceAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<null | { email: string, name: string, image?: string }>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  async function fetchResources() {
    if (user?.email) {
      setIsLoadingResources(true);
      try {
        const res = await fetch('/api/resources-by-author', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        });
        if (res.ok) {
          const data = await res.json();
          setResources(data.resources);
        } else {
          setResources([]);
        }
      } catch {
        setResources([]);
      } finally {
        setIsLoadingResources(false);
      }
    }
  }

  useEffect(() => {
    async function fetchUser() {
      setLoadingUser(true);
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          router.push("/join?redirect=/dashboard");
        }
      } catch {
        router.push("/join?redirect=/dashboard");
      } finally {
        setLoadingUser(false);
      }
    }
    fetchUser();
  }, [router]);

  useEffect(() => {
    fetchResources();
  }, [user]);


  const handleDelete = async (resourceId: string) => {
    const result = await deleteResourceAction(resourceId);
    if (result.success) {
      toast({ title: "Success", description: "Resource deleted successfully." });
      setResources(resources.filter((r) => r.id !== resourceId));
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
  };

  if (loadingUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">
          My Shared Resources
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Here are all the learning materials you've contributed to the community.
        </p>
      </div>
      {isLoadingResources ? (
        <div className="flex justify-center items-center min-h-[20rem]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource) => (
            <ResourceCard user={user} key={resource.id} resource={resource} fetchResources={fetchResources} >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingResource(resource)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your resource.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(resource.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </ResourceCard>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold">No Resources Shared Yet</h2>
          <p className="text-muted-foreground mt-2">
            It looks like you haven't shared any resources. Why not submit one now?
          </p>
          <Button onClick={() => router.push('/submit')} className="mt-4">Submit a Resource</Button>
        </div>
      )}
      {editingResource && (
        <EditResourceDialog
          resource={editingResource}
          isOpen={!!editingResource}
          onClose={() => setEditingResource(null)}
          onResourceUpdated={(updatedResource) => {
            setResources(resources.map(r => r.id === updatedResource.id ? { ...r, ...updatedResource } : r));
          }}
          fetchResources={fetchResources}
        />
      )}
    </div>
  );
}
