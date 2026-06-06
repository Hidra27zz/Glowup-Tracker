'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addPantryItem(formData: FormData) {
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const quantity = formData.get('quantity') as string;

  if (!name) throw new Error('Name is required');

  await prisma.pantryItem.create({
    data: {
      name,
      category,
      quantity,
    },
  });

  revalidatePath('/nutrition');
}

export async function deletePantryItem(id: string) {
  await prisma.pantryItem.delete({
    where: { id },
  });
  
  revalidatePath('/nutrition');
}

