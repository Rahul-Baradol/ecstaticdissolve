export type Resource = {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  category: string;
  authorEmail?: string;
  createdAt: Date;
  stars: number;
  starredBy: string[];
};
