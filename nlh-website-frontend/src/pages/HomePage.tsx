import { Link } from "react-router-dom";
import { usePosts, useSiteSettings } from "@/lib/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function HomePage() {
  const settings = useSiteSettings();
  const posts = usePosts();

  return (
    <div className="space-y-12">
      <section className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">
          {settings.data?.siteTitle ?? "Hi, I'm Nikolai."}
        </h1>
        {settings.data?.headline ? (
          <p className="text-lg text-muted-foreground max-w-2xl">{settings.data.headline}</p>
        ) : (
          <p className="text-lg text-muted-foreground max-w-2xl">
            Engineer. Builder. This is where I write about what I'm working on.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Latest posts</h2>
        </div>
        {posts.isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : posts.data && posts.data.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {posts.data.map((p) => (
              <Link key={p.id} to={`/posts/${p.slug}`} className="block">
                <Card className="h-full transition-colors hover:bg-accent/40">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <time dateTime={p.publishedAt ?? p.createdAt}>
                        {new Date(p.publishedAt ?? p.createdAt).toLocaleDateString()}
                      </time>
                      {p.category ? <Badge variant="secondary">{p.category}</Badge> : null}
                    </div>
                    <CardTitle>{p.title}</CardTitle>
                    {p.description ? <CardDescription>{p.description}</CardDescription> : null}
                  </CardHeader>
                  <CardContent />
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No posts yet — sign in and add one.</p>
        )}
      </section>
    </div>
  );
}
