import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;

export async function initDatabase() {
  if (db) return db;

  db = await open({
    filename: join(__dirname, "../../xp.db"),
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_xp (
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      leva INTEGER DEFAULT 0,
      messages INTEGER DEFAULT 0,
      level INTEGER DEFAULT 0,
      last_message_date TEXT,
      streak INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, guild_id)
    )
  `);

  console.log("Database initialized");
  return db;
}

export async function getDatabase() {
  if (!db) {
    await initDatabase();
  }
  return db;
}
