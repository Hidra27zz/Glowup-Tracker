'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { prisma, resetGuestMockupDatabase } from '@/lib/prisma';
import {
  AUTH_COOKIE_NAME,
  hashPasswordSecure,
  verifyPasswordSecure,
  signSessionCookieValue,
  verifySessionCookieValue,
} from '@/lib/authToken';

const ACCOUNTS_BACKUP_COOKIE = 'glowup_accounts_backup';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  majorOrField: string;
  role: string;
  sessionToken?: string;
}

interface BackupUserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  majorOrField: string;
  role: string;
}

async function restoreAccountsFromBackupCookie(): Promise<BackupUserRecord[]> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(ACCOUNTS_BACKUP_COOKIE)?.value;
    if (!raw) return [];
    const list = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as BackupUserRecord[];
    if (!Array.isArray(list)) return [];

    for (const acc of list) {
      if (!acc?.id || !acc?.email || !acc?.passwordHash) continue;
      try {
        await prisma.user.upsert({
          where: { email: acc.email },
          update: {},
          create: {
            id: acc.id,
            name: acc.name || 'Người dùng',
            email: acc.email,
            passwordHash: acc.passwordHash,
            majorOrField: acc.majorOrField || 'Đa ngành',
            role: acc.role || 'USER',
          },
        });
      } catch {
        // ignore upsert conflict
      }
    }
    return list;
  } catch {
    return [];
  }
}

async function saveAccountToBackupCookie(account: BackupUserRecord): Promise<void> {
  try {
    const existing = await restoreAccountsFromBackupCookie();
    const filtered = existing.filter((a) => a.email !== account.email && a.id !== account.id);
    const updated = [account, ...filtered].slice(0, 10);
    const encoded = Buffer.from(JSON.stringify(updated), 'utf8').toString('base64url');
    const cookieStore = await cookies();
    cookieStore.set(ACCOUNTS_BACKUP_COOKIE, encoded, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  } catch {
    // ignore cookie error
  }
}

async function createDbSessionAndSetCookie(user: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  majorOrField: string | null;
  role: string;
}): Promise<SessionUser> {
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  try {
    await prisma.authSession.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });
  } catch {
    // ignore if table still migrating
  }

  await saveAccountToBackupCookie({
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    majorOrField: user.majorOrField || 'Đa ngành',
    role: user.role,
  });

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    majorOrField: user.majorOrField || 'Đa ngành',
    role: user.role,
    sessionToken: token,
  };

  const signedValue = signSessionCookieValue({
    ...sessionUser,
    exp: expiresAt.getTime(),
  });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, signedValue, {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  });

  return sessionUser;
}

export async function registerUserAction(formData: FormData): Promise<{
  success: boolean;
  error?: string;
  user?: SessionUser;
}> {
  try {
    await restoreAccountsFromBackupCookie();

    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '')
      .trim()
      .toLowerCase();
    const password = String(formData.get('password') ?? '');
    const majorOrField = String(formData.get('majorOrField') ?? 'Đa ngành').trim() || 'Đa ngành';

    if (!name || !email || !password) {
      return { success: false, error: 'Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu.' };
    }
    if (password.length < 4) {
      return { success: false, error: 'Mật khẩu cần có ít nhất 4 ký tự.' };
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: 'Email này đã được đăng ký. Vui lòng chuyển sang Đăng nhập.' };
    }

    const created = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashPasswordSecure(password),
        majorOrField,
        role: 'USER',
      },
    });

    const sessionUser = await createDbSessionAndSetCookie(created);
    revalidatePath('/');
    return { success: true, user: sessionUser };
  } catch (err: any) {
    console.error('[registerUserAction Error]:', err);
    return { success: false, error: 'Không thể tạo tài khoản. Vui lòng thử lại.' };
  }
}

export async function loginUserAction(formData: FormData): Promise<{
  success: boolean;
  error?: string;
  user?: SessionUser;
}> {
  try {
    await restoreAccountsFromBackupCookie();

    const email = String(formData.get('email') ?? '')
      .trim()
      .toLowerCase();
    const password = String(formData.get('password') ?? '');

    if (!email || !password) {
      return { success: false, error: 'Vui lòng nhập Email và Mật khẩu.' };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return {
        success: false,
        error: 'Email hoặc mật khẩu chưa đúng, hoặc tài khoản chưa được đăng ký.',
      };
    }

    if (!verifyPasswordSecure(password, user.passwordHash)) {
      return { success: false, error: 'Email hoặc mật khẩu không chính xác.' };
    }

    const sessionUser = await createDbSessionAndSetCookie(user);
    revalidatePath('/');
    return { success: true, user: sessionUser };
  } catch (err: any) {
    console.error('[loginUserAction Error]:', err);
    return { success: false, error: 'Đã xảy ra lỗi khi đăng nhập.' };
  }
}

export async function updateProfileAction(formData: FormData): Promise<{
  success: boolean;
  error?: string;
  message?: string;
  user?: SessionUser;
}> {
  try {
    await restoreAccountsFromBackupCookie();
    const cookieStore = await cookies();
    const verified = verifySessionCookieValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
    if (!verified) {
      return { success: false, error: 'Bạn cần đăng nhập để cập nhật thông tin.' };
    }

    const name = String(formData.get('name') ?? '').trim();
    const majorOrField = String(formData.get('majorOrField') ?? '').trim();
    const newPassword = String(formData.get('newPassword') ?? '').trim();

    const updateData: Record<string, any> = {};
    if (name) updateData.name = name;
    if (majorOrField) updateData.majorOrField = majorOrField;
    if (newPassword) {
      if (newPassword.length < 4) {
        return { success: false, error: 'Mật khẩu mới cần ít nhất 4 ký tự.' };
      }
      updateData.passwordHash = hashPasswordSecure(newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: verified.id },
      data: updateData,
    });

    const sessionUser = await createDbSessionAndSetCookie(updated);
    revalidatePath('/');
    return {
      success: true,
      message: 'Đã lưu thông tin tài khoản.',
      user: sessionUser,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Lỗi khi cập nhật tài khoản.' };
  }
}

export async function logoutUserAction(): Promise<void> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const verified = verifySessionCookieValue(raw);
  if (verified?.sessionToken) {
    try {
      await prisma.authSession.deleteMany({
        where: { token: verified.sessionToken },
      });
    } catch {
      // ignore
    }
  }
  cookieStore.delete(AUTH_COOKIE_NAME);
  await resetGuestMockupDatabase();
  revalidatePath('/');
}

export async function getSessionUserAction(): Promise<{
  currentUser: SessionUser | null;
}> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const verified = verifySessionCookieValue(raw);
    if (!verified) {
      return { currentUser: null };
    }

    return {
      currentUser: {
        id: verified.id,
        name: verified.name,
        email: verified.email,
        majorOrField: verified.majorOrField || 'Đa ngành',
        role: verified.role || 'USER',
      },
    };
  } catch {
    return { currentUser: null };
  }
}
