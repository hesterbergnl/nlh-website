import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useUpsertPost, usePost } from "@/lib/queries";
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
  category: string;
  coverImageUrl: string | null;
  published: boolean;
};

const empty: FormState = {
  title: "",
  slug: "",
  description: "",
  content: "",
  category: "",
  coverImageUrl: null,
  published: false,
};

export function AdminPostEditor() {
  const { id } = useParams<{ id?: string }>();
  const idNum = id ? Number(id) : undefined;
  const existing = usePost(idNum);
  const navigate = useNavigate();
  const upsert = useUpsertPost(idNum);
  const [form, setForm] = useState<FormState>(empty);

  useEffect(() => {
    if (existing.data) {
      setForm({
        title: existing.data.title,
        slug: existing.data.slug,
        description: existing.data.description,
        content: existing.data.content,
        category: existing.data.category ?? "",
        coverImageUrl: existing.data.coverImageUrl,
        published: existing.data.published,
      });
    }
  }, [existing.data]);

  async function save() {
    try {
      const result = await upsert.mutateAsync({
        title: form.title,
        slug: form.slug || undefined,
        description: form.description,
        content: form.content,
        category: form.category || null,
        coverImageUrl: form.coverImageUrl,
        published: form.published,
      });
      toast.success(idNum ? "Saved" : "Created");
      if (!idNum) navigate(`/admin/posts/${result.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  }

  if (idNum && existing.isLoading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{idNum ? "Edit post" : "New post"}</h1>
        <div className="flex items-center gap-3">
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
          <Label htmlFor="slug">Slug (optional — auto-generated from title)</Label>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="my-post"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="essay, tutorial, log…"
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
