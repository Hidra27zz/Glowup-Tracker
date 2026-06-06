'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addTask(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const energyLevel = formData.get('energyLevel') as string;
  const deadlineStr = formData.get('deadline') as string;
  const sprintId = formData.get('sprintId') as string;
  const isCoreTask = formData.get('isCoreTask') === 'true' || formData.get('isCoreTask') === 'on';
  const blockedById = formData.get('blockedById') as string;

  if (!title || !energyLevel || !deadlineStr) {
    throw new Error('Missing required fields');
  }

  await prisma.task.create({
    data: {
      title,
      description,
      energyLevel,
      deadline: new Date(deadlineStr),
      sprintId: sprintId || null,
      isCoreTask,
      blockedById: blockedById || null,
    }
  });

  revalidatePath('/tasks');
  revalidatePath('/');
}

export async function updateTaskStatus(id: string, status: string) {
  const data: any = { status };
  if (status === 'DONE') {
    data.completedAt = new Date();
  } else {
    data.completedAt = null;
  }

  await prisma.task.update({
    where: { id },
    data
  });
  revalidatePath('/tasks');
  revalidatePath('/');
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath('/tasks');
}

export async function createSprint(formData: FormData) {
  const name = formData.get('name') as string;
  const startStr = formData.get('startDate') as string;
  const endStr = formData.get('endDate') as string;

  if (!name || !startStr || !endStr) throw new Error('Missing required fields');

  await prisma.sprint.create({
    data: {
      name,
      startDate: new Date(startStr),
      endDate: new Date(endStr),
    }
  });

  revalidatePath('/tasks');
}
