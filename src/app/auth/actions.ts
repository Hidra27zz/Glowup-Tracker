'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { prisma, resetGuestMockupDatabase } from '@/lib/prisma';

const COOKIE_NAME = 'glowup_auth_user';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  majorOrField: string;
  role: string;
}

function hashPassword(password: string): string {
  const salt = 'glowup_os_salt_v1';
  return crypto.scryptSync(password, salt, 32).toString('hex');
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
        passwordHash: hashPassword(password),
        majorOrField,
        role: 'USER',
      },
    });

    const sessionUser: SessionUser = {
      id: created.id,
      name: created.name,
      email: created.email,
      majorOrField: created.majorOrField || 'Đa ngành',
      role: created.role,
    };

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, JSON.stringify(sessionUser), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

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

    const hashed = hashPassword(password);
    if (user.passwordHash !== hashed) {
      return { success: false, error: 'Mật khẩu không chính xác.' };
    }

    const sessionUser: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      majorOrField: user.majorOrField || 'Đa ngành',
      role: user.role,
    };

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, JSON.stringify(sessionUser), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

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
        passwordHash: hashPassword('123456'),
        majorOrField: 'Đa ngành & Phát triển bản thân',
        role: 'ADMIN',
      },
    });
  }

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    majorOrField: user.majorOrField || 'Đa ngành',
    role: user.role,
  };

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, JSON.stringify(sessionUser), {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  });

  revalidatePath('/');
  return { success: true, user: sessionUser };
}

export async function switchAccountByIdAction(userId: string): Promise<{
  success: boolean;
  user?: SessionUser;
}> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false };

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    majorOrField: user.majorOrField || 'Đa ngành',
    role: user.role,
  };

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, JSON.stringify(sessionUser), {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  });

  revalidatePath('/');
  return { success: true, user: sessionUser };
}

export async function logoutUserAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  await resetGuestMockupDatabase();
  revalidatePath('/');
}

export async function getSessionUserAction(): Promise<{
  currentUser: SessionUser | null;
  accounts: SessionUser[];
}> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(COOKIE_NAME)?.value;
    let currentUser: SessionUser | null = null;
    if (raw) {
      try {
        currentUser = JSON.parse(raw) as SessionUser;
      } catch {
        currentUser = null;
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
