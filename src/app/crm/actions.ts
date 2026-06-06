'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addContact(formData: FormData) {
  const name = formData.get('name') as string;
  const category = formData.get('category') as string; // Mentor, Partner, Friend, Family
  const notes = formData.get('notes') as string;

  if (!name) throw new Error('Name is required');

  await prisma.contact.create({
    data: {
      name,
      category,
      notes,
    }
  });

  revalidatePath('/crm');
}

export async function deleteContact(id: string) {
  await prisma.contact.delete({ where: { id } });
  revalidatePath('/crm');
}

export async function logInteraction(formData: FormData) {
  const contactId = formData.get('contactId') as string;
  const notes = formData.get('notes') as string;
  const type = formData.get('type') as string;
  const valueGiven = formData.get('valueGiven') === 'true';
  const valueExchangeStr = formData.get('valueExchange') as string;
  
  let valueExchange = 0;
  if (valueExchangeStr) {
    valueExchange = parseInt(valueExchangeStr, 10);
  } else {
    // Tự động tính value exchange nếu có valueGiven (e.g. +1 nếu mình giúp, -1 nếu họ giúp)
    // Nhưng để linh hoạt, ta chỉ log valueGiven vào bảng Interaction
  }

  if (!contactId || !notes) throw new Error('Missing fields');

  await prisma.interaction.create({
    data: {
      contactId,
      notes,
      type,
      valueGiven,
    }
  });

  // Tăng hoặc giảm điểm Value Exchange của Contact dựa trên việc ai giúp ai
  // Giả sử: Mình giúp họ (valueGiven = true) -> +1 điểm
  // Họ giúp mình (valueGiven = false) -> -1 điểm (nợ ân tình)
  const exchangeDelta = valueGiven ? 1 : -1;

  await prisma.contact.update({
    where: { id: contactId },
    data: {
      lastContact: new Date(),
      valueExchange: { increment: exchangeDelta }
    }
  });

  revalidatePath('/crm');
}
