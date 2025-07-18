"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateResourceAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import type { Resource } from "@/types";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  category: z.string({ required_error: "Please select a category." }),
  tags: z.array(z.string()).min(1, "Please add at least one tag."),
});

type FormValues = z.infer<typeof formSchema>;

const categories = ["Web Development", "Machine Learning", "Systems", "Languages", "Databases", "DevOps"];

interface EditResourceDialogProps {
  resource: Resource;
  isOpen: boolean;
  onClose: () => void;
  onResourceUpdated: (resource: Partial<Resource>) => void;
  fetchResources: () => Promise<void>;
}

export function EditResourceDialog({ resource, isOpen, onClose, onResourceUpdated, fetchResources }: EditResourceDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: resource.title,
      description: resource.description,
      category: resource.category,
      tags: resource.tags,
    },
  });

  const { watch, setValue } = form;
  const tags = watch("tags");
  
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      const newTags = Array.from(new Set([...tags, tagInput.trim().toLowerCase()]));
      setValue("tags", newTags, { shouldValidate: true });
      setTagInput("");
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setValue("tags", newTags, { shouldValidate: true });
  }

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'tags' && Array.isArray(value)) {
        value.forEach(tag => formData.append('tags[]', tag));
      } else {
        formData.append(key, String(value));
      }
    });
    
    const result = await updateResourceAction(resource.id, formData);
    setIsSubmitting(false);

    if (result?.errors) {
       toast({ variant: "destructive", title: "Update Error", description: "Please check the form for errors." });
    } else if (result?.success) {
      toast({ title: "Success!", description: "Your resource has been updated." });
      // onResourceUpdated(values);
      fetchResources();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Edit Resource</DialogTitle>
                <DialogDescription>
                    Make changes to your shared resource here. Click save when you're done.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                        <Textarea className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="flex gap-2">
                        <Input
                        placeholder="Type a tag and press Enter"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        />
                        
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                        </Badge>
                        ))}
                    </div>
                    <FormMessage>{form.formState.errors.tags?.message}</FormMessage>
                </FormItem>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save changes
                    </Button>
                </DialogFooter>
            </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}