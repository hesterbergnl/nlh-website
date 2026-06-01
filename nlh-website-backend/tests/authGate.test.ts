import "./setup";
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";

// We don't want these tests to hit a real database — mock the db module so
// requireAdmin can return 401 without anything underneath being touched.
vi.mock("../src/db/index.js", () => {
  const noop = () => ({
    from: () => ({ where: () => ({ orderBy: () => [] }) }),
    set: () => ({ where: () => ({ returning: () => [] }) }),
    values: () => ({ returning: () => [] }),
    where: () => ({ returning: () => [] }),
  });
  return {
    db: {
      select: () => noop(),
      insert: () => noop(),
      update: () => noop(),
      delete: () => noop(),
      query: {
        posts: { findFirst: async () => undefined },
        projects: { findFirst: async () => undefined },
        siteSettings: { findFirst: async () => undefined },
      },
    },
    schema: {},
  };
});

// Mock better-auth's session getter so writes look unauthenticated.
vi.mock("../src/auth.js", () => ({
  auth: {
    api: { getSession: async () => null },
    handler: async () => new Response(null, { status: 404 }),
  },
}));

describe("admin gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /api/posts without session → 401", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/posts")
      .send({ title: "Hi", description: "x", content: "y" });
    expect(res.status).toBe(401);
  });

  it("PATCH /api/site-settings without session → 401", async () => {
    const app = createApp();
    const res = await request(app)
      .patch("/api/site-settings")
      .send({ headline: "Hello" });
    expect(res.status).toBe(401);
  });

  it("POST /api/projects without session → 401", async () => {
    const app = createApp();
    const res = await request(app).post("/api/projects").send({ title: "Hi" });
    expect(res.status).toBe(401);
  });
});
