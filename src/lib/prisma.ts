import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { SCHEMA_DDL_STATEMENTS, USER_OWNED_TABLES } from './schemaInit';
import { AUTH_COOKIE_NAME, verifySessionCookieValue } from './authToken';

const USER_OWNED_MODEL_DELEGATES = new Set(
  USER_OWNED_TABLES.map((t) => t.charAt(0).toLowerCase() + t.slice(1))
);

const isServerless = Boolean(
  process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.cwd().startsWith('/var/task')
);

function getBundledSourceDbPath(): string | null {
  const p1 = path.join(process.cwd(), 'prisma', 'dev.db');
  if (fs.existsSync(p1)) return p1;
  const p2 = path.join(process.cwd(), 'dev.db');
  if (fs.existsSync(p2)) return p2;
  return null;
}

function getStorageDir(): string {
  if (isServerless) return '/tmp';
  const dir = path.join(process.cwd(), 'prisma', 'workspaces');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getMasterDbPath(): string {
  if (isServerless) {
    const tmpMaster = '/tmp/glowup_master_v4.db';
    if (!fs.existsSync(tmpMaster) || fs.statSync(tmpMaster).size < 4096) {
      const src = getBundledSourceDbPath();
      if (src) {
        try {
          fs.copyFileSync(src, tmpMaster);
          fs.chmodSync(tmpMaster, 0o666);
        } catch (err) {
          console.error('[Prisma] Master DB copy warning:', err);
        }
      }
    }
    return tmpMaster;
  }
  return getBundledSourceDbPath() || path.join(process.cwd(), 'prisma', 'dev.db');
}

function getGuestDbPath(): string {
  const dir = getStorageDir();
  return path.join(dir, 'glowup_guest_mockup.db');
}

function getUserDbPath(userId: string): string {
  const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = getStorageDir();
  return path.join(dir, `glowup_user_${safeId}.db`);
}

type ClientEntry = {
  client: PrismaClient;
  initPromise?: Promise<void>;
  initialized: boolean;
};

const globalStore = global as unknown as {
  masterEntry?: ClientEntry;
  guestEntry?: ClientEntry;
  userEntries?: Map<string, ClientEntry>;
};

if (!globalStore.userEntries) {
  globalStore.userEntries = new Map<string, ClientEntry>();
}

function createClientEntry(dbFilePath: string, seedFromBundle: boolean): ClientEntry {
  try {
    if (seedFromBundle && (!fs.existsSync(dbFilePath) || fs.statSync(dbFilePath).size < 4096)) {
      const src = getBundledSourceDbPath();
      if (src) {
        fs.copyFileSync(src, dbFilePath);
        try {
          fs.chmodSync(dbFilePath, 0o666);
        } catch {
          // ignore chmod error
        }
      }
    }
  } catch (err) {
    console.error('[Prisma] File init warning:', err);
  }

  const url = `file:${dbFilePath}`;
  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('file:')) {
    process.env.DATABASE_URL = url;
  }

  const client = new PrismaClient({
    datasources: {
      db: { url },
    },
  });

  return {
    client,
    initialized: false,
  };
}

async function ensureEntryInitialized(
  entry: ClientEntry,
  clearSeedDataIfFreshUser = false,
  ownerUser?: { id: string; email?: string }
): Promise<PrismaClient> {
  if (entry.initialized) return entry.client;
  if (!entry.initPromise) {
    entry.initPromise = (async () => {
      for (const ddl of SCHEMA_DDL_STATEMENTS) {
        try {
          await entry.client.$executeRawUnsafe(ddl);
        } catch {
          // ignore existing table/column/index
        }
      }
      if (ownerUser?.id) {
        try {
          await entry.client.user.upsert({
            where: { id: ownerUser.id },
            update: {},
            create: {
              id: ownerUser.id,
              name: ownerUser.email?.split('@')[0] || 'Member',
              email: ownerUser.email || `${ownerUser.id}@glowup.local`,
              passwordHash: 'synced',
            },
          });
        } catch {
          // ignore if email already exists in bundled DB
        }
      }
      if (clearSeedDataIfFreshUser) {
        try {
          await entry.client.userSettings.upsert({
            where: { id: 'default' },
            update: {},
            create: {
              id: 'default',
              userId: ownerUser?.id || null,
              goalCal: 1800,
              budgetGoal: 1000000,
              bodyRecompGoal: 'Thiết lập mục tiêu cá nhân của bạn',
            },
          });
        } catch {
          // ignore
        }
      }
      entry.initialized = true;
    })();
  }
  await entry.initPromise;
  return entry.client;
}

export async function getMasterPrismaClient(): Promise<PrismaClient> {
  if (!globalStore.masterEntry) {
    globalStore.masterEntry = createClientEntry(getMasterDbPath(), true);
  }
  return ensureEntryInitialized(globalStore.masterEntry, false);
}

export async function getGuestPrismaClient(): Promise<PrismaClient> {
  if (!globalStore.guestEntry) {
    globalStore.guestEntry = createClientEntry(getGuestDbPath(), true);
  }
  return ensureEntryInitialized(globalStore.guestEntry, false);
}

