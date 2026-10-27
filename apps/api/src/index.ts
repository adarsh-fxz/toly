import { serve } from "@hono/node-server";
import app from "./app";
import { env } from "./env";
import { startJobs } from "./jobs";

const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});

const stopJobs = startJobs();

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    stopJobs();
    server.close(() => process.exit(0));
  });
}
