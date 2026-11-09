import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function resolveDatabaseUrl(): string {
  // Explicit path references so Next.js file tracing (@vercel/nft) always bundles the SQLite database
  const bundledPrismaDb = path.join(process.cwd(), 'prisma', 'dev.db');
  const bundledRootDb = path.join(process.cwd(), 'dev.db');

  const envUrl = process.env.DATABASE_URL;
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.cwd().startsWith('/var/task')
  );

  // On Vercel Serverless (/var/task is read-only), copy bundled SQLite DB to /tmp so reads & writes work
  if (isServerless && (!envUrl || envUrl.startsWith('file:'))) {
    const tmpDbPath = '/tmp/glowup_v2.db';
    try {
      if (!fs.existsSync(tmpDbPath)) {
        const sourceDb = fs.existsSync(bundledPrismaDb)
          ? bundledPrismaDb
          : fs.existsSync(bundledRootDb)
          ? bundledRootDb
          : null;
        if (sourceDb) {
          fs.copyFileSync(sourceDb, tmpDbPath);
          fs.chmodSync(tmpDbPath, 0o666);
        }
      }
    } catch (err) {
      console.error('[Prisma] Could not copy SQLite DB to /tmp:', err);
    }

    if (fs.existsSync(tmpDbPath)) {
      const resolved = `file:${tmpDbPath}`;
      process.env.DATABASE_URL = resolved;
      return resolved;
    }
  }

  if (!envUrl || envUrl === 'file:./dev.db') {
    if (fs.existsSync(bundledPrismaDb)) {
      const resolved = `file:${bundledPrismaDb}`;
      process.env.DATABASE_URL = resolved;
      return resolved;
    }
    if (fs.existsSync(bundledRootDb)) {
      const resolved = `file:${bundledRootDb}`;
      process.env.DATABASE_URL = resolved;
      return resolved;
    }
  }

  const fallback = envUrl || 'file:./dev.db';
  process.env.DATABASE_URL = fallback;
  return fallback;
}

const dbUrl = resolveDatabaseUrl();

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
