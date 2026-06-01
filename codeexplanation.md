# nlh-website — code walkthrough

A guided tour of what's in this repo and why. Written assuming you know React but haven't done much TypeScript, and want to start modifying it yourself.

---

## 1. The big picture

```
nlh-website/
├── nlh-website-backend/    ← Node + Express API on :3001
├── nlh-website-frontend/   ← Vite + React SPA on :5173
└── README.md               ← setup instructions
```

Two separate npm projects, each with their own `package.json`. They talk over HTTP — the frontend `fetch()`s the backend's `/api/*` endpoints. In dev, Vite proxies those calls so you don't have to think about CORS.

**Why split, not Next.js?** You picked monorepo split during planning. Practical effect: you can deploy the API alone (Fly, Railway, your own box) and the frontend as static files (Netlify, Cloudflare Pages) — they don't need to live together. Trade-off: a tiny bit more boilerplate (two `package.json`s, two `tsconfig.json`s).

---

## 2. Backend tour

### 2.1 File layout

```
nlh-website-backend/
├── src/
│   ├── index.ts          ← entry: import app, call listen()
│   ├── app.ts            ← builds the Express app (middleware order)
│   ├── env.ts            ← validates process.env with zod
│   ├── auth.ts           ← configures better-auth
│   ├── db/
│   │   ├── index.ts      ← creates the Drizzle client
│   │   └── schema.ts     ← THE source of truth for all tables
│   ├── middleware/
│   │   ├── requireAdmin.ts   ← gate writes by ADMIN_EMAIL
│   │   └── error.ts          ← centralized error handler
│   ├── routes/
│   │   ├── posts.ts, projects.ts, siteSettings.ts,
│   │   ├── resume.ts, uploads.ts, me.ts
│   └── util/
│       ├── slug.ts          ← title → "url-friendly-slug"
│       └── asyncHandler.ts  ← wraps async route fns so errors bubble
├── tests/
│   └── *.test.ts            ← vitest + supertest
├── drizzle/                 ← generated SQL migrations (commit these)
├── uploads/                 ← user-uploaded images (gitignored)
├── drizzle.config.ts        ← tells drizzle-kit where the schema lives
├── tsconfig.json            ← TypeScript compiler config
├── package.json             ← deps + scripts
└── .env                     ← secrets (gitignored)
```

### 2.2 Boot flow — read top to bottom

**`src/index.ts`** — tiny. Imports `createApp` from app.ts, gets `env.PORT`, calls `listen`.

**`src/app.ts`** — assembles the Express app. The **order matters here**:

```ts
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))   // 1
app.all("/api/auth/*", toNodeHandler(auth))                       // 2 — BEFORE express.json
app.use(express.json({ limit: "1mb" }))                           // 3
app.use("/uploads", express.static(path.resolve(env.UPLOADS_DIR))) // 4
app.use("/api/me", meRouter)                                       // 5
// …more routes
app.use(notFound)                                                  // last
app.use(errorHandler)                                              // last
```

Why is better-auth mounted **before** `express.json()`? Because it parses its own request bodies (it has to handle form-encoded sign-up payloads, JSON, etc.). If `express.json()` consumed the body first, better-auth would see an empty stream.

**Lesson:** Express middleware runs in the order you register it. Mistakes here are the most common source of "why does this work locally but not in prod?" bugs.

### 2.3 `env.ts` — validate the environment with zod

```ts
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().url(),
  // …
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) { console.error(...); process.exit(1); }

export const env = parsed.data;
```

**Two things to note:**

1. `z.coerce.number()` — `process.env.PORT` is a string ("3001"), but we want a number. `coerce` does the conversion.
2. `export const env = parsed.data` — `parsed.data` is now **fully typed**. Hover `env.PORT` in your IDE and TS knows it's `number`, not `string | undefined`. This is huge: anywhere else in the app, you `import { env } from "./env"` and get autocomplete + type errors for typos.

**Why bother?** A missing env var that crashes at hour 3 of running is worse than crashing at boot. Validating at startup gives you immediate, readable errors.

