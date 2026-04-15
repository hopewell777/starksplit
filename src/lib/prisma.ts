import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const getSafeDatabaseUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    // Log masked connection info for debugging "Tenant or user not found"
    console.log(`[Prisma] Connecting to ${parsed.hostname}:${parsed.port || '5432'} as ${parsed.username}`);
    return parsed.toString();
  } catch (error) {
    console.warn("Prisma: Could not parse DATABASE_URL", error);
    return url;
  }
};

const prismaClientSingleton = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const sanitizedUrl = getSafeDatabaseUrl(dbUrl);

  const pool = new Pool({
    connectionString: sanitizedUrl,
    ssl: sanitizedUrl.includes("localhost") 
      ? false 
      : { rejectUnauthorized: false },
    max: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    console.error('Prisma: Unexpected error on idle database client', err);
    if (err.message.includes('Tenant or user not found')) {
      console.error('---------------------------------------------------------');
      console.error('CRITICAL: Supabase "Tenant or user not found" error detected.');
      console.error('PERMANENT FIX: Update your DATABASE_URL to use the new regional pooler format.');
      console.error('Format: postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require');
      console.error('---------------------------------------------------------');
    }
  });
  
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
