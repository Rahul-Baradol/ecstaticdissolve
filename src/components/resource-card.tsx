"use client";

import type { Resource, ResourceClient, User } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowUpRight, Star, UserCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "./ui/button";
import { getResourceByIdAction, starResourceAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface ResourceCardProps {
  user: User | null;
  resource: ResourceClient;
  children?: React.ReactNode;
  updateResourceInCache: (updatedResource: ResourceClient) => void;
}

export function ResourceCard({ user, resource, children, updateResourceInCache }: ResourceCardProps) {
  const { toast } = useToast();

  const handleStarClick = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "You must be logged in to star a resource.",
      });
      return;
    }

    try {
      await starResourceAction(resource.id);
      const updatedResource = await getResourceByIdAction(resource.id);
      updateResourceInCache(updatedResource);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Starring Resource",
        description: "There was an error starring this resource. Please try again later.",
      });
      console.error("Error starring resource:", error);
    }
  };

  return (
    <Card className="flex flex-col h-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-xl font-headline group flex-1 overflow-hidden">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Link
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between"
                  >
                    {resource.title}
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>{resource.url}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={resource.isStarred ? "default" : "outline"}
              size="sm"
              onClick={handleStarClick}
              disabled={!user}
              className="flex items-center gap-2"
            >
              <Star
                className={`h-4 w-4 ${resource.isStarred ? "text-yellow-300 fill-yellow-300" : ""
                  }`}
              />
              <span>{resource.stars}</span>
            </Button>
            {children}
          </div>
        </div>
        <CardDescription className="flex items-center gap-2 text-xs">
          <UserCircle className="h-4 w-4" />
          <span>{resource.authorEmail?.split("@")[0] || "Anonymous"}</span>
          <span>&middot;</span>
          <span>
            Shared{" "}
            {formatDistanceToNow(new Date(resource.createdAt), {
              addSuffix: true,
            })}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {resource.description}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{resource.category}</Badge>
          {resource.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
