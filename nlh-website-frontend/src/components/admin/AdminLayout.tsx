import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useMe } from "@/lib/queries";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sections = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/posts", label: "Posts", end: false },
  { to: "/admin/projects", label: "Projects", end: false },
  { to: "/admin/about", label: "About", end: true },
  { to: "/admin/resume", label: "Resume", end: true },
];

export function AdminLayout() {
  const me = useMe();
  const navigate = useNavigate();

  useEffect(() => {
    if (me.isLoading) return;
    if (!me.data?.isAdmin) navigate("/login", { replace: true });
  }, [me.data, me.isLoading, navigate]);

  if (me.isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!me.data?.isAdmin) return null;

  return (
    <div className="min-h-screen grid md:grid-cols-[220px_1fr]">
      <aside className="border-b md:border-b-0 md:border-r p-4 md:p-6 space-y-4">
        <Link to="/" className="block font-semibold">
          ← Back to site
        </Link>
        <nav className="flex md:flex-col gap-1 overflow-x-auto">
          {sections.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              end={s.end}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/50",
                )
              }
            >
              {s.label}
            </NavLink>
          ))}
        </nav>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={async () => {
            await signOut();
            window.location.href = "/";
          }}
        >
          Sign out
        </Button>
      </aside>
      <main className="p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}
