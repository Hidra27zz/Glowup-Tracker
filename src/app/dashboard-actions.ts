'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function hydrate(dateStr: string) {
  // Find today's mood log or create one to store hydration
  const today = new Date(dateStr);
  today.setHours(0, 0, 0, 0);

  const existingLog = await prisma.moodLog.findFirst({
    where: {
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  });

  if (existingLog) {
    await prisma.moodLog.update({
      where: { id: existingLog.id },
      data: { hydration: { increment: 1 } }
    });
  } else {
    await prisma.moodLog.create({
      data: {
        date: today,
        energy: 5, // defaults
        mood: 5,
        hydration: 1
      }
    });
  }

  revalidatePath('/');
}

export async function quickLog(formData: FormData) {
  const content = formData.get('content') as string;
  if (!content) return;

  await prisma.brainDump.create({
    data: { content }
  });

  revalidatePath('/');
  revalidatePath('/memory');
}

export async function triggerSOS() {
  await prisma.brainDump.create({
    data: { content: "[SOS] Đã kích hoạt hệ thống cấp cứu cảm xúc. Cần nghỉ ngơi ngay lập tức." }
  });
  
  // Note: in a real app, this could also send a webhook or trigger a notification

  revalidatePath('/');
  revalidatePath('/memory');
}
