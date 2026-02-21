/**
 * Run Prisma migrations against both Docker (local) and Neon (cloud).
 * Requires DATABASE_URL (Docker) and DATABASE_URL_NEON in packages/api/.env
 *
 * Usage: npm run db:migrate:all -w api
 */
import dotenv from "dotenv";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(apiRoot, ".env") });

const dockerUrl = process.env.DATABASE_URL;
const neonUrl = process.env.DATABASE_URL_NEON;

if (!dockerUrl) {
  console.error("DATABASE_URL not set. Add it to packages/api/.env");
  process.exit(1);
}

console.log("Migrating Docker (local)...");
execSync("npx prisma migrate deploy", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: dockerUrl },
  cwd: apiRoot,
});
console.log("Docker migration done.\n");

if (neonUrl) {
  console.log("Migrating Neon (cloud)...");
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: neonUrl },
    cwd: apiRoot,
  });
  console.log("Neon migration done.");
} else {
  console.log("DATABASE_URL_NEON not set. Skipping Neon. Add it to packages/api/.env to migrate both.");
}
