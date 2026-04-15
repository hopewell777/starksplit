import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const getSafeDatabaseUrl = (url: string) => {
  try {
    // Robust parsing for connection strings with special characters in passwords (like @)
    const parsed = new URL(url);
    return parsed.toString();
  } catch (error) {
    console.warn("Prisma: Could not parse DATABASE_URL in getSafeDatabaseUrl", error);
    return url;
  }
};

const prismaClientSingleton = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const sanitizedUrl = getSafeDatabaseUrl(dbUrl);

  // Prisma v7 requires a Driver Adapter for direct database connections.
  // We use pg Pool with optimized settings for Serverless (Vercel).
  const pool = new Pool({
    connectionString: sanitizedUrl,
    ssl: sanitizedUrl.includes("localhost") 
      ? false 
      : { rejectUnauthorized: false },
    max: 2, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection cannot be established
  });

  // Track pool errors globally
  pool.on('error', (err) => {
    console.error('Prisma: Unexpected error on idle database client', err);
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
