'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { parseQuickEntry } from '@/lib/utils/financeInsights';

export async function addQuickTransactionAction(
  text: string
): Promise<{ success: boolean; error?: string; summary?: string }> {
  const parsed = parseQuickEntry(text);
  if (!parsed) {
    return { success: false, error: 'Không nhận ra số tiền. Thử: "cà phê 30k", "lương 15tr", "grab 45.000".' };
  }
  await prisma.financialTransaction.create({
    data: {
      amount: parsed.amount,
      category: parsed.category,
      type: parsed.type,
      notes: parsed.note,
      date: new Date(),
    },
  });
  revalidatePath('/finance');
  return {
    success: true,
    summary: `${parsed.type === 'income' ? 'Thu' : 'Chi'} ${parsed.amount.toLocaleString('vi-VN')}đ • ${parsed.category} • ${parsed.note}`,
  };
}

export async function setBudgetAction(category: string, monthlyLimit: number) {
  if (!category || !(monthlyLimit > 0)) return;
  const existing = await prisma.budget.findFirst({ where: { category } });
  if (existing) {
    await prisma.budget.update({ where: { id: existing.id }, data: { monthlyLimit } });
  } else {
    await prisma.budget.create({ data: { category, monthlyLimit } });
  }
  revalidatePath('/finance');
}

export async function deleteBudgetAction(id: string) {
  await prisma.budget.delete({ where: { id } });
  revalidatePath('/finance');
}

export async function addSavingsGoalAction(name: string, targetAmount: number, deadline?: string) {
  if (!name.trim() || !(targetAmount > 0)) return;
  await prisma.savingsGoal.create({
    data: {
      name: name.trim(),
      targetAmount,
      deadline: deadline ? new Date(deadline) : null,
    },
  });
  revalidatePath('/finance');
}

export async function contributeSavingsGoalAction(id: string, amount: number) {
  if (!(amount > 0)) return;
  await prisma.savingsGoal.update({
    where: { id },
    data: { savedAmount: { increment: amount } },
  });
  revalidatePath('/finance');
}

export async function deleteSavingsGoalAction(id: string) {
  await prisma.savingsGoal.delete({ where: { id } });
  revalidatePath('/finance');
}
