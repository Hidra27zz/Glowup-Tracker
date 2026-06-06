'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// -- Subscriptions --
export async function addSubscription(formData: FormData) {
  const name = formData.get('name') as string;
  const cost = parseFloat(formData.get('cost') as string);
  const frequency = formData.get('frequency') as string;
  const renewalDateStr = formData.get('renewalDate') as string;

  if (!name || isNaN(cost) || !renewalDateStr) throw new Error('Missing required fields');

  await prisma.subscription.create({
    data: {
      name,
      cost,
      frequency,
      renewalDate: new Date(renewalDateStr),
    }
  });

  revalidatePath('/finance');
}

export async function deleteSubscription(id: string) {
  await prisma.subscription.delete({ where: { id } });
  revalidatePath('/finance');
}

// -- Financial Transactions (Burn Rate) --
export async function addTransaction(formData: FormData) {
  const amount = parseFloat(formData.get('amount') as string);
  const category = formData.get('category') as string;
  const type = formData.get('type') as string;
  const notes = formData.get('notes') as string;
  const dateStr = formData.get('date') as string;

  if (isNaN(amount) || !category || !type) throw new Error('Missing fields');

  await prisma.financialTransaction.create({
    data: {
      amount,
      category,
      type,
      notes,
      date: dateStr ? new Date(dateStr) : new Date(),
    }
  });

  revalidatePath('/finance');
}

export async function deleteTransaction(id: string) {
  await prisma.financialTransaction.delete({ where: { id } });
  revalidatePath('/finance');
}

// -- Impulse Buy Blocker --
export async function addImpulseBuy(formData: FormData) {
  const name = formData.get('name') as string;
  const price = parseFloat(formData.get('price') as string);

  if (!name || isNaN(price)) throw new Error('Missing fields');

  await prisma.impulseBuyItem.create({
    data: {
      name,
      price,
      status: 'WAITING',
    }
  });

  revalidatePath('/finance');
}

export async function updateImpulseBuyStatus(id: string, status: string) {
  await prisma.impulseBuyItem.update({
    where: { id },
    data: { status }
  });
  revalidatePath('/finance');
}

export async function deleteImpulseBuy(id: string) {
  await prisma.impulseBuyItem.delete({ where: { id } });
  revalidatePath('/finance');
}

// -- Inventory & PAO Tracker --
export async function addInventoryItem(formData: FormData) {
  const name = formData.get('name') as string;
  const cost = parseFloat(formData.get('cost') as string);
  const paoMonthsStr = formData.get('paoMonths') as string;

  if (!name || isNaN(cost)) throw new Error('Missing fields');

  const paoMonths = paoMonthsStr ? parseInt(paoMonthsStr, 10) : null;

  await prisma.inventoryItem.create({
    data: {
      name,
      cost,
      paoMonths,
      openedAt: paoMonths ? new Date() : null, // If tracking PAO, assume opened immediately or add custom date later
    }
  });

  revalidatePath('/finance');
}

export async function incrementItemUse(id: string) {
  await prisma.inventoryItem.update({
    where: { id },
    data: {
      uses: { increment: 1 }
    }
  });
  revalidatePath('/finance');
}

export async function deleteInventoryItem(id: string) {
  await prisma.inventoryItem.delete({ where: { id } });
  revalidatePath('/finance');
}
