import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { AUTH_COOKIE_NAME, verifySessionCookieValue } from './authToken';
import { USER_OWNED_TABLES } from './schemaInit';

const USER_OWNED_MODEL_DELEGATES = new Set(
  USER_OWNED_TABLES.map((t) => t.charAt(0).toLowerCase() + t.slice(1))
);

const globalStore = global as unknown as {
  prisma?: PrismaClient;
  initPromise?: Promise<void>;
};

export const rawPrisma: PrismaClient =
  globalStore.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalStore.prisma = rawPrisma;
}

export async function ensureBaseUsersInitialized(): Promise<void> {
  if (globalStore.initPromise) return globalStore.initPromise;

  globalStore.initPromise = (async () => {
    try {
      await rawPrisma.user.upsert({
        where: { id: 'guest_mockup' },
        update: {},
        create: {
          id: 'guest_mockup',
          name: 'Khách Xem Thử',
          email: 'guest@glowup.mockup',
          passwordHash: 'guest_mockup_placeholder',
          role: 'GUEST',
          majorOrField: 'Khách',
        },
      });

      const demoUser = await rawPrisma.user.findUnique({
        where: { email: 'member@glowup.os' },
      });
      if (!demoUser) {
        const salt = '1234567890abcdef';
        const derived = crypto.scryptSync('glowup123', salt, 32).toString('hex');
        await rawPrisma.user.create({
          data: {
            id: 'member_demo_default',
            name: 'Thành viên GlowUp',
            email: 'member@glowup.os',
            passwordHash: `${salt}:${derived}`,
            role: 'USER',
            majorOrField: 'Phát triển toàn diện',
          },
        });
      }
    } catch (err) {
      console.error('[Prisma] Base users init warning:', err);
    }
  })();

  return globalStore.initPromise;
}

export async function resetGuestMockupDatabase(): Promise<void> {
  try {
    const guestId = 'guest_mockup';
    for (const tbl of USER_OWNED_TABLES) {
      const delegateName = tbl.charAt(0).toLowerCase() + tbl.slice(1);
      const delegate = (rawPrisma as any)[delegateName];
      if (delegate && typeof delegate.deleteMany === 'function') {
        await delegate.deleteMany({ where: { userId: guestId } }).catch(() => {});
      }
    }
  } catch (err) {
    console.error('[Prisma] resetGuestMockupDatabase error:', err);
  }
}

async function resolveCurrentSessionUserId(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const verified = verifySessionCookieValue(raw);
    if (verified?.id) {
      return verified.id;
    }
    return 'guest_mockup';
  } catch {
    return 'guest_mockup';
  }
}

function injectUserIdIntoArgs(method: string, args: any[], userId: string): any[] {
  const first = args[0];

  // 1. Write methods:
  if (method === 'create') {
    if (!first || typeof first !== 'object') return [{ data: { userId } }, ...args.slice(1)];
    const data =
      first.data && typeof first.data === 'object'
        ? { ...first.data, userId: first.data.userId ?? userId }
        : { userId };
    return [{ ...first, data }, ...args.slice(1)];
  }

  if (method === 'createMany') {
    if (!first || !Array.isArray(first.data)) return args;
    const data = first.data.map((item: any) =>
      item && typeof item === 'object' ? { ...item, userId: item.userId ?? userId } : item
    );
    return [{ ...first, data }, ...args.slice(1)];
  }

  if (method === 'upsert') {
    if (!first || typeof first !== 'object') return args;
    const create =
      first.create && typeof first.create === 'object'
        ? { ...first.create, userId: first.create.userId ?? userId }
        : { userId };
    return [{ ...first, create }, ...args.slice(1)];
  }

  // 2. Filter / Read methods:
  if (
    method === 'findMany' ||
    method === 'findFirst' ||
    method === 'count' ||
    method === 'aggregate' ||
    method === 'groupBy' ||
    method === 'deleteMany' ||
    method === 'updateMany'
  ) {
    if (!first || typeof first !== 'object') {
      return [{ where: { userId } }, ...args.slice(1)];
    }
    if (!first.where) {
      return [{ ...first, where: { userId } }, ...args.slice(1)];
    }
    // If query already explicitly filters userId, keep it
    if (first.where.userId !== undefined) {
      return args;
    }
    const scopedWhere = {
      AND: [first.where, { userId }],
    };
    return [{ ...first, where: scopedWhere }, ...args.slice(1)];
  }

  return args;
}

function createMultiTenantPrismaProxy(): PrismaClient {
  return new Proxy({} as PrismaClient, {
    get(_target, prop: string | symbol) {
      if (typeof prop === 'symbol' || prop === 'then') return undefined;

      // Top-level PrismaClient methods ($transaction, $executeRawUnsafe, $queryRaw, etc.)
      if (prop.startsWith('$')) {
        return (...args: any[]) => {
          return (rawPrisma as any)[prop](...args);
        };
      }

      // Delegate models (task, sprint, smartGoal, workout, nutritionLog, etc.)
      return new Proxy(
        {},
        {
          get(_mTarget, method: string) {
            return async (...args: any[]) => {
              await ensureBaseUsersInitialized();

              const delegate = (rawPrisma as any)[prop];
              if (!delegate || typeof delegate[method] !== 'function') {
                throw new Error(`Invalid Prisma model or method: ${String(prop)}.${String(method)}`);
              }

              // Account & session models are global, not user-partitioned
              if (!USER_OWNED_MODEL_DELEGATES.has(prop)) {
                return delegate[method](...args);
              }

              const userId = await resolveCurrentSessionUserId();

              // Special handling for userSettings default row
              if (prop === 'userSettings') {
                if (method === 'findUnique' && args[0]?.where?.id === 'default') {
                  let settings = await delegate.findFirst({ where: { userId } });
                  if (!settings) {
                    settings = await delegate.create({
                      data: {
                        userId,
                        bodyRecompGoal: 'Cài đặt mục tiêu cân nặng',
                        goalCal: 1800,
                        budgetGoal: 1000000,
                        hydrationGoal: 8,
                      },
                    });
                  }
                  return settings;
                }
                if (method === 'update' && args[0]?.where?.id === 'default') {
                  let existing = await delegate.findFirst({ where: { userId } });
                  if (!existing) {
                    return delegate.create({
                      data: {
                        userId,
                        ...args[0].data,
                      },
                    });
                  }
                  return delegate.update({
                    where: { id: existing.id },
                    data: args[0].data,
                  });
                }
              }

              const finalArgs = injectUserIdIntoArgs(method, args, userId);
              return delegate[method](...finalArgs);
            };
          },
        }
      );
    },
  });
}

export const prisma: PrismaClient = createMultiTenantPrismaProxy();
