import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.js";
import { env } from "../env.js";

// Attaches `req.session` if a valid session exists. Doesn't reject.
export async function attachSession(req: Request, _res: Response, next: NextFunction) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  (req as Request & { session?: typeof session }).session = session ?? undefined;
  next();
}

// Rejects unless the request comes from the configured admin email.
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session?.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  if (session.user.email !== env.ADMIN_EMAIL) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  (req as Request & { session?: typeof session }).session = session;
  next();
}
