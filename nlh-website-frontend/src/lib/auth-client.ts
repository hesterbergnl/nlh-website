import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // baseURL points at the backend in dev (via Vite proxy) and at the same
  // origin in prod.
  baseURL: import.meta.env.VITE_AUTH_BASE_URL ?? window.location.origin,
});

export const { useSession, signIn, signOut } = authClient;
