import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const sql = postgres(url, { prepare: false });

  try {
    const version = await sql<{ version: string }[]>`select version()`;
    console.log("✓ Connected to:", version[0].version.split(",")[0]);

    const tables = await sql<{ table_name: string }[]>`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
      order by table_name
    `;

    console.log(`\nExisting tables in public schema (${tables.length}):`);
    if (tables.length === 0) {
      console.log("  (none)");
    } else {
      for (const t of tables) console.log(`  - ${t.table_name}`);
    }

    const collisions = tables.filter((t) =>
      ["responses", "outreach_log"].includes(t.table_name),
    );
    console.log(
      `\nCollision check: ${
        collisions.length === 0
          ? "✓ no conflict with `responses` or `outreach_log`"
          : `⚠ collision with: ${collisions.map((c) => c.table_name).join(", ")}`
      }`,
    );
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("✗ Connection failed:", err.message);
  process.exit(1);
});
