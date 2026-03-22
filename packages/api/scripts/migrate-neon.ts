/**
 * Apply Prisma migrations to Neon only (uses DATABASE_URL_NEON from packages/api/.env).
 *
 * Usage: npm run db:migrate:neon -w api
 *
 * Get the connection string from the Neon dashboard (use the pooled URL for serverless).
 */
import dotenv from "dotenv";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(apiRoot, ".env") });

const neonUrl = process.env.DATABASE_URL_NEON;
if (!neonUrl || neonUrl.trim() === "") {
  console.error(
    "DATABASE_URL_NEON is not set. Add it to packages/api/.env (uncomment and paste your Neon connection string)."
  );
  process.exit(1);
}

console.log("Applying migrations to Neon…");
execSync("npx prisma migrate deploy", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: neonUrl },
  cwd: apiRoot,
});
console.log("Neon migrations applied.");
