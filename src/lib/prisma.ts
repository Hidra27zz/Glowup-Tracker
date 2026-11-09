import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { SCHEMA_DDL_STATEMENTS } from './schemaInit';

const AUTH_COOKIE_NAME = 'glowup_auth_user';

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

  const entry: ClientEntry = {
    client,
    initialized: false,
  };

  return entry;
}

async function ensureEntryInitialized(entry: ClientEntry, clearSeedDataIfFreshUser = false): Promise<PrismaClient> {
  if (entry.initialized) return entry.client;
  if (!entry.initPromise) {
    entry.initPromise = (async () => {
      for (const ddl of SCHEMA_DDL_STATEMENTS) {
        try {
          await entry.client.$executeRawUnsafe(ddl);
        } catch {
          // ignore existing table/index
        }
      }
      if (clearSeedDataIfFreshUser) {
        try {
          await entry.client.userSettings.upsert({
            where: { id: 'default' },
            update: {},
            create: {
              id: 'default',
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

export async function getUserPrismaClient(userId: string, isDemoAccount = false): Promise<PrismaClient> {
  const existing = globalStore.userEntries!.get(userId);
  if (existing) {
    return ensureEntryInitialized(existing, false);
  }
  const dbPath = getUserDbPath(userId);
  const isNewFile = !fs.existsSync(dbPath) || fs.statSync(dbPath).size < 4096;
  const entry = createClientEntry(dbPath, isDemoAccount);
  globalStore.userEntries!.set(userId, entry);
  return ensureEntryInitialized(entry, isNewFile && !isDemoAccount);
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
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.id === 'string' && parsed.id.trim() !== '') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

async function resolveActiveDataClient(): Promise<PrismaClient> {
  const sessionUser = await resolveCurrentSessionUser();
  if (sessionUser?.id) {
    const isDemo = sessionUser.email === 'member@glowup.os';
    return getUserPrismaClient(sessionUser.id, isDemo);
  }
  return getGuestPrismaClient();
}

function createDynamicPrismaProxy(): PrismaClient {
  return new Proxy({} as PrismaClient, {
    get(_target, prop: string | symbol) {
      if (typeof prop === 'symbol' || prop === 'then') return undefined;

      // Account table always lives in the Master DB
      if (prop === 'user') {
        return new Proxy(
          {},
          {
            get(_mTarget, method: string) {
              return async (...args: any[]) => {
                const master = await getMasterPrismaClient();
                return (master.user as any)[method](...args);
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
          const activeClient = await resolveActiveDataClient();
          return (activeClient as any)[prop](...args);
        };
      }

      // Data model delegate (task, sprint, smartGoal, moodLog, nutritionLog, etc.)
      return new Proxy(
        {},
        {
          get(_mTarget, method: string) {
            return async (...args: any[]) => {
              const activeClient = await resolveActiveDataClient();
              const delegate = (activeClient as any)[prop];
              if (!delegate || typeof delegate[method] !== 'function') {
                throw new Error(`Invalid Prisma model or method: ${String(prop)}.${String(method)}`);
              }
              return delegate[method](...args);
            };
          },
        }
      );
    },
  });
}

export const prisma: PrismaClient = createDynamicPrismaProxy();
