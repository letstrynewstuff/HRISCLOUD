
// src/config/db.js
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Supabase requires SSL
  ssl: {
    rejectUnauthorized: false,
  },

  max: 20, // max number of clients in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test database connection immediately when server starts
(async () => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("✅ Database connected successfully");
    console.log("🕒 Server time:", result.rows[0].now);
    client.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
})();

// Catch unexpected idle errors
pool.on("error", (err) => {
  console.error("❌ Unexpected idle client error:", err);
  process.exit(1);
});

// Simple query wrapper
export const db = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(), // for transactions
};

export default pool;