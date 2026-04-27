import { PrismaClient } from '@prisma/client';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const databaseUrl = process.env.NODE_ENV === 'production' 
  ? `file:${path.join(process.cwd(), 'dev.db')}` 
  : process.env.DATABASE_URL;

const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: { db: { url: databaseUrl } },
  log: ['query'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };
