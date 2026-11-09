import { NextResponse } from 'next/server';
import { resetGuestMockupDatabase } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST() {
  await resetGuestMockupDatabase();
  revalidatePath('/');
  revalidatePath('/tasks');
  revalidatePath('/health');
  revalidatePath('/nutrition');
  revalidatePath('/finance');
  revalidatePath('/career');
  revalidatePath('/mental');
  revalidatePath('/crm');
  revalidatePath('/memory');
  return NextResponse.json({ ok: true, message: 'Đã đặt lại dữ liệu Mockup mặc định.' });
}
