import express from "express";
import cors from "cors";
import path from "node:path";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { env } from "./env.js";
import { postsRouter } from "./routes/posts.js";
import { projectsRouter } from "./routes/projects.js";
import { siteSettingsRouter } from "./routes/siteSettings.js";
import { resumeRouter } from "./routes/resume.js";
import { uploadsRouter } from "./routes/uploads.js";
import { meRouter } from "./routes/me.js";
import { errorHandler, notFound } from "./middleware/error.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  );

  // better-auth handler MUST be mounted before express.json() —
  // it reads its own body to support multiple content types.
  app.all("/api/auth/*", toNodeHandler(auth));

  app.use(express.json({ limit: "1mb" }));

  // Static uploads
  app.use("/uploads", express.static(path.resolve(env.UPLOADS_DIR)));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/me", meRouter);
  app.use("/api/posts", postsRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/site-settings", siteSettingsRouter);
  app.use("/api/resume", resumeRouter);
  app.use("/api/uploads", uploadsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
