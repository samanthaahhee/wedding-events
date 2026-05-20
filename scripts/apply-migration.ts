import { config } from "dotenv";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";

config({ path: ".env.local" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const sql = postgres(url, { prepare: false, max: 1 });

  try {
    const migrationDir = "drizzle";
    const files = readdirSync(migrationDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      console.log(`\n→ Applying ${file}`);
      const content = readFileSync(join(migrationDir, file), "utf-8");
      const statements = content
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter(Boolean);

      for (const stmt of statements) {
        const preview = stmt.split("\n")[0].slice(0, 80);
        try {
          await sql.unsafe(stmt);
          console.log(`  ✓ ${preview}`);
        } catch (err) {
          const msg = (err as Error).message;
          if (msg.includes("already exists")) {
            console.log(`  ⊝ ${preview} (already exists, skipped)`);
          } else {
            throw err;
          }
        }
      }
    }

    console.log("\n✓ Migration complete. Tables in public schema:");
    const tables = await sql<{ table_name: string }[]>`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
      order by table_name
    `;
    for (const t of tables) console.log(`  - ${t.table_name}`);
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("\n✗ Migration failed:", err.message);
  process.exit(1);
});
