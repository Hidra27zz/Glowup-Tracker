'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addMemory(formData: FormData) {
  const content = formData.get('content') as string;
  const tags = formData.get('tags') as string;
  const mediaUrls = formData.get('mediaUrls') as string;
  const isTimeCapsule = formData.get('isTimeCapsule') === 'on';
  const unlockDateStr = formData.get('unlockDate') as string;

  if (!content) throw new Error('Content is required');

  await prisma.memoryVault.create({
    data: {
      content,
      tags,
      mediaUrls,
      isTimeCapsule,
      unlockDate: isTimeCapsule && unlockDateStr ? new Date(unlockDateStr) : null,
    }
  });

  revalidatePath('/memory');
}

export async function deleteMemory(id: string) {
  await prisma.memoryVault.delete({ where: { id } });
  revalidatePath('/memory');
}

export async function addBrainDump(formData: FormData) {
  const content = formData.get('content') as string;
  
  if (!content) throw new Error('Content is required');

  await prisma.brainDump.create({
    data: { content }
  });

  revalidatePath('/memory');
}

export async function deleteBrainDumpItem(id: string) {
  await prisma.brainDump.delete({ where: { id } });
  revalidatePath('/memory');
}

export async function clearBrainDump() {
  await prisma.brainDump.deleteMany({});
  revalidatePath('/memory');
}
