import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useDeleteProject, useProjects } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

export function AdminProjects() {
  const projects = useProjects({ includeDrafts: true });
  const del = useDeleteProject();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">All projects — drafts included.</p>
        </div>
        <Button asChild>
          <Link to="/admin/projects/new">New project</Link>
        </Button>
      </header>
      <div className="rounded-md border divide-y">
        {(projects.data ?? []).map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4 gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  to={`/admin/projects/${p.id}`}
                  className="font-medium hover:underline truncate"
                >
                  {p.title}
                </Link>
                {p.featured ? <Badge>featured</Badge> : null}
                {p.published ? null : <Badge variant="outline">draft</Badge>}
              </div>
              <p className="text-sm text-muted-foreground truncate">{p.description}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                if (!confirm(`Delete "${p.title}"?`)) return;
                try {
                  await del.mutateAsync(p.id);
                  toast.success("Deleted");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Delete failed");
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {projects.data?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No projects yet.</div>
        ) : null}
      </div>
    </div>
  );
}
