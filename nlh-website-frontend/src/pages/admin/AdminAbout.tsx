import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSiteSettings, useUpdateSiteSettings } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Trash2, Plus } from "lucide-react";
import type { SocialLink } from "@/lib/types";

type FormState = {
  siteTitle: string;
  headline: string;
  aboutMarkdown: string;
  headshotUrl: string | null;
  socialLinks: SocialLink[];
};

export function AdminAbout() {
  const settings = useSiteSettings();
  const update = useUpdateSiteSettings();
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    if (settings.data && !form) {
      setForm({
        siteTitle: settings.data.siteTitle,
        headline: settings.data.headline,
        aboutMarkdown: settings.data.aboutMarkdown,
        headshotUrl: settings.data.headshotUrl,
        socialLinks: settings.data.socialLinks,
      });
    }
  }, [settings.data, form]);

  if (!form) return <p className="text-muted-foreground">Loading…</p>;

  async function save() {
    if (!form) return;
    try {
      await update.mutateAsync(form);
      toast.success("Saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">About / Site settings</h1>
          <p className="text-muted-foreground">Everything on the About page and site header.</p>
        </div>
        <Button onClick={save} disabled={update.isPending}>
          {update.isPending ? "Saving…" : "Save"}
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="siteTitle">Site title</Label>
          <Input
            id="siteTitle"
            value={form.siteTitle}
            onChange={(e) => setForm({ ...form, siteTitle: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="headline">Headline</Label>
          <Input
            id="headline"
            value={form.headline}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
            placeholder="One-line bio"
          />
        </div>
      </div>

      <ImageUploader
        value={form.headshotUrl}
        onChange={(url) => setForm({ ...form, headshotUrl: url })}
        label="Headshot"
      />

      <div className="space-y-2">
        <Label>About (markdown)</Label>
        <MarkdownEditor
          value={form.aboutMarkdown}
          onChange={(v) => setForm({ ...form, aboutMarkdown: v })}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Social links</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setForm({
                ...form,
                socialLinks: [...form.socialLinks, { label: "", url: "" }],
              })
            }
          >
            <Plus className="h-4 w-4" />
            Add link
          </Button>
        </div>
        <div className="space-y-2">
          {form.socialLinks.map((link, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                placeholder="Label"
                value={link.label}
                onChange={(e) => {
                  const copy = [...form.socialLinks];
                  copy[i] = { ...copy[i]!, label: e.target.value };
                  setForm({ ...form, socialLinks: copy });
                }}
                className="max-w-[180px]"
              />
              <Input
                placeholder="https://…"
                value={link.url}
                onChange={(e) => {
                  const copy = [...form.socialLinks];
                  copy[i] = { ...copy[i]!, url: e.target.value };
                  setForm({ ...form, socialLinks: copy });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  setForm({
                    ...form,
                    socialLinks: form.socialLinks.filter((_, idx) => idx !== i),
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Suppress unused: Textarea is exported just in case future fields need it */}
      <Textarea className="hidden" readOnly value="" />
    </div>
  );
}
