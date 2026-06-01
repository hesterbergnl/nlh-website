import { useResume } from "@/lib/queries";
import { Markdown } from "@/components/Markdown";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ResumeEntry, ResumeKind } from "@/lib/types";

const sections: { kind: ResumeKind; title: string }[] = [
  { kind: "work", title: "Experience" },
  { kind: "education", title: "Education" },
  { kind: "skill", title: "Skills" },
  { kind: "certification", title: "Certifications" },
];

function EntryCard({ entry }: { entry: ResumeEntry }) {
  const dateRange = [entry.startDate, entry.current ? "Present" : entry.endDate]
    .filter(Boolean)
    .join(" – ");

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
        <div>
          <h3 className="font-semibold">{entry.title}</h3>
          {entry.organization ? (
            <p className="text-sm text-muted-foreground">
              {entry.organization}
              {entry.location ? ` · ${entry.location}` : ""}
            </p>
          ) : null}
        </div>
        {dateRange ? (
          <p className="text-sm text-muted-foreground whitespace-nowrap">{dateRange}</p>
        ) : null}
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
      {entry.description ? <Markdown>{entry.description}</Markdown> : null}
    </div>
  );
}

export function ResumePage() {
  const resume = useResume();
  if (resume.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  const entries = resume.data ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Resume</h1>
      </header>
      {sections.map((section) => {
        const items = entries.filter((e) => e.kind === section.kind);
        if (items.length === 0) return null;
        return (
          <section key={section.kind} className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
            <div className="space-y-6">
              {items.map((entry, idx) => (
                <div key={entry.id}>
                  <EntryCard entry={entry} />
                  {idx < items.length - 1 ? <Separator className="mt-6" /> : null}
                </div>
              ))}
            </div>
          </section>
        );
      })}
      {entries.length === 0 ? (
        <p className="text-muted-foreground">
          No resume entries yet — add them from /admin/resume.
        </p>
      ) : null}
    </div>
  );
}
