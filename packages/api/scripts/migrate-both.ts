/**
 * Run Prisma migrations against Docker (local) and optionally Neon (cloud).
 * Requires DATABASE_URL in packages/api/.env. Optionally DATABASE_URL_NEON for Neon.
 *
 * Usage: npm run db:migrate:all -w api
 *
 * If local Postgres is not running, set SKIP_LOCAL_MIGRATE=1 to only migrate Neon
 * (DATABASE_URL_NEON must be set).
 */
import dotenv from "dotenv";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(apiRoot, ".env") });

const dockerUrl = process.env.DATABASE_URL;
const neonUrl = process.env.DATABASE_URL_NEON?.trim();
const skipLocal =
  process.env.SKIP_LOCAL_MIGRATE === "1" || process.env.SKIP_LOCAL_MIGRATE === "true";

if (!skipLocal) {
  if (!dockerUrl) {
    console.error("DATABASE_URL not set. Add it to packages/api/.env");
    process.exit(1);
  }
  console.log("Migrating local (DATABASE_URL)…");
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: dockerUrl },
    cwd: apiRoot,
  });
  console.log("Local migration done.\n");
} else {
  console.log("Skipping local migrate (SKIP_LOCAL_MIGRATE is set).\n");
}

if (neonUrl) {
  console.log("Migrating Neon (DATABASE_URL_NEON)…");
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: neonUrl },
    cwd: apiRoot,
  });
  console.log("Neon migration done.");
} else if (skipLocal) {
  console.error(
    "SKIP_LOCAL_MIGRATE is set but DATABASE_URL_NEON is missing. Set DATABASE_URL_NEON or run without SKIP_LOCAL_MIGRATE."
  );
  process.exit(1);
} else {
  console.log("DATABASE_URL_NEON not set. Skipping Neon. Add it to packages/api/.env to migrate cloud.");
}
