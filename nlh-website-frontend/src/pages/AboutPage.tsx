import { useSiteSettings } from "@/lib/queries";
import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui/button";

export function AboutPage() {
  const settings = useSiteSettings();
  if (settings.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  const s = settings.data;
  if (!s) return null;

  const headshot = s.headshotUrl ?? "/headshot.jpeg";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <img
          src={headshot}
          alt="Portrait"
          className="rounded-2xl w-40 h-40 object-cover border"
        />
        <div className="space-y-2 flex-1">
          <h1 className="text-3xl font-bold tracking-tight">About</h1>
          {s.headline ? <p className="text-lg text-muted-foreground">{s.headline}</p> : null}
          {s.socialLinks.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {s.socialLinks.map((link) => (
                <Button key={link.url} asChild variant="outline" size="sm">
                  <a href={link.url} target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {s.aboutMarkdown ? (
        <Markdown>{s.aboutMarkdown}</Markdown>
      ) : (
        <p className="text-muted-foreground">No about section yet — edit it from /admin/about.</p>
      )}
    </div>
  );
}
