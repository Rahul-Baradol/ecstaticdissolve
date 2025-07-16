"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { SubmitResourceForm } from "@/components/submit-resource-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function SubmitPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/submit");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-headline font-bold">Submit a Resource</h1>
        <p className="text-muted-foreground mt-2">
          Share a valuable learning material with the community.
        </p>
      </div>
      <SubmitResourceForm userEmail={user.email!} />
    </div>
  );
}
