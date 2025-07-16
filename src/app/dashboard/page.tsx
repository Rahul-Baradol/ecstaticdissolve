"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { getResourcesByAuthor } from "@/lib/db";
import type { Resource } from "@/types";
import { ResourceList } from "@/components/resource-list";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ResourceCard } from "@/components/resource-card";
import { EditResourceDialog } from "@/components/edit-resource-dialog";
import { deleteResourceAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(true);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchResources() {
      if (user?.email) {
        setIsLoadingResources(true);
        const userResources = await getResourcesByAuthor(user.email);
        setResources(userResources);
        setIsLoadingResources(false);
      }
    }
    fetchResources();
  }, [user]);
  
  const handleDelete = async (resourceId: string) => {
    const result = await deleteResourceAction(resourceId);
    if (result.success) {
      toast({ title: "Success", description: "Resource deleted successfully." });
      setResources(resources.filter(r => r.id !== resourceId));
    } else {
      toast({ variant: 'destructive', title: "Error", description: result.error });
    }
  }


  if (loading || !user) {
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
                <ResourceCard key={resource.id} resource={resource}>
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
                setResources(resources.map(r => r.id === updatedResource.id ? {...r, ...updatedResource} : r));
            }}
        />
      )}
    </div>
  );
}
