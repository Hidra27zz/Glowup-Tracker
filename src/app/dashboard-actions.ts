'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function hydrate() {
  // Find today's mood log or create one to store hydration
  const today = new Date();
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

export async function quickAddCalories(formData: FormData) {
  const amountStr = formData.get('amount') as string;
  const amount = parseInt(amountStr, 10);
  if (isNaN(amount) || amount <= 0) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingLog = await prisma.nutritionLog.findFirst({
    where: {
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  });

  if (existingLog) {
    await prisma.nutritionLog.update({
      where: { id: existingLog.id },
      data: { calories: { increment: amount } }
    });
  } else {
    await prisma.nutritionLog.create({
      data: {
        date: today,
        calories: amount
      }
    });
  }

  revalidatePath('/');
}

export async function quickAddExpense(formData: FormData) {
  const amountStr = formData.get('amount') as string;
  const notes = formData.get('notes') as string;
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) return;

  await prisma.financialTransaction.create({
    data: {
      amount,
      notes,
      category: 'Quick Expense',
      type: 'expense'
    }
  });

  revalidatePath('/');
}

export async function quickAddWeight(formData: FormData) {
  const weightStr = formData.get('weight') as string;
  const weight = parseFloat(weightStr);
  if (isNaN(weight) || weight <= 0) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingLog = await prisma.bodyMetric.findFirst({
    where: {
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  });

  if (existingLog) {
    await prisma.bodyMetric.update({
      where: { id: existingLog.id },
      data: { weight }
    });
  } else {
    await prisma.bodyMetric.create({
      data: {
        date: today,
        weight
      }
    });
  }

  revalidatePath('/');
}

export async function quickAddDeepWork(duration: number) {
  await prisma.deepWorkSession.create({
    data: {
      duration,
      taskName: 'Quick Focus Session'
    }
  });

  revalidatePath('/');
}

export async function toggleFasting() {
  const settings = await prisma.userSettings.findUnique({ where: { id: 'default' } });
  if (!settings) return;

  if (settings.fastingStart) {
    // End fast
    await prisma.userSettings.update({
      where: { id: 'default' },
      data: { fastingStart: null }
    });
  } else {
    // Start fast
    await prisma.userSettings.update({
      where: { id: 'default' },
      data: { fastingStart: new Date() }
    });
  }
  revalidatePath('/');
}

export async function logInfoDiet(type: 'junk' | 'valuable', minutes: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingLog = await prisma.informationDietLog.findFirst({
    where: {
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  });

  const data = type === 'junk' 
    ? { junkTime: { increment: minutes }, valuableTime: { increment: 0 } }
    : { valuableTime: { increment: minutes }, junkTime: { increment: 0 } };

  if (existingLog) {
    await prisma.informationDietLog.update({
      where: { id: existingLog.id },
      data
    });
  } else {
    await prisma.informationDietLog.create({
      data: {
        date: today,
        junkTime: type === 'junk' ? minutes : 0,
        valuableTime: type === 'valuable' ? minutes : 0
      }
    });
  }

  revalidatePath('/');
}
