import { Link } from "react-router-dom";
import { useProjects } from "@/lib/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProjectsPage() {
  const projects = useProjects();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">Things I've been building.</p>
      </header>
      {projects.isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : projects.data && projects.data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.data.map((p) => (
            <Link key={p.id} to={`/projects/${p.slug}`}>
              <Card className="h-full transition-colors hover:bg-accent/40">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>{p.title}</CardTitle>
                    {p.featured ? <Badge>featured</Badge> : null}
                  </div>
                  {p.description ? <CardDescription>{p.description}</CardDescription> : null}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {p.techTags.map((t) => (
                      <Badge key={t} variant="outline">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No projects yet.</p>
      )}
    </div>
  );
}