export async function getUserPrismaClient(
  userId: string,
  isDemoAccount = false,
  userEmail?: string
): Promise<PrismaClient> {
  const existing = globalStore.userEntries!.get(userId);
  if (existing) {
    return ensureEntryInitialized(existing, false, { id: userId, email: userEmail });
  }
  const dbPath = getUserDbPath(userId);
  const isNewFile = !fs.existsSync(dbPath) || fs.statSync(dbPath).size < 4096;
  const entry = createClientEntry(dbPath, isDemoAccount);
  globalStore.userEntries!.set(userId, entry);
  return ensureEntryInitialized(entry, isNewFile && !isDemoAccount, { id: userId, email: userEmail });
}

export async function resetGuestMockupDatabase(): Promise<void> {
  try {
    if (globalStore.guestEntry) {
      try {
        await globalStore.guestEntry.client.$disconnect();
      } catch {
        // ignore disconnect error
      }
      globalStore.guestEntry = undefined;
    }
    const guestPath = getGuestDbPath();
    const src = getBundledSourceDbPath();
    if (src) {
      fs.copyFileSync(src, guestPath);
      try {
        fs.chmodSync(guestPath, 0o666);
      } catch {
        // ignore
      }
    } else if (fs.existsSync(guestPath)) {
      fs.unlinkSync(guestPath);
    }
  } catch (err) {
    console.error('[Prisma] resetGuestMockupDatabase error:', err);
  }
}

async function resolveCurrentSessionUser(): Promise<{ id: string; email?: string } | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const verified = verifySessionCookieValue(raw);
    if (!verified) return null;
    return { id: verified.id, email: verified.email };
  } catch {
    return null;
  }
}

async function resolveActiveDataContext(): Promise<{ client: PrismaClient; userId: string | null }> {
  const sessionUser = await resolveCurrentSessionUser();
  if (sessionUser?.id) {
    const isDemo = sessionUser.email === 'member@glowup.os';
    const client = await getUserPrismaClient(sessionUser.id, isDemo, sessionUser.email);
    return { client, userId: sessionUser.id };
  }
  const client = await getGuestPrismaClient();
  return { client, userId: null };
}

function injectUserIdIntoWriteArgs(prop: string, method: string, args: any[], userId: string | null): any[] {
  if (!userId || !USER_OWNED_MODEL_DELEGATES.has(prop)) return args;
  const firstArg = args[0];
  if (!firstArg || typeof firstArg !== 'object') return args;

  if (method === 'create' && firstArg.data && typeof firstArg.data === 'object') {
    if (firstArg.data.userId === undefined && firstArg.data.user === undefined) {
      return [{ ...firstArg, data: { ...firstArg.data, userId } }, ...args.slice(1)];
    }
  } else if (method === 'createMany' && Array.isArray(firstArg.data)) {
    return [
      {
        ...firstArg,
        data: firstArg.data.map((row: any) =>
          row && typeof row === 'object' && row.userId === undefined ? { ...row, userId } : row
        ),
      },
      ...args.slice(1),
    ];
  } else if (method === 'upsert' && firstArg.create && typeof firstArg.create === 'object') {
    if (firstArg.create.userId === undefined && firstArg.create.user === undefined) {
      return [{ ...firstArg, create: { ...firstArg.create, userId } }, ...args.slice(1)];
    }
  }
  return args;
}

function createDynamicPrismaProxy(): PrismaClient {
  return new Proxy({} as PrismaClient, {
    get(_target, prop: string | symbol) {
      if (typeof prop === 'symbol' || prop === 'then') return undefined;

      // Account (`user`) and session (`authSession`) tables live in the Master Auth DB
      if (prop === 'user' || prop === 'authSession') {
        return new Proxy(
          {},
          {
            get(_mTarget, method: string) {
              return async (...args: any[]) => {
                const master = await getMasterPrismaClient();
                return ((master as any)[prop] as any)[method](...args);
              };
            },
          }
        );
      }

      // Top-level PrismaClient methods ($transaction, $executeRawUnsafe, etc.)
      if (prop.startsWith('$')) {
        return async (...args: any[]) => {
          if (prop === '$transaction' && Array.isArray(args[0])) {
            return Promise.all(args[0]);
          }
          const { client } = await resolveActiveDataContext();
          return (client as any)[prop](...args);
        };
      }

      // Data model delegates (task, sprint, smartGoal, moodLog, nutritionLog, etc.)
      return new Proxy(
        {},
        {
          get(_mTarget, method: string) {
            return async (...args: any[]) => {
              const { client, userId } = await resolveActiveDataContext();
              const delegate = (client as any)[prop];
              if (!delegate || typeof delegate[method] !== 'function') {
                throw new Error(`Invalid Prisma model or method: ${String(prop)}.${String(method)}`);
              }
              const finalArgs = injectUserIdIntoWriteArgs(prop, method, args, userId);
              return delegate[method](...finalArgs);
            };
          },
        }
      );
    },
  });
}

export const prisma: PrismaClient = createDynamicPrismaProxy();
