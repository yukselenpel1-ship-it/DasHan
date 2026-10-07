import { readFile } from "node:fs/promises";
import { getMigrations } from "better-auth/db/migration";
import { authOptions } from "../lib/auth";
import { getPool } from "../lib/database";

if (!process.env.DATABASE_URL) {
  console.log("Database not connected yet; skipping migrations. The application remains locked until configured.");
} else {
  const pool = getPool(), client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock(78429401)");
    const migration = await getMigrations(authOptions());
    await migration.runMigrations();
    await client.query(await readFile(new URL("../db/postgres.sql", import.meta.url), "utf8"));
    console.log("DashHAN database and authentication migrations complete.");
  } finally {
    await client.query("SELECT pg_advisory_unlock(78429401)");
    client.release();
    await pool.end();
  }
}
