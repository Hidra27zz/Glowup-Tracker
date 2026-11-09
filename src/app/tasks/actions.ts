'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addTask(formData: FormData) {
  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || null;
  const category = (formData.get('category') as string) || 'TASK';
  const location = (formData.get('location') as string) || null;
  const energyLevel = (formData.get('energyLevel') as string) || 'Medium';
  const startTimeStr = formData.get('startTime') as string;
  const deadlineStr = formData.get('deadline') as string;
  const sprintId = formData.get('sprintId') as string;
  const isCoreTask = formData.get('isCoreTask') === 'true' || formData.get('isCoreTask') === 'on';
  const blockedById = formData.get('blockedById') as string;

  if (!title || !deadlineStr) {
    throw new Error('Missing required fields');
  }

  const deadlineDate = new Date(deadlineStr);
  const startDate = startTimeStr ? new Date(startTimeStr) : new Date(deadlineDate.getTime() - 60 * 60 * 1000);

  await prisma.task.create({
    data: {
      title,
      description,
      category,
      location,
      energyLevel,
      startTime: startDate,
      deadline: deadlineDate,
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

export async function submitOverdueReport(id: string, overdueNote: string, newDeadlineStr?: string) {
  const data: any = {
    overdueNote,
  };
  if (newDeadlineStr) {
    data.deadline = new Date(newDeadlineStr);
  }
  await prisma.task.update({
    where: { id },
    data,
  });
  revalidatePath('/tasks');
  revalidatePath('/');
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath('/tasks');
  revalidatePath('/');
}

export async function createSprint(formData: FormData) {
  const name = formData.get('name') as string;
  const startStr = formData.get('startDate') as string;
  const endStr = formData.get('endDate') as string;
  const selectedTaskIds = formData.getAll('taskIds') as string[];

  if (!name || !startStr || !endStr) throw new Error('Missing required fields');

  const startDate = new Date(startStr);
  const endDate = new Date(endStr);
  // Set endDate to end of day if only date was provided
  if (endStr.length <= 10) {
    endDate.setHours(23, 59, 59, 999);
  }

  const sprint = await prisma.sprint.create({
    data: {
      name,
      startDate,
      endDate,
      isActive: true,
    }
  });

  if (selectedTaskIds.length > 0) {
    await prisma.task.updateMany({
      where: { id: { in: selectedTaskIds } },
      data: { sprintId: sprint.id }
    });
  }

  revalidatePath('/tasks');
  revalidatePath('/');
}

export async function assignTaskToSprint(taskId: string, sprintId: string | null) {
  await prisma.task.update({
    where: { id: taskId },
    data: { sprintId }
  });
  revalidatePath('/tasks');
  revalidatePath('/');
}

export async function deleteSprint(id: string) {
  await prisma.task.updateMany({
    where: { sprintId: id },
    data: { sprintId: null }
  });
  await prisma.sprint.delete({ where: { id } });
  revalidatePath('/tasks');
  revalidatePath('/');
}

// ═══════════════════════════════════════════════════════════════════
// SMART GOALS ACTIONS
// ═══════════════════════════════════════════════════════════════════

export async function createSmartGoal(formData: FormData) {
  const title = formData.get('title') as string;
  const category = (formData.get('category') as string) || 'Personal';
  const specific = formData.get('specific') as string;
  const measurable = formData.get('measurable') as string;
  const currentValue = parseFloat((formData.get('currentValue') as string) || '0') || 0;
  const targetValue = parseFloat((formData.get('targetValue') as string) || '100') || 100;
  const unit = (formData.get('unit') as string) || '%';
  const achievable = formData.get('achievable') as string;
  const relevant = formData.get('relevant') as string;
  const startDateStr = formData.get('startDate') as string;
  const deadlineStr = formData.get('deadline') as string;

  if (!title || !specific || !measurable || !achievable || !relevant || !deadlineStr) {
    throw new Error('Vui lòng điền đầy đủ 5 tiêu chí SMART');
  }

  await prisma.smartGoal.create({
    data: {
      title,
      category,
      specific,
      measurable,
      currentValue,
      targetValue,
      unit,
      achievable,
      relevant,
      startDate: startDateStr ? new Date(startDateStr) : new Date(),
      deadline: new Date(deadlineStr),
      status: currentValue >= targetValue ? 'COMPLETED' : 'IN_PROGRESS',
    }
  });

  // Also sync top goal summary to userSettings.bodyRecompGoal if category === 'Health'
  if (category === 'Health') {
    await prisma.userSettings.upsert({
      where: { id: 'default' },
      update: { bodyRecompGoal: `${title} (${currentValue}/${targetValue} ${unit})` },
      create: { id: 'default', bodyRecompGoal: `${title} (${currentValue}/${targetValue} ${unit})` },
    });
  }

  revalidatePath('/');
  revalidatePath('/tasks');
  revalidatePath('/health');
}

export async function updateSmartGoalProgress(id: string, currentValue: number) {
  const goal = await prisma.smartGoal.findUnique({ where: { id } });
  if (!goal) return;

  const isCompleted =
    goal.targetValue >= goal.currentValue
      ? currentValue >= goal.targetValue
      : currentValue <= goal.targetValue;

  await prisma.smartGoal.update({
    where: { id },
    data: {
      currentValue,
      status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
    }
  });

  revalidatePath('/');
  revalidatePath('/tasks');
  revalidatePath('/health');
}

export async function deleteSmartGoal(id: string) {
  await prisma.smartGoal.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/tasks');
  revalidatePath('/health');
}
