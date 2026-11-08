import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { appAliases } from "./config/aliases.mjs";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const alias = Object.fromEntries(
  Object.entries(appAliases).map(([key, value]) => [key, path.resolve(rootDir, value)])
);

export default defineConfig({
  resolve: { alias },
});
