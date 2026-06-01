import { useState } from "react";
import { toast } from "sonner";
import {
  useDeleteResumeEntry,
  useResume,
  useUpsertResumeEntry,
} from "@/lib/queries";
import type { ResumeEntry, ResumeKind } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

const KINDS: { value: ResumeKind; label: string }[] = [
  { value: "work", label: "Work experience" },
  { value: "education", label: "Education" },
  { value: "skill", label: "Skill" },
  { value: "certification", label: "Certification" },
];

type FormState = {
  kind: ResumeKind;
  title: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  tagsText: string;
  sortOrder: number;
};

const empty: FormState = {
  kind: "work",
  title: "",
  organization: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
  tagsText: "",
  sortOrder: 0,
};

function toForm(entry: ResumeEntry): FormState {
  return {
    kind: entry.kind,
    title: entry.title,
    organization: entry.organization ?? "",
    location: entry.location ?? "",
    startDate: entry.startDate ?? "",
    endDate: entry.endDate ?? "",
    current: entry.current,
    description: entry.description,
    tagsText: entry.tags.join(", "),
    sortOrder: entry.sortOrder,
  };
}

function EntryDialog({
  entry,
  open,
  onOpenChange,
}: {
  entry?: ResumeEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState<FormState>(entry ? toForm(entry) : empty);
  const upsert = useUpsertResumeEntry(entry?.id);

  // Reset when re-opened with a different entry
  const key = entry?.id ?? "new";
  // Keep state synced when prop changes
  useStateSync(form, setForm, key, entry);

  async function save() {
    const tags = form.tagsText.split(",").map((s) => s.trim()).filter(Boolean);
    try {
      await upsert.mutateAsync({
        kind: form.kind,
        title: form.title,
        organization: form.organization || null,
        location: form.location || null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        current: form.current,
        description: form.description,
        tags,
        sortOrder: form.sortOrder,
      });
      toast.success(entry ? "Saved" : "Added");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit entry" : "New entry"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Kind</Label>
            <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v as ResumeKind })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KINDS.map((k) => (
                  <SelectItem key={k.value} value={k.value}>
                    {k.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sort order</Label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Title / role</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Organization</Label>
            <Input
              value={form.organization}
              onChange={(e) => setForm({ ...form, organization: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Start date</Label>
            <Input
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              placeholder="2023 or Jan 2023"
            />
          </div>
          <div className="space-y-2">
            <Label>End date</Label>
            <Input
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              disabled={form.current}
              placeholder="2024 or Mar 2024"
            />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Switch
              id="current"
              checked={form.current}
              onCheckedChange={(v) => setForm({ ...form, current: v })}
            />
            <Label htmlFor="current">Current</Label>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Tags (comma-separated)</Label>
            <Input
              value={form.tagsText}
              onChange={(e) => setForm({ ...form, tagsText: e.target.value })}
              placeholder="TypeScript, React, Postgres"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Description (markdown)</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={6}
              className="font-mono text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={upsert.isPending || !form.title}>
            {upsert.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Tiny hook to reset dialog state when the underlying entry changes.
function useStateSync(
  form: FormState,
  setForm: (s: FormState) => void,
  key: string | number,
  entry?: ResumeEntry,
) {
  const [lastKey, setLastKey] = useState(key);
  if (lastKey !== key) {
    setForm(entry ? toForm(entry) : empty);
    setLastKey(key);
  }
  void form;
}

export function AdminResume() {
  const resume = useResume();
  const del = useDeleteResumeEntry();
  const [editing, setEditing] = useState<ResumeEntry | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);

  function openNew() {
    setEditing(undefined);
    setDialogOpen(true);
  }
  function openEdit(entry: ResumeEntry) {
    setEditing(entry);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume</h1>
          <p className="text-muted-foreground">Work history, education, skills.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" />
              Add entry
            </Button>
          </DialogTrigger>
          <EntryDialog entry={editing} open={dialogOpen} onOpenChange={setDialogOpen} />
        </Dialog>
      </header>

      {resume.isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-6">
          {KINDS.map((k) => {
            const items = (resume.data ?? []).filter((e) => e.kind === k.value);
            if (items.length === 0) return null;
            return (
              <section key={k.value} className="space-y-2">
                <h2 className="font-semibold">{k.label}</h2>
                <div className="rounded-md border divide-y">
                  {items.map((entry) => (
                    <div key={entry.id} className="flex items-start justify-between gap-3 p-4">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="font-medium">{entry.title}</span>
                          {entry.organization ? (
                            <span className="text-sm text-muted-foreground">
                              · {entry.organization}
                            </span>
                          ) : null}
                          {entry.current ? <Badge variant="secondary">current</Badge> : null}
                        </div>
                        {entry.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {entry.tags.map((t) => (
                              <Badge key={t} variant="outline">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(entry)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            if (!confirm(`Delete "${entry.title}"?`)) return;
                            try {
                              await del.mutateAsync(entry.id);
                              toast.success("Deleted");
                            } catch (err) {
                              toast.error(
                                err instanceof Error ? err.message : "Delete failed",
                              );
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
          {resume.data?.length === 0 ? (
            <p className="text-muted-foreground">No entries yet.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
