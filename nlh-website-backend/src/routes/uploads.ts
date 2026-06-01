import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { uploads } from "../db/schema.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { env } from "../env.js";

export const uploadsRouter = Router();

const uploadDir = path.resolve(env.UPLOADS_DIR);
fs.mkdirSync(uploadDir, { recursive: true });

const allowedMime = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 8) || "";
    const safeExt = /^\.[a-z0-9]+$/.test(ext) ? ext : "";
    const id = crypto.randomBytes(12).toString("hex");
    cb(null, `${id}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (_req, file, cb) => {
    if (!allowedMime.has(file.mimetype)) {
      cb(new Error(`Unsupported mime type: ${file.mimetype}`));
      return;
    }
    cb(null, true);
  },
});

uploadsRouter.get(
  "/",
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(uploads).orderBy(desc(uploads.createdAt));
    res.json(rows);
  }),
);

uploadsRouter.post(
  "/",
  requireAdmin,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const url = `${env.PUBLIC_UPLOADS_URL.replace(/\/$/, "")}/${file.filename}`;
    const [row] = await db
      .insert(uploads)
      .values({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url,
      })
      .returning();
    res.status(201).json(row);
  }),
);
