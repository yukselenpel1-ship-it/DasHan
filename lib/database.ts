import { Pool } from "pg";

let pool: Pool | undefined;
export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("Veritabanı bağlantısı henüz ayarlanmadı.");
  return pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 10000, idleTimeoutMillis: 10000, allowExitOnIdle: true });
}

// Keep the existing parameterized queries while moving from D1 to PostgreSQL.
export function database() {
  return {
    prepare(statement: string) {
      let index = 0;
      const sql = statement.replace(/\?/g, () => `$${++index}`);
      function query(parameters: unknown[] = []) {
        return {
          bind: (...values: unknown[]) => query(values),
          async all() { return { results: (await getPool().query(sql, parameters)).rows }; },
          async first() { return (await getPool().query(sql, parameters)).rows[0] ?? null; },
          async run() { return { meta: { changes: (await getPool().query(sql, parameters)).rowCount ?? 0 } }; },
        };
      }
      return query();
    },
  };
}
