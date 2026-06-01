// API shapes mirror the backend (kept in sync manually; small enough not to
// warrant codegen at this size).

export type Post = {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string | null;
  coverImageUrl: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  repoUrl: string | null;
  liveUrl: string | null;
  coverImageUrl: string | null;
  techTags: string[];
  featured: boolean;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SocialLink = { label: string; url: string };

export type SiteSettings = {
  id: number;
  siteTitle: string;
  headline: string;
  aboutMarkdown: string;
  headshotUrl: string | null;
  socialLinks: SocialLink[];
  updatedAt: string;
};

export type ResumeKind = "work" | "education" | "skill" | "certification";

export type ResumeEntry = {
  id: number;
  kind: ResumeKind;
  title: string;
  organization: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  description: string;
  tags: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Upload = {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
};

export type Me = {
  user: { id: string; email: string; name: string } | null;
  isAdmin: boolean;
};
