import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
    env: {
      NODE_ENV: "test",
      DATABASE_URI:
        process.env.TEST_DATABASE_URI ?? "postgresql://unused@localhost/unused",
      BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret-test",
    },
  },
});
