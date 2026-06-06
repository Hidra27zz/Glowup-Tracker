'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addWorkout(formData: FormData) {
  const title = formData.get('title') as string;
  const type = formData.get('type') as string;
  const duration = parseInt(formData.get('duration') as string, 10);
  const notes = formData.get('notes') as string;

  if (!title || !type || isNaN(duration)) {
    throw new Error('Missing required fields');
  }

  await prisma.workout.create({
    data: {
      title,
      type,
      duration,
      notes,
    },
  });

  revalidatePath('/health');
}

export async function deleteWorkout(id: string) {
  await prisma.workout.delete({
    where: { id },
  });
  
  revalidatePath('/health');
}
