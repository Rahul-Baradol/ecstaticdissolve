"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { submitResourceAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  url: z.string().url("Please enter a valid URL."),
  category: z.string({ required_error: "Please select a category." }),
  tags: z.array(z.string()).min(1, "Please add at least one tag."),
});

type FormValues = z.infer<typeof formSchema>;

const categories = ["Web Development", "Machine Learning", "Systems", "Languages", "Databases", "DevOps"];

export function SubmitResourceForm({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      url: "",
      tags: [],
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
    formData.append('authorEmail', userEmail);
    
    const result = await submitResourceAction(formData);
    setIsSubmitting(false);

    if (result?.errors) {
       toast({ variant: "destructive", title: "Submission Error", description: "Please check the form for errors." });
    } else if (result?.success) {
      toast({ title: "Success!", description: "Your resource has been submitted." });
      router.push("/");
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The Official React Docs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/resource" {...field} />
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
                    <Textarea placeholder="A short summary of what this resource is about." className="min-h-[100px]" {...field} />
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
              <FormDescription>
                Add relevant tags to help others find your resource.
              </FormDescription>
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

            <CardFooter className="p-0 pt-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isSubmitting ? "Submitting..." : "Submit Resource"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
