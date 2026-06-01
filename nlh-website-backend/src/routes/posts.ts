import { Router } from "express";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { posts } from "../db/schema.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { slugify } from "../util/slug.js";

export const postsRouter = Router();

const postInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).default(""),
  content: z.string().default(""),
  category: z.string().max(50).nullable().optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  published: z.boolean().optional(),
  slug: z.string().min(1).max(100).optional(),
});

// Public: list. Drafts only included if requester is admin.
postsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const includeDrafts = req.query.includeDrafts === "true";
    const rows = await db
      .select()
      .from(posts)
      .where(includeDrafts ? undefined : eq(posts.published, true))
      .orderBy(desc(posts.publishedAt), desc(posts.createdAt));
    res.json(rows);
  }),
);

// Public: by slug or id.
postsRouter.get(
  "/:slugOrId",
  asyncHandler(async (req, res) => {
    const key = req.params.slugOrId!;
    const asNum = Number(key);
    const row = await db.query.posts.findFirst({
      where: Number.isFinite(asNum) ? eq(posts.id, asNum) : eq(posts.slug, key),
    });
    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(row);
  }),
);

postsRouter.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const input = postInput.parse(req.body);
    const slug = input.slug ?? slugify(input.title);
    const published = input.published ?? false;
    const [row] = await db
      .insert(posts)
      .values({
        slug,
        title: input.title,
        description: input.description,
        content: input.content,
        category: input.category ?? null,
        coverImageUrl: input.coverImageUrl ?? null,
        published,
        publishedAt: published ? new Date() : null,
      })
      .returning();
    res.status(201).json(row);
  }),
);

postsRouter.patch(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const input = postInput.partial().parse(req.body);
    const existing = await db.query.posts.findFirst({ where: eq(posts.id, id) });
    if (!existing) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const willPublish =
      input.published === true && !existing.published ? new Date() : existing.publishedAt;
    const [row] = await db
      .update(posts)
      .set({
        ...input,
        publishedAt: input.published === false ? null : willPublish,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning();
    res.json(row);
  }),
);

postsRouter.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const result = await db.delete(posts).where(eq(posts.id, id)).returning({ id: posts.id });
    if (result.length === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).end();
  }),
);

// suppress unused
void and;