### 2.4 Drizzle schema — `src/db/schema.ts`

This is the heart of the backend. Every table is defined here, **and the TypeScript types for rows are derived from these definitions**.

```ts
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  // …
  published: boolean("published").notNull().default(false),
});

export type Post = typeof posts.$inferSelect;   // shape of a row READ from DB
export type NewPost = typeof posts.$inferInsert; // shape of a row INSERTED
```

**The `$inferSelect` / `$inferInsert` trick:** Drizzle generates the row types from the column definitions. So if you add a column, the `Post` type updates automatically. No duplication between schema and types.

**`pgTable("posts", {...})`:** First arg is the actual SQL table name; second is column definitions. The keys (`slug`, `title`) become both the SQL column name (unless you pass a different name as the first arg to `text()`) and the JS property name.

Example of a custom JSON column:
```ts
techTags: jsonb("tech_tags").$type<string[]>().notNull().default([]),
```
- `jsonb(...)` is a Postgres JSONB column.
- `.$type<string[]>()` tells Drizzle "trust me, the contents are always `string[]`". This is **purely a TS hint** — the DB doesn't enforce it. Be careful here.

### 2.5 The Drizzle client — `src/db/index.ts`

```ts
const client = postgres(env.DATABASE_URL, { max: 10 });
export const db = drizzle(client, { schema });
```

`postgres-js` is the raw driver (network connections). `drizzle()` wraps it and gives you a typed query builder. `{ schema }` passes the schema we defined so `db.query.posts.findFirst(...)` works (the relational query API).

### 2.6 better-auth — `src/auth.ts`

```ts
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema: { user, session, account, verification } }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: true, autoSignIn: true },
  trustedOrigins: [env.FRONTEND_URL],
});
```

