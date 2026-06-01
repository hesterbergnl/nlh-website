import { Link } from "react-router-dom";
import { usePosts, useProjects, useResume } from "@/lib/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminDashboard() {
  const posts = usePosts({ includeDrafts: true });
  const projects = useProjects({ includeDrafts: true });
  const resume = useResume();

  const cards = [
    { to: "/admin/posts", title: "Posts", count: posts.data?.length ?? 0 },
    { to: "/admin/projects", title: "Projects", count: projects.data?.length ?? 0 },
    { to: "/admin/resume", title: "Resume entries", count: resume.data?.length ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Manage everything that powers the site.</p>
      </header>
      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.to} to={c.to}>
            <Card className="hover:bg-accent/40 transition-colors">
              <CardHeader>
                <CardTitle>{c.title}</CardTitle>
                <CardDescription>{c.count} total</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
