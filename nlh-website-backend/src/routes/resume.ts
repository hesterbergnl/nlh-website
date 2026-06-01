import { Router } from "express";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { resumeEntries } from "../db/schema.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { asyncHandler } from "../util/asyncHandler.js";

export const resumeRouter = Router();

const kinds = ["work", "education", "skill", "certification"] as const;

const entryInput = z.object({
  kind: z.enum(kinds),
  title: z.string().min(1).max(200),
  organization: z.string().max(200).nullable().optional(),
  location: z.string().max(120).nullable().optional(),
  startDate: z.string().max(40).nullable().optional(),
  endDate: z.string().max(40).nullable().optional(),
  current: z.boolean().optional(),
  description: z.string().default(""),
  tags: z.array(z.string().max(40)).max(40).default([]),
  sortOrder: z.number().int().optional(),
});

resumeRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rows = await db
      .select()
      .from(resumeEntries)
      .orderBy(asc(resumeEntries.kind), asc(resumeEntries.sortOrder));
    res.json(rows);
  }),
);

resumeRouter.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const input = entryInput.parse(req.body);
    const [row] = await db.insert(resumeEntries).values(input).returning();
    res.status(201).json(row);
  }),
);

resumeRouter.patch(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const input = entryInput.partial().parse(req.body);
    const [row] = await db
      .update(resumeEntries)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(resumeEntries.id, id))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(row);
  }),
);

resumeRouter.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const result = await db
      .delete(resumeEntries)
      .where(eq(resumeEntries.id, id))
      .returning({ id: resumeEntries.id });
    if (result.length === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).end();
  }),
);