What better-auth gives you, in exchange for ~20 lines of config:
- `/api/auth/sign-up/email`, `/api/auth/sign-in/email`, `/api/auth/sign-out`, `/api/auth/get-session` — routes you get for free
- Password hashing (you don't touch bcrypt)
- Session cookies (you don't touch JWT)
- A `useSession()` React hook on the frontend (via `better-auth/react`)

**Admin gate, the simple way** — we don't use better-auth's role system. Instead, `middleware/requireAdmin.ts` checks if the session user's email matches `env.ADMIN_EMAIL`:

```ts
if (session.user.email !== env.ADMIN_EMAIL) {
  res.status(403).json({ error: "Forbidden" });
  return;
}
```

This means only one human can write. To add more admins later, switch to better-auth's `admin` plugin (it adds a `role` column).

### 2.7 Anatomy of a route file — `src/routes/posts.ts`

The structure is the same for every CRUD resource. Walk through this one and the rest will make sense.

```ts
const postInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).default(""),
  content: z.string().default(""),
  category: z.string().max(50).nullable().optional(),
  // …
  published: z.boolean().optional(),
  slug: z.string().min(1).max(100).optional(),
});
```

This is the **input shape** for POST/PATCH. It's NOT the same as the `Post` row type — e.g., `id` and `createdAt` are server-generated, so they aren't valid inputs. `z.optional()` means the field can be missing, `z.nullable()` means it can be `null`.

The handler:

```ts
postsRouter.post(
  "/",
  requireAdmin,                                  // middleware: 401/403 if not admin
  asyncHandler(async (req, res) => {
    const input = postInput.parse(req.body);     // throws ZodError on bad input
    const slug = input.slug ?? slugify(input.title);
    const [row] = await db.insert(posts).values({ ... }).returning();
    res.status(201).json(row);
  }),
);
```

Three things doing real work:
1. **`requireAdmin`** — runs first; if it calls `res.status(401).json(...)` it never calls `next()`, so the handler doesn't run.
2. **`postInput.parse(req.body)`** — if `req.body` doesn't match the zod schema, this throws. Our `errorHandler` (registered last in app.ts) catches `ZodError` and returns a 400 with details. So invalid input always 400s, never 500s.
3. **`db.insert(posts).values({...}).returning()`** — Drizzle's fluent query builder. `.returning()` makes Postgres send back the row it inserted (with the auto-generated `id`, `createdAt`). The `[row]` is destructuring — `returning()` returns an array; we want the first (and only) element.

**The `??` operator** — `input.slug ?? slugify(input.title)` means: use `input.slug` if it's defined, otherwise compute a slug from the title. This is **nullish coalescing**: only falls through on `null` or `undefined`, NOT on `""` or `0`. (Compare to `||`, which falls through on any falsy value — using `||` here would be a bug if you ever wanted an empty slug.)

### 2.8 Tests — `tests/`

There are two backend test files:

- **`tests/health.test.ts`** — boots the app, hits `/api/health`, asserts `{ ok: true }`. Proves the app doesn't crash on boot.
- **`tests/authGate.test.ts`** — proves that POST/PATCH endpoints return 401 when no session is present. **Crucially, it mocks the `db` and `auth` modules with `vi.mock(...)` so the tests don't need a real database.** Read the mock — it's a good example of how to stub a module in vitest.

To add a test: drop a file in `tests/` named `*.test.ts`, import vitest's `describe/it/expect`, and `npm test`.

---

## 3. Frontend tour

### 3.1 File layout

```
nlh-website-frontend/
├── src/
│   ├── main.tsx              ← React entry; sets up providers
│   ├── App.tsx               ← <Routes> table
│   ├── lib/
│   │   ├── types.ts          ← TS types matching backend API shapes
│   │   ├── api.ts            ← fetch wrapper
│   │   ├── auth-client.ts    ← better-auth React client
│   │   ├── queries.ts        ← TanStack Query hooks (useXxx)
│   │   └── utils.ts          ← cn() className helper
│   ├── components/
│   │   ├── ui/               ← shadcn primitives (Button, Card, …)
│   │   ├── layout/SiteLayout.tsx   ← header + footer for public pages
│   │   ├── admin/AdminLayout.tsx   ← sidebar + admin gate
│   │   ├── admin/MarkdownEditor.tsx
│   │   ├── admin/ImageUploader.tsx
│   │   └── Markdown.tsx
│   ├── pages/
│   │   ├── HomePage.tsx, PostPage.tsx, ProjectsPage.tsx, …
│   │   └── admin/AdminDashboard.tsx, AdminPosts.tsx, …
│   ├── styles/
│   │   └── globals.css       ← Tailwind layers + shadcn theme tokens
│   └── test/
│       ├── setup.ts, utils.tsx
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts            ← dev server + proxy
├── vitest.config.ts          ← test runner
└── tsconfig.app.json         ← TS for the React bundle
```

### 3.2 Boot flow

**`src/main.tsx`** — wraps `<App />` in three providers:

```tsx
<QueryClientProvider client={queryClient}>   // TanStack Query — server state
  <BrowserRouter>                            // react-router — URLs
    <App />
  </BrowserRouter>
  <Toaster richColors closeButton />         // sonner — toast notifications
</QueryClientProvider>
```

**`src/App.tsx`** — pure routing table. No logic.

```tsx
<Routes>
  <Route element={<SiteLayout />}>           // public layout: header + footer
    <Route path="/" element={<HomePage />} />
    <Route path="/posts/:slug" element={<PostPage />} />
    // …
  </Route>
  <Route path="/admin" element={<AdminLayout />}>   // admin layout: sidebar + auth gate
    <Route index element={<AdminDashboard />} />
    <Route path="posts" element={<AdminPosts />} />
    <Route path="posts/new" element={<AdminPostEditor />} />
    <Route path="posts/:id" element={<AdminPostEditor />} />
    // …
  </Route>
</Routes>
```

**Layout routes:** `<Route element={<SiteLayout />}>` doesn't have a `path`; it just wraps children. Inside SiteLayout there's an `<Outlet />` where the matched child renders. This is how react-router does shared layouts.

### 3.3 The data layer — three files

This is the part most worth understanding because it'll feel different from how you may have written React 5 years ago.

#### `lib/api.ts` — thin fetch wrapper

```ts
export const api = {
  get:    <T>(path: string)        => request<T>(path),
  post:   <T>(path: string, body?) => request<T>(path, { method: "POST",  body: JSON.stringify(body) }),
  patch:  <T>(path: string, body?) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  del:    <T>(path: string)        => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, fd: FormData) => request<T>(path, { method: "POST", body: fd }),
};
```

**Generics (`<T>`)** — this is TS's most foreign feature if you're new to it. `<T>` is a placeholder for "whatever type the caller is expecting back." When you write `api.get<Post>("/api/posts/hello")`, TS substitutes `T = Post`, so the return type is `Promise<Post>`. Without the generic, every caller would have to cast manually.

Two important behaviors hidden in `request()`:
- `credentials: "include"` — sends session cookies. Without this, better-auth wouldn't know you're logged in.
- It throws `ApiError` (custom class) on non-2xx responses. So TanStack Query catches it and surfaces it as `isError`.

#### `lib/auth-client.ts` — better-auth's React client

```ts
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_BASE_URL ?? window.location.origin,
});
export const { useSession, signIn, signOut } = authClient;
```

That's it. `useSession()` is a React hook that gives you the current logged-in user. `signIn.email({ email, password })` performs login.

#### `lib/queries.ts` — TanStack Query hooks

```ts
export function usePosts(opts?: { includeDrafts?: boolean }) {
  const qs = opts?.includeDrafts ? "?includeDrafts=true" : "";
  return useQuery({
    queryKey: queryKeys.posts(opts),
    queryFn: () => api.get<Post[]>(`/api/posts${qs}`),
  });
}
```

**The TanStack Query mental model**, compared to what you may remember from a `useEffect + fetch` pattern:

| Old way (`useEffect` + state) | TanStack Query |
| --- | --- |
| `const [data, setData] = useState()` | `const { data } = usePosts()` |
| `const [loading, setLoading] = useState(false)` | `const { isLoading } = usePosts()` |
| `const [error, setError] = useState()` | `const { isError, error } = usePosts()` |
| `useEffect(() => { fetch().then(setData) }, [])` | (nothing — `useQuery` does it) |
| "Refetch when X changes" | put X in the `queryKey` |
| "Refetch after a mutation" | `queryClient.invalidateQueries(...)` |

**`queryKey`** is critical — it's how TanStack Query caches. Two components calling `usePosts()` share the same cache entry because the key matches. If you call `usePosts({ includeDrafts: true })` vs `usePosts()`, those are different keys, different cache entries.

**Mutations** (write operations) use `useMutation` instead:

```ts
export function useUpsertPost(id?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) =>
      id == null ? api.post("/api/posts", input) : api.patch(`/api/posts/${id}`, input),
    onSuccess: () => invalidatePosts(qc),   // makes existing usePosts() refetch
  });
}
```

In components, you call it like:
```tsx
const upsert = useUpsertPost(idNum);
// later, on button click:
await upsert.mutateAsync({ title, content });
// `upsert.isPending` is true during the request — use to disable the Save button
```

### 3.4 Component patterns

#### shadcn-style components — `components/ui/`

shadcn isn't a library you install — it's a convention where you **copy components into your own codebase** and own them. Look at `src/components/ui/button.tsx`:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center …base classes…",
  {
    variants: {
      variant: {
        default:     "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive …",
        outline:     "border border-input bg-background …",
        // …
      },
      size: {
        default: "h-10 px-4 py-2",
        sm:      "h-9 rounded-md px-3",
        // …
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
```

**`cva` (class-variance-authority)** is a tiny library that builds className strings based on variant props. It's how `<Button variant="outline" size="sm">` knows which Tailwind classes to apply.

**Why this matters for you:** if the default Button styling annoys you, you don't open `node_modules/` to fix it. You open `src/components/ui/button.tsx` and edit the class strings. The component is yours.

#### The `cn()` helper — `lib/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

`cn("px-4 py-2", isActive && "bg-blue-500", className)` →
- `clsx` lets you pass booleans / arrays / objects and produces a clean string.
- `twMerge` resolves **conflicting Tailwind classes**. If you write `cn("px-4", "px-6")`, it returns `"px-6"` (later wins) instead of both fighting in the cascade. Use this anywhere you pass a `className` prop down.

### 3.5 Walkthrough of one page — `pages/HomePage.tsx`

This is short enough to read all at once:

```tsx
export function HomePage() {
  const settings = useSiteSettings();
  const posts = usePosts();

  return (
    <div className="space-y-12">
      <section>
        <h1>{settings.data?.siteTitle ?? "Hi, I'm Nikolai."}</h1>
        {settings.data?.headline ? <p>{settings.data.headline}</p> : null}
      </section>
      <section>
        <h2>Latest posts</h2>
        {posts.isLoading ? (
          <p>Loading…</p>
        ) : posts.data && posts.data.length > 0 ? (
          <div className="grid …">{posts.data.map((p) => <PostCard … />)}</div>
        ) : (
          <p>No posts yet.</p>
        )}
      </section>
    </div>
  );
}
```

Patterns to notice:
- **`settings.data?.siteTitle`** — the `?.` is optional chaining. If `settings.data` is `undefined` (still loading), it short-circuits to `undefined` instead of crashing.
- **`settings.data?.siteTitle ?? "Hi…"`** — chained: fall back to a default if the chain produced `undefined`.
- **Ternaries for conditional rendering** — `condition ? <A /> : <B />`. The `: null` for "render nothing" is a common React idiom.
- **No `useEffect`, no `useState`** — the data flows from the query hooks. The component is a pure view of the cache. This is the modern React style.

### 3.6 The admin pattern — `components/admin/AdminLayout.tsx`

```tsx
export function AdminLayout() {
  const me = useMe();
  const navigate = useNavigate();

  useEffect(() => {
    if (me.isLoading) return;
    if (!me.data?.isAdmin) navigate("/login", { replace: true });
  }, [me.data, me.isLoading, navigate]);

  if (me.isLoading) return <div>Loading…</div>;
  if (!me.data?.isAdmin) return null;

  return <SidebarLayout>…<Outlet />…</SidebarLayout>;
}
```

This is the **gate**: if you're not logged in as the admin, you bounce to `/login`. The server still enforces the gate (every mutation goes through `requireAdmin`), so this is just UX. Never trust the frontend for auth.

### 3.7 Markdown editor — `components/admin/MarkdownEditor.tsx`

The whole thing is ~30 lines. Two tabs (Write / Preview) using the shadcn Tabs primitive. "Write" is a `<Textarea>`. "Preview" runs the markdown through `react-markdown` + `remark-gfm` (GitHub-flavored markdown — tables, strikethrough, task lists).

If you want a fancier editor later (CodeMirror, syntax highlighting, image drag-and-drop), this is the single file to replace. Nothing else in the app cares how the markdown got produced.

---

## 4. TypeScript patterns you'll see all over

A cheat sheet of things that may look weird at first:

| Pattern | Meaning |
| --- | --- |
| `const x: string \| null = …` | x is either a string or null |
| `x?.foo` | optional chaining — if x is null/undefined, the whole expression is undefined |
| `x ?? "default"` | nullish coalescing — only falls through on null/undefined |
| `x!.foo` | "trust me, x is not null" — escape hatch, use sparingly |
| `x as Foo` | type cast — tells TS to treat x as Foo (no runtime check) |
| `type Foo = typeof posts.$inferSelect` | derive a type from a value |
| `as const` | freeze an object/array's type to its literal values |
| `<T>(arg: T) => …` | generic function — works on any T |
| `React.ComponentPropsWithoutRef<typeof X>` | "the props of X, minus the ref" — used in shadcn forwardRef wrappers |

A useful habit: **hover anything in WebStorm**. The inferred type pops up. If it's `any`, something's leaking — fix it. If it's exactly what you expected, you're good.

---

## 5. How to extend — common modifications

### Add a new field to Posts (e.g., `readingTimeMinutes`)

1. **Backend schema** — `src/db/schema.ts`, add the column to `posts`:
   ```ts
   readingTimeMinutes: integer("reading_time_minutes"),
   ```
2. **Migrate** — `npm run db:generate` (creates a new SQL file in `drizzle/`), then `npm run db:push` to apply.
3. **Backend validation** — `src/routes/posts.ts`, add to `postInput`:
   ```ts
   readingTimeMinutes: z.number().int().nullable().optional(),
   ```
4. **Frontend type** — `src/lib/types.ts`, add `readingTimeMinutes: number | null;` to `Post`.
5. **Frontend editor** — `src/pages/admin/AdminPostEditor.tsx`, add an Input field and pipe it through `form`/`save()`.
6. **Frontend display** — `src/pages/PostPage.tsx`, render `p.readingTimeMinutes` if set.

The TS compiler will scream at every step you skip — that's the value of having end-to-end types.

### Add a new entity (e.g., `Notes`)

The minimal recipe:
1. Add a `notes` table to `db/schema.ts` (model it after `posts`).
2. `npm run db:generate && npm run db:push`.
3. Copy `routes/posts.ts` → `routes/notes.ts`, change names.
4. Mount it in `app.ts` (`app.use("/api/notes", notesRouter)`).
5. Add a `Note` type to `lib/types.ts`.
6. Add `useNotes`, `useNote`, `useUpsertNote`, `useDeleteNote` to `lib/queries.ts` (copy from posts).
7. Copy a page (e.g., `AdminPosts.tsx`) and adapt.
8. Wire routes in `App.tsx`.

It's a lot of files, but each is a 5-line change. The duplication is intentional — it keeps each resource independently editable. Resist refactoring into a generic CRUD until you have 4+ resources.

### Change the visual theme

Edit `src/styles/globals.css` — the `:root` block has all the HSL values shadcn uses (`--primary`, `--background`, `--muted`, …). The `.dark` block is the dark-mode override. Try changing `--primary: 240 5.9% 10%` to e.g. `220 90% 50%` and see what happens.

To enable dark mode toggling, add a class toggle on `<html>` and a `<DarkModeButton>` — Tailwind's `dark:` variants are already wired.

### Add a new route to the site nav

Edit `src/components/layout/SiteLayout.tsx`. There's a `<nav>` block with `<NavItem to="/projects" label="Projects" />` — copy that line.

---

## 6. Things to watch out for

- **better-auth must be mounted before `express.json()`** — see app.ts. Moving lines around here breaks auth silently.
- **Session cookies need `credentials: "include"` on fetch** — already set in `lib/api.ts`, but if you write a raw `fetch()` somewhere, remember.
- **`.env` is gitignored** — re-generate `BETTER_AUTH_SECRET` for any new environment. Don't reuse the dev value in prod.
- **`db:push` is a dev-only convenience** — for production you'd run `db:migrate` against the SQL files in `drizzle/`. The difference: `push` is "make the DB match the schema, figure it out"; `migrate` is "apply these specific files in order." Migrate is auditable.
- **`@/` is an alias for `./src/`** — set up in both `tsconfig.app.json` (so TS resolves it) and `vite.config.ts` (so the bundler resolves it). Both have to agree.
- **The frontend bundle is ~600 KB** — fine for now, but if you want to trim it: lazy-load the admin pages (`React.lazy`) so the public site doesn't ship admin code.

---

## 7. Files to read in order if you're learning the codebase

1. `nlh-website-backend/src/env.ts` — zod + TS in 25 lines
2. `nlh-website-backend/src/db/schema.ts` — Drizzle definitions
3. `nlh-website-backend/src/routes/posts.ts` — one full CRUD resource
4. `nlh-website-frontend/src/lib/queries.ts` — every read/write the frontend does
5. `nlh-website-frontend/src/pages/HomePage.tsx` — simplest "consume queries" example
6. `nlh-website-frontend/src/pages/admin/AdminPostEditor.tsx` — full form, mutation, navigation

That's the spine of the app. Everything else is variation on those patterns.
