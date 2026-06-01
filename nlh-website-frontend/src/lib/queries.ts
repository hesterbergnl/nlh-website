import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Me, Post, Project, ResumeEntry, SiteSettings, Upload } from "./types";

export const queryKeys = {
  me: ["me"] as const,
  posts: (opts?: { includeDrafts?: boolean }) =>
    ["posts", opts ?? {}] as const,
  post: (slugOrId: string | number) => ["post", String(slugOrId)] as const,
  projects: (opts?: { includeDrafts?: boolean }) =>
    ["projects", opts ?? {}] as const,
  project: (slugOrId: string | number) => ["project", String(slugOrId)] as const,
  siteSettings: ["site-settings"] as const,
  resume: ["resume"] as const,
  uploads: ["uploads"] as const,
};

export function useMe() {
  return useQuery({ queryKey: queryKeys.me, queryFn: () => api.get<Me>("/api/me") });
}

export function usePosts(opts?: { includeDrafts?: boolean }) {
  const qs = opts?.includeDrafts ? "?includeDrafts=true" : "";
  return useQuery({
    queryKey: queryKeys.posts(opts),
    queryFn: () => api.get<Post[]>(`/api/posts${qs}`),
  });
}

export function usePost(slugOrId: string | number | undefined) {
  return useQuery({
    enabled: slugOrId != null,
    queryKey: queryKeys.post(slugOrId ?? ""),
    queryFn: () => api.get<Post>(`/api/posts/${slugOrId}`),
  });
}

export function useProjects(opts?: { includeDrafts?: boolean }) {
  const qs = opts?.includeDrafts ? "?includeDrafts=true" : "";
  return useQuery({
    queryKey: queryKeys.projects(opts),
    queryFn: () => api.get<Project[]>(`/api/projects${qs}`),
  });
}

export function useProject(slugOrId: string | number | undefined) {
  return useQuery({
    enabled: slugOrId != null,
    queryKey: queryKeys.project(slugOrId ?? ""),
    queryFn: () => api.get<Project>(`/api/projects/${slugOrId}`),
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: queryKeys.siteSettings,
    queryFn: () => api.get<SiteSettings>("/api/site-settings"),
  });
}

export function useResume() {
  return useQuery({ queryKey: queryKeys.resume, queryFn: () => api.get<ResumeEntry[]>("/api/resume") });
}

export function useUploads() {
  return useQuery({ queryKey: queryKeys.uploads, queryFn: () => api.get<Upload[]>("/api/uploads") });
}

/* ── Mutations ────────────────────────────────────────────────────────── */

export function useUpsertPost(id?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Post>) =>
      id == null ? api.post<Post>("/api/posts", input) : api.patch<Post>(`/api/posts/${id}`, input),
    onSuccess: () => invalidatePosts(qc),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del<void>(`/api/posts/${id}`),
    onSuccess: () => invalidatePosts(qc),
  });
}

export function useUpsertProject(id?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Project>) =>
      id == null
        ? api.post<Project>("/api/projects", input)
        : api.patch<Project>(`/api/projects/${id}`, input),
    onSuccess: () => invalidateProjects(qc),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del<void>(`/api/projects/${id}`),
    onSuccess: () => invalidateProjects(qc),
  });
}

export function useUpdateSiteSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<SiteSettings>) =>
      api.patch<SiteSettings>("/api/site-settings", input),
    onSuccess: (data) => qc.setQueryData(queryKeys.siteSettings, data),
  });
}

export function useUpsertResumeEntry(id?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ResumeEntry>) =>
      id == null
        ? api.post<ResumeEntry>("/api/resume", input)
        : api.patch<ResumeEntry>(`/api/resume/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.resume }),
  });
}

export function useDeleteResumeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del<void>(`/api/resume/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.resume }),
  });
}

export function useUploadFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return api.upload<Upload>("/api/uploads", fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.uploads }),
  });
}

function invalidatePosts(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: ["posts"] });
  qc.invalidateQueries({ queryKey: ["post"] });
}
function invalidateProjects(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: ["projects"] });
  qc.invalidateQueries({ queryKey: ["project"] });
}
