import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { siteSettings } from "../db/schema.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { asyncHandler } from "../util/asyncHandler.js";

export const siteSettingsRouter = Router();

const socialLink = z.object({
  label: z.string().min(1).max(40),
  url: z.string().url(),
});

const settingsInput = z.object({
  siteTitle: z.string().min(1).max(120).optional(),
  headline: z.string().max(240).optional(),
  aboutMarkdown: z.string().optional(),
  headshotUrl: z.string().url().nullable().optional(),
  socialLinks: z.array(socialLink).max(20).optional(),
});

async function ensureSingleton() {
  const existing = await db.query.siteSettings.findFirst({ where: eq(siteSettings.id, 1) });
  if (existing) return existing;
  const [created] = await db.insert(siteSettings).values({ id: 1 }).returning();
  return created!;
}

siteSettingsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await ensureSingleton());
  }),
);

siteSettingsRouter.patch(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const input = settingsInput.parse(req.body);
    await ensureSingleton();
    const [row] = await db
      .update(siteSettings)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(siteSettings.id, 1))
      .returning();
    res.json(row);
  }),
);
