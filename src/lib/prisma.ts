import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { SCHEMA_DDL_STATEMENTS } from './schemaInit';

function resolveDatabaseConfig(): { url: string; needsSchemaInit: boolean } {
  const bundledPrismaDb = path.join(process.cwd(), 'prisma', 'dev.db');
  const bundledRootDb = path.join(process.cwd(), 'dev.db');

  const isServerless = Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.cwd().startsWith('/var/task')
  );

  // Always use writable /tmp SQLite file on Vercel Serverless (even if Vercel env has an old postgres:// URL)
  if (isServerless) {
    const tmpDbPath = '/tmp/glowup_v4.db';
    let copiedFromBundle = false;
    try {
      if (!fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size < 4096) {
        const sourceDb = fs.existsSync(bundledPrismaDb)
          ? bundledPrismaDb
          : fs.existsSync(bundledRootDb)
          ? bundledRootDb
          : null;
        if (sourceDb) {
          fs.copyFileSync(sourceDb, tmpDbPath);
          fs.chmodSync(tmpDbPath, 0o666);
          copiedFromBundle = true;
        }
      } else {
        copiedFromBundle = true;
      }
    } catch (err) {
      console.error('[Prisma] Warning copying SQLite DB to /tmp:', err);
    }

    const url = `file:${tmpDbPath}`;
    process.env.DATABASE_URL = url;
    return { url, needsSchemaInit: !copiedFromBundle };
  }

  // Local development
  if (fs.existsSync(bundledPrismaDb)) {
    const url = `file:${bundledPrismaDb}`;
    process.env.DATABASE_URL = url;
    return { url, needsSchemaInit: false };
  }
  if (fs.existsSync(bundledRootDb)) {
    const url = `file:${bundledRootDb}`;
    process.env.DATABASE_URL = url;
    return { url, needsSchemaInit: false };
  }

  const fallback = 'file:./dev.db';
  process.env.DATABASE_URL = fallback;
  return { url: fallback, needsSchemaInit: true };
}

const { url: dbUrl, needsSchemaInit } = resolveDatabaseConfig();

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  schemaInitPromise?: Promise<void>;
};

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

  let initialized = false;
  client.$use(async (params, next) => {
    if (!initialized && params.action !== 'executeRaw' && params.action !== 'queryRaw') {
      if (!globalForPrisma.schemaInitPromise) {
        globalForPrisma.schemaInitPromise = (async () => {
          for (const ddl of SCHEMA_DDL_STATEMENTS) {
            try {
              await client.$executeRawUnsafe(ddl);
            } catch {
              // ignore if table/index already exists
            }
          }
          initialized = true;
        })();
      }
      await globalForPrisma.schemaInitPromise;
    }
    return next(params);
  });

  return client;
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
