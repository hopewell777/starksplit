import { Pool } from 'pg';

async function testConnection() {
  const connectionString = "postgresql://postgres:Airdrop@123@db.dyawqgaubbzjulogjcsy.supabase.co:5432/postgres";
  console.log("Testing connection with raw string...");
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log("Connected successfully!");
    const res = await client.query('SELECT NOW()');
    console.log("Query result:", res.rows[0]);
    client.release();
  } catch (err) {
    console.error("Connection failed:", err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
