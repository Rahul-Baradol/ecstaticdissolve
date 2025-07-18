"use client";

import { SubmitResourceForm } from "@/components/submit-resource-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { User } from "@/types";

export default function SubmitPage() {
  const router = useRouter();
  const [user, setUser] = useState<null | User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          router.push("/join?redirect=/submit");
        }
      } catch {
        router.push("/join?redirect=/submit");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);

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
