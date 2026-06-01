# nlh-website

Personal site. Everything (posts, projects, about, resume, social links, headshot) is editable from the in-site admin UI — nothing is hardcoded.

## Stack

**Backend** (`nlh-website-backend/`)
- Node + Express 4
- Drizzle ORM + PostgreSQL (via `postgres-js`)
- `better-auth` (email + password, session cookies, single-admin gate via `ADMIN_EMAIL`)
- `multer` for image uploads → served at `/uploads/:filename`
- Zod for input validation
- Vitest + supertest

**Frontend** (`nlh-website-frontend/`)
- React 18 + Vite 6 + TypeScript
- React Router 7
- TanStack Query for server state (no Redux)
- Tailwind CSS + a small set of inlined shadcn/ui components (Button, Card, Dialog, Tabs, …)
- `react-markdown` + `remark-gfm` for rendering posts/projects
- `sonner` for toasts
- Vitest + Testing Library

## First-time setup

```bash
# Backend
cd nlh-website-backend
cp .env.example .env        # then edit DATABASE_URL, BETTER_AUTH_SECRET, ADMIN_EMAIL
npm install
npm run db:push             # applies the Drizzle schema to your Postgres
npm run dev                 # http://localhost:3001

# Frontend (in a second terminal)
cd nlh-website-frontend
npm install
npm run dev                 # http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:3001`, so no `VITE_API_BASE_URL` is needed in dev.

## Create the admin user

`better-auth`'s sign-up endpoint is mounted at `/api/auth/sign-up/email`. Only the user whose email matches `ADMIN_EMAIL` in `.env` will be allowed to perform writes. Bootstrap your own account once:

```bash
curl -X POST http://localhost:3001/api/auth/sign-up/email \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"YOUR_PASSWORD","name":"Your Name"}'
```

Then visit `/login`, sign in, and click "Admin" in the header.

## Where things live

| Concern | Backend route | Frontend page |
| --- | --- | --- |
| Posts (blog) | `GET/POST/PATCH/DELETE /api/posts` | `/posts/:slug`, admin at `/admin/posts` |
| Projects | `GET/POST/PATCH/DELETE /api/projects` | `/projects`, admin at `/admin/projects` |
| About + headline + social links + headshot | `GET/PATCH /api/site-settings` | `/about`, admin at `/admin/about` |
| Resume entries (work/education/skill/certification) | `GET/POST/PATCH/DELETE /api/resume` | `/resume`, admin at `/admin/resume` |
| Image uploads | `POST /api/uploads` (admin) | inline in editors |
| Current session | `GET /api/me` | – |

## Useful scripts

```bash
# Backend
npm run dev                 # tsx watch
npm run build               # tsc → dist/
npm test                    # vitest run
npm run db:generate         # drizzle-kit generate (after schema changes)
npm run db:push             # apply schema (dev-only convenience)
npm run db:studio           # browse the DB in the browser

# Frontend
npm run dev
npm run build               # tsc -b && vite build
npm test
```

## Production notes

- Set `BETTER_AUTH_SECRET` to a strong random string (`openssl rand -hex 32`).
- Set `BETTER_AUTH_URL` and `FRONTEND_URL` to the deployed origins.
- Set `VITE_AUTH_BASE_URL` (frontend) and `VITE_API_BASE_URL` (if API is on a different origin) at build time.
- Put a reverse proxy in front to terminate TLS; better-auth sets `Secure; SameSite=Lax` cookies and they need HTTPS in production.
- Mount a persistent volume for `UPLOADS_DIR` if running in a container.
