// Vitest reads env vars from the real process. Provide safe defaults so the
// app's env validator doesn't reject `process.env` in test runs.
process.env.NODE_ENV = "test";
process.env.PORT ??= "3001";
process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/nlh_test";
process.env.BETTER_AUTH_SECRET ??= "test-secret-test-secret-test-secret";
process.env.BETTER_AUTH_URL ??= "http://localhost:3001";
process.env.FRONTEND_URL ??= "http://localhost:5173";
process.env.ADMIN_EMAIL ??= "admin@test.local";
process.env.UPLOADS_DIR ??= "./uploads";
process.env.PUBLIC_UPLOADS_URL ??= "http://localhost:3001/uploads";
