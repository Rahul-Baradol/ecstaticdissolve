"use client";

import { useState, useMemo, useEffect } from "react";
import type { Resource, User } from "@/types";
import { ResourceCard } from "./resource-card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { getResourcesAction } from "@/lib/actions";

export function ResourceList() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [user, setUser] = useState<null | User>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [mounted, setMounted] = useState(false);

  async function fetchResources() {
    const data: Resource[] = await getResourcesAction();
    setCategories(['All', ...Array.from(new Set(data.map((r: Resource) => r.category)))]);
    setResources(data);
  }

  useEffect(() => {
    setMounted(true); 
    fetchResources();
  }, []);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch {
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesCategory =
        selectedCategory === "All" || resource.category === selectedCategory;
      const matchesSearch =
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [resources, searchTerm, selectedCategory]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-flow-col">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map((resource, index) => (
            <div
              key={resource.id}
              className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${mounted ? index * 50 : 0}ms` }}
            >
              <ResourceCard user={user} resource={resource} fetchResources={fetchResources} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold">No Resources Found</h2>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search or category filters.
          </p>
        </div>
      )}
    </div>
  );
}
