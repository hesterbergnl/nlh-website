import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/index.js";
import * as schema from "./db/schema.js";
import { env } from "./env.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    // Closed signup: we expose POST /api/admin/bootstrap to create the first/only admin.
    // The better-auth signup endpoint stays open at runtime so the CLI bootstrap can call it,
    // but the frontend never exposes signup UI.
    autoSignIn: true,
  },
  trustedOrigins: [env.FRONTEND_URL],
});

export type Auth = typeof auth;
