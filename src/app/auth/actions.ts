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

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  majorOrField: string;
  role: string;
  sessionToken?: string;
}

async function createDbSessionAndSetCookie(user: {
  id: string;
  name: string;
  email: string;
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
      return { success: false, error: 'Email này đã được đăng ký. Vui lòng chuyển sang tab Đăng nhập.' };
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
        error: 'Không tìm thấy tài khoản với Email này. Bạn có thể tạo mới ở tab Đăng ký.',
      };
    }

    if (!verifyPasswordSecure(password, user.passwordHash)) {
      return { success: false, error: 'Mật khẩu không chính xác.' };
    }

    const sessionUser = await createDbSessionAndSetCookie(user);
    revalidatePath('/');
    return { success: true, user: sessionUser };
  } catch (err: any) {
    console.error('[loginUserAction Error]:', err);
    return { success: false, error: 'Đã xảy ra lỗi khi đăng nhập.' };
  }
}

export async function quickDemoLoginAction(): Promise<{
  success: boolean;
  user?: SessionUser;
}> {
  const email = 'member@glowup.os';
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'GlowUp Creator',
        email,
        passwordHash: hashPasswordSecure('123456'),
        majorOrField: 'Đa ngành & Phát triển bản thân',
        role: 'ADMIN',
      },
    });
  }

  const sessionUser = await createDbSessionAndSetCookie(user);
  revalidatePath('/');
  return { success: true, user: sessionUser };
}

export async function switchAccountByIdAction(userId: string): Promise<{
  success: boolean;
  user?: SessionUser;
}> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false };

  const sessionUser = await createDbSessionAndSetCookie(user);
  revalidatePath('/');
  return { success: true, user: sessionUser };
}

export async function updateProfileAction(formData: FormData): Promise<{
  success: boolean;
  error?: string;
  message?: string;
  user?: SessionUser;
}> {
  try {
    const cookieStore = await cookies();
    const verified = verifySessionCookieValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
    if (!verified) {
      return { success: false, error: 'Bạn cần đăng nhập để cập nhật hồ sơ.' };
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
      message: 'Đã cập nhật thông tin tài khoản & bảo mật.',
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
  accounts: SessionUser[];
}> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const verified = verifySessionCookieValue(raw);
    let currentUser: SessionUser | null = null;

    if (verified) {
      // Check DB session validity if sessionToken is present
      if (verified.sessionToken) {
        try {
          const dbSession = await prisma.authSession.findUnique({
            where: { token: verified.sessionToken },
            include: { user: true },
          });
          if (dbSession && dbSession.expiresAt > new Date() && dbSession.user) {
            currentUser = {
              id: dbSession.user.id,
              name: dbSession.user.name,
              email: dbSession.user.email,
              majorOrField: dbSession.user.majorOrField || 'Đa ngành',
              role: dbSession.user.role,
              sessionToken: dbSession.token,
            };
          } else {
            currentUser = {
              id: verified.id,
              name: verified.name,
              email: verified.email,
              majorOrField: verified.majorOrField,
              role: verified.role,
            };
          }
        } catch {
          currentUser = {
            id: verified.id,
            name: verified.name,
            email: verified.email,
            majorOrField: verified.majorOrField,
            role: verified.role,
          };
        }
      } else {
        currentUser = {
          id: verified.id,
          name: verified.name,
          email: verified.email,
          majorOrField: verified.majorOrField,
          role: verified.role,
        };
      }
    }

    const dbUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const accounts: SessionUser[] = dbUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      majorOrField: u.majorOrField || 'Đa ngành',
      role: u.role,
    }));

    return { currentUser, accounts };
  } catch {
    return { currentUser: null, accounts: [] };
  }
}
