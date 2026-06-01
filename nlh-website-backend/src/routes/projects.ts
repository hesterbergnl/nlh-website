import { Router } from "express";
import { z } from "zod";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { projects } from "../db/schema.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { slugify } from "../util/slug.js";

export const projectsRouter = Router();

const projectInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).default(""),
  content: z.string().default(""),
  repoUrl: z.string().url().nullable().optional(),
  liveUrl: z.string().url().nullable().optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  techTags: z.array(z.string().max(40)).max(20).default([]),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
  slug: z.string().min(1).max(100).optional(),
});

projectsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const includeDrafts = req.query.includeDrafts === "true";
    const rows = await db
      .select()
      .from(projects)
      .where(includeDrafts ? undefined : eq(projects.published, true))
      .orderBy(asc(projects.sortOrder), desc(projects.createdAt));
    res.json(rows);
  }),
);

projectsRouter.get(
  "/:slugOrId",
  asyncHandler(async (req, res) => {
    const key = req.params.slugOrId!;
    const asNum = Number(key);
    const row = await db.query.projects.findFirst({
      where: Number.isFinite(asNum) ? eq(projects.id, asNum) : eq(projects.slug, key),
    });
    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(row);
  }),
);

projectsRouter.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const input = projectInput.parse(req.body);
    const slug = input.slug ?? slugify(input.title);
    const [row] = await db
      .insert(projects)
      .values({
        slug,
        title: input.title,
        description: input.description,
        content: input.content,
        repoUrl: input.repoUrl ?? null,
        liveUrl: input.liveUrl ?? null,
        coverImageUrl: input.coverImageUrl ?? null,
        techTags: input.techTags,
        featured: input.featured ?? false,
        sortOrder: input.sortOrder ?? 0,
        published: input.published ?? true,
      })
      .returning();
    res.status(201).json(row);
  }),
);

projectsRouter.patch(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const input = projectInput.partial().parse(req.body);
    const [row] = await db
      .update(projects)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(row);
  }),
);

projectsRouter.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const result = await db.delete(projects).where(eq(projects.id, id)).returning({ id: projects.id });
    if (result.length === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).end();
  }),
);
