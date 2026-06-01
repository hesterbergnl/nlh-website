import { useParams } from "react-router-dom";
import { ExternalLink, Github } from "lucide-react";
import { useProject } from "@/lib/queries";
import { Markdown } from "@/components/Markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = useProject(slug);

  if (project.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (project.isError || !project.data) return <p>Project not found.</p>;

  const p = project.data;

  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-8 space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">{p.title}</h1>
        {p.description ? <p className="text-lg text-muted-foreground">{p.description}</p> : null}
        <div className="flex flex-wrap gap-1.5">
          {p.techTags.map((t) => (
            <Badge key={t} variant="outline">
              {t}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          {p.repoUrl ? (
            <Button asChild variant="outline" size="sm">
              <a href={p.repoUrl} target="_blank" rel="noreferrer">
                <Github className="h-4 w-4" />
                Code
              </a>
            </Button>
          ) : null}
          {p.liveUrl ? (
            <Button asChild variant="outline" size="sm">
              <a href={p.liveUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Live
              </a>
            </Button>
          ) : null}
        </div>
        {p.coverImageUrl ? (
          <img src={p.coverImageUrl} alt="" className="rounded-lg w-full" />
        ) : null}
      </header>
      <Markdown>{p.content}</Markdown>
    </article>
  );
}
