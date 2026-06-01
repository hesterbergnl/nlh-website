import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.js";
import { env } from "../env.js";
import { asyncHandler } from "../util/asyncHandler.js";

export const meRouter = Router();

// Returns the current session along with an `isAdmin` flag the frontend can read.
meRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session?.user) {
      res.json({ user: null, isAdmin: false });
      return;
    }
    res.json({
      user: session.user,
      isAdmin: session.user.email === env.ADMIN_EMAIL,
    });
  }),
);
