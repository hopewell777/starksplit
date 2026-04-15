import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL is not set in .env.local');
    process.exit(1);
  }

  console.log('🔍 Testing Supabase Database Connection...');
  
  try {
    const parsed = new URL(connectionString);
    console.log(`📡 Connecting to: ${parsed.hostname}:${parsed.port || '5432'}`);
    console.log(`👤 User mapping: ${parsed.username}`);
    console.log(`🔒 SSL Mode: ${parsed.searchParams.get('sslmode') || 'default'}`);

    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });

    console.log('\n⏳ Initiating connection...');
    const client = await pool.connect();
    
    console.log('✅ Connection Successful!');
    
    const res = await client.query('SELECT NOW() as time, current_user, current_database()');
    console.log('\n📊 Database Details:');
    console.log(`- Server Time: ${res.rows[0].time}`);
    console.log(`- Current User: ${res.rows[0].current_user}`);
    console.log(`- Database: ${res.rows[0].current_database}`);

    client.release();
    await pool.end();
  } catch (err: any) {
    console.error('\n❌ Connection Failed!');
    console.error(`Error code: ${err.code || 'UNKNOWN'}`);
    console.error(`Message: ${err.message}`);
    
    if (err.message.includes('Tenant or user not found')) {
      console.log('\n💡 DIAGNOSIS: Connection Pooler Mismatch');
      console.log('This means the Supavisor pooler located at aws-0-us-east-1.pooler.supabase.com');
      console.log('cannot map your username (which contains the project ref) to actual databases.');
      console.log('Common causes:');
      console.log('  1. The project ref in the username is incorrect.');
      console.log('  2. The project is linked to a different region\'s pooler.');
      console.log('  3. The project is paused or deleted.');
      console.log('\nSuggested action: Go to your Supabase Dashboard -> Project Settings -> Database');
      console.log('and copy exactly the "Connection string" provided under "Connection pooling".');
    }
    process.exit(1);
  }
}

main();
