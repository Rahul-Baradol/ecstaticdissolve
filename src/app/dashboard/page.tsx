"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Resource, ResourceClient } from "@/types";
import { ResourceCard } from "@/components/resource-card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditResourceDialog } from "@/components/edit-resource-dialog";
import { deleteResourceAction, getResourcesByAuthorAction } from "@/lib/actions";
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
import { QueryClient, QueryClientProvider, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

export default function DashboardPageSkeleton() {
  const client = new QueryClient();

  return <QueryClientProvider client={client}>
    <DashboardPage />
  </QueryClientProvider>
}

export function DashboardPage() {
  const queryClient = useQueryClient();

  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<null | { email: string, name: string, image?: string }>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [editingResource, setEditingResource] = useState<ResourceClient | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  async function fetchResources({ pageParam }: { pageParam?: unknown }): Promise<ResourceClient[]> {
    console.log("Fetching resources with pageParam:", pageParam);
    return await getResourcesByAuthorAction(pageParam as string | undefined);
  }

  const updateResourceInCache = (updatedResource: ResourceClient) => {
    queryClient.setQueryData(['resources'], (oldData: any) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page: ResourceClient[]) =>
          page.map((resource) =>
            resource.id === updatedResource.id ? { ...resource, ...updatedResource } : resource
          )
        ),
      };
    });
  };

  const {
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    promise,
    ...result
  } = useInfiniteQuery<ResourceClient[], Error>({
    queryKey: ['resources'],
    queryFn: fetchResources,
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) return undefined; // no more pages
      return lastPage[lastPage.length - 1].createdAt; // pass last doc id as cursor
    },
  })

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
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async (resourceId: string) => {
    const result = await deleteResourceAction(resourceId);
    if (result.success) {
      toast({ title: "Success", description: "Resource deleted successfully." });
      queryClient.setQueryData(['resources'], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: ResourceClient[]) =>
            page.filter((resource) => resource.id !== resourceId)
          ),
        };
      });
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(result.data && result.data.pages[0].length > 0) ? result.data.pages.map(page => page.map((resource, index) => (
              <div
                key={resource.id}
                className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${mounted ? index * 50 : 0}ms` }}
              >
                <ResourceCard user={user} key={resource.id} resource={resource} updateResourceInCache={updateResourceInCache} >
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
              </div>
            ))
        ) : <></>}
      </div>

      {
        !(result.data && result.data.pages[0].length > 0) ? <div className="text-center py-16">
            <h2 className="text-2xl font-semibold">No Resources Shared Yet</h2>
            <p className="text-muted-foreground mt-2">
              It looks like you haven't shared any resources. Why not submit one now?
            </p>
            <Button onClick={() => router.push('/submit')} className="mt-4">Submit a Resource</Button>
          </div> : <></>
      }

      <div ref={loadMoreRef} style={{ height: 1 }} />

      {editingResource && (
        <EditResourceDialog
          resource={editingResource}
          isOpen={!!editingResource}
          onClose={() => setEditingResource(null)}
          updateResourceInCache={updateResourceInCache}
        />
      )}
    </div>
  );
}
