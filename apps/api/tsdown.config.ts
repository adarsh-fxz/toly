import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  platform: "node",
  target: "node24",
  format: "esm",
  // Bundle every dependency so the runtime image needs no node_modules.
  noExternal: [/.*/],
  sourcemap: true,
});
