"use client"

import { ResourceList } from '@/components/resource-list';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function Home() {
  const queryClient = new QueryClient();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">
          Explore Resources
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover a curated collection of learning materials shared by your peers, ranked by community feedback.
        </p>
      </div>

      <QueryClientProvider client={queryClient}>
        <ResourceList />
      </QueryClientProvider>
    </div>
  );
}
