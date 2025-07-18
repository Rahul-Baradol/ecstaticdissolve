export type Resource = {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  category: string;
  authorEmail: string;
  createdAt: Date;
  stars: number;
  starredBy: string[];
};

export type User = {
  email: string;
  name?: string;
  image?: string;
};