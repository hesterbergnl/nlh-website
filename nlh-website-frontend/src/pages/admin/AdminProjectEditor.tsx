import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useProject, useUpsertProject } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { ImageUploader } from "@/components/admin/ImageUploader";

type FormState = {
  title: string;
  slug: string;
  description: string;
  content: string;
  repoUrl: string;
  liveUrl: string;
  coverImageUrl: string | null;
  techTagsText: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
};

const empty: FormState = {
  title: "",
  slug: "",
  description: "",
  content: "",
  repoUrl: "",
  liveUrl: "",
  coverImageUrl: null,
  techTagsText: "",
  featured: false,
  published: true,
  sortOrder: 0,
};

export function AdminProjectEditor() {
  const { id } = useParams<{ id?: string }>();
  const idNum = id ? Number(id) : undefined;
  const existing = useProject(idNum);
  const upsert = useUpsertProject(idNum);
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(empty);

  useEffect(() => {
    if (existing.data) {
      setForm({
        title: existing.data.title,
        slug: existing.data.slug,
        description: existing.data.description,
        content: existing.data.content,
        repoUrl: existing.data.repoUrl ?? "",
        liveUrl: existing.data.liveUrl ?? "",
        coverImageUrl: existing.data.coverImageUrl,
        techTagsText: existing.data.techTags.join(", "),
        featured: existing.data.featured,
        published: existing.data.published,
        sortOrder: existing.data.sortOrder,
      });
    }
  }, [existing.data]);

  async function save() {
    const techTags = form.techTagsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const result = await upsert.mutateAsync({
        title: form.title,
        slug: form.slug || undefined,
        description: form.description,
        content: form.content,
        repoUrl: form.repoUrl || null,
        liveUrl: form.liveUrl || null,
        coverImageUrl: form.coverImageUrl,
        techTags,
        featured: form.featured,
        published: form.published,
        sortOrder: form.sortOrder,
      });
      toast.success(idNum ? "Saved" : "Created");
      if (!idNum) navigate(`/admin/projects/${result.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  }

  if (idNum && existing.isLoading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {idNum ? "Edit project" : "New project"}
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Label htmlFor="featured">Featured</Label>
            <Switch
              id="featured"
              checked={form.featured}
              onCheckedChange={(v) => setForm({ ...form, featured: v })}
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Label htmlFor="published">Published</Label>
            <Switch
              id="published"
              checked={form.published}
              onCheckedChange={(v) => setForm({ ...form, published: v })}
            />
          </div>
          <Button onClick={save} disabled={upsert.isPending || !form.title}>
            {upsert.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="my-project"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="techTags">Tech tags (comma-separated)</Label>
          <Input
            id="techTags"
            value={form.techTagsText}
            onChange={(e) => setForm({ ...form, techTagsText: e.target.value })}
            placeholder="TypeScript, React, Postgres"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="repoUrl">Repository URL</Label>
          <Input
            id="repoUrl"
            value={form.repoUrl}
            onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
            placeholder="https://github.com/…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="liveUrl">Live URL</Label>
          <Input
            id="liveUrl"
            value={form.liveUrl}
            onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
            placeholder="https://…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort order</Label>
          <Input
            id="sortOrder"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
        />
      </div>

      <ImageUploader
        value={form.coverImageUrl}
        onChange={(url) => setForm({ ...form, coverImageUrl: url })}
        label="Cover image"
      />

      <div className="space-y-2">
        <Label>Content</Label>
        <MarkdownEditor
          value={form.content}
          onChange={(v) => setForm({ ...form, content: v })}
        />
      </div>
    </div>
  );
}
