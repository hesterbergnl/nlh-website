import { useParams } from "react-router-dom";
import { usePost } from "@/lib/queries";
import { Markdown } from "@/components/Markdown";
import { Badge } from "@/components/ui/badge";

export function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = usePost(slug);

  if (post.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (post.isError || !post.data) return <p>Post not found.</p>;

  const p = post.data;

  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-8 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <time dateTime={p.publishedAt ?? p.createdAt}>
            {new Date(p.publishedAt ?? p.createdAt).toLocaleDateString()}
          </time>
          {p.category ? <Badge variant="secondary">{p.category}</Badge> : null}
        </div>
        <h1 className="text-4xl font-bold tracking-tight">{p.title}</h1>
        {p.description ? (
          <p className="text-lg text-muted-foreground">{p.description}</p>
        ) : null}
        {p.coverImageUrl ? (
          <img src={p.coverImageUrl} alt="" className="rounded-lg w-full" />
        ) : null}
      </header>
      <Markdown>{p.content}</Markdown>
    </article>
  );
}
