import { Link, NavLink, Outlet } from "react-router-dom";
import { useMe } from "@/lib/queries";
import { useSiteSettings } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        cn(
          "text-sm transition-colors hover:text-foreground",
          isActive ? "text-foreground font-medium" : "text-muted-foreground",
        )
      }
    >
      {label}
    </NavLink>
  );
}

export function SiteLayout() {
  const me = useMe();
  const settings = useSiteSettings();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="font-semibold text-lg tracking-tight">
            {settings.data?.siteTitle ?? "nlh"}
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <NavItem to="/" label="Home" />
            <NavItem to="/projects" label="Projects" />
            <NavItem to="/about" label="About" />
            <NavItem to="/resume" label="Resume" />
          </nav>
          <div className="flex items-center gap-2">
            {me.data?.isAdmin ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin">Admin</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await signOut();
                    window.location.href = "/";
                  }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-10">
          <Outlet />
        </div>
      </main>
      <footer className="border-t">
        <div className="container py-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} {settings.data?.siteTitle ?? "nlh"}
        </div>
      </footer>
    </div>
  );
}
