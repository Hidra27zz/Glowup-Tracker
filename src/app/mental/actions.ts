'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function logMood(formData: FormData) {
  const energy = parseInt(formData.get('energy') as string, 10);
  const mood = parseInt(formData.get('mood') as string, 10);
  const socialBattery = parseInt(formData.get('socialBattery') as string, 10);
  const notes = formData.get('notes') as string;

  if (isNaN(energy) || isNaN(mood)) {
    throw new Error('Energy and Mood are required');
  }

  await prisma.moodLog.create({
    data: {
      energy,
      mood,
      socialBattery: isNaN(socialBattery) ? null : socialBattery,
      notes,
    }
  });

  revalidatePath('/mental');
  revalidatePath('/'); // Update dashboard if needed
}

export async function startDetoxSession() {
  await prisma.detoxSession.create({
    data: {
      startDate: new Date(),
    }
  });
  revalidatePath('/mental');
}

export async function endDetoxSession(id: string, success: boolean, notes?: string) {
  await prisma.detoxSession.update({
    where: { id },
    data: {
      endDate: new Date(),
      success,
      notes,
    }
  });
  revalidatePath('/mental');
}

export async function logInformationDiet(formData: FormData) {
  const junkTime = parseInt(formData.get('junkTime') as string, 10);
  const valuableTime = parseInt(formData.get('valuableTime') as string, 10);
  const notes = formData.get('notes') as string;

  if (isNaN(junkTime) || isNaN(valuableTime)) {
    throw new Error('Times are required');
  }

  await prisma.informationDietLog.create({
    data: {
      junkTime,
      valuableTime,
      notes,
    }
  });

  revalidatePath('/mental');
}
