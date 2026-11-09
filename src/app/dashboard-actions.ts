'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function hydrate(glasses: number = 1) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingLog = await prisma.moodLog.findFirst({
    where: {
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });

  if (existingLog) {
    await prisma.moodLog.update({
      where: { id: existingLog.id },
      data: { hydration: { increment: glasses } },
    });
  } else {
    await prisma.moodLog.create({
      data: {
        date: today,
        energy: 7,
        mood: 7,
        hydration: glasses,
      },
    });
  }

  revalidatePath('/');
  revalidatePath('/health');
}

export async function quickLog(formData: FormData) {
  const content = formData.get('content') as string;
  if (!content) return;

  await prisma.brainDump.create({
    data: { content },
  });

  revalidatePath('/');
  revalidatePath('/memory');
}

export async function triggerSOS() {
  await prisma.brainDump.create({
    data: { content: '[SOS] Đã kích hoạt hệ thống cấp cứu cảm xúc. Cần nghỉ ngơi ngay lập tức.' },
  });

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
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });

  if (existingLog) {
    await prisma.nutritionLog.update({
      where: { id: existingLog.id },
      data: { calories: { increment: amount } },
    });
  } else {
    await prisma.nutritionLog.create({
      data: {
        date: today,
        calories: amount,
      },
    });
  }

  revalidatePath('/');
  revalidatePath('/health');
  revalidatePath('/nutrition');
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
      type: 'expense',
    },
  });

  revalidatePath('/');
  revalidatePath('/finance');
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
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });

  if (existingLog) {
    await prisma.bodyMetric.update({
      where: { id: existingLog.id },
      data: { weight },
    });
  } else {
    await prisma.bodyMetric.create({
      data: {
        date: today,
        weight,
      },
    });
  }

  revalidatePath('/');
  revalidatePath('/health');
}

export async function quickAddDeepWork(duration: number, taskName: string = 'Quick Focus Session') {
  await prisma.deepWorkSession.create({
    data: {
      duration,
      taskName,
    },
  });

  revalidatePath('/');
  revalidatePath('/career');
}

export async function toggleFasting() {
  const settings = await prisma.userSettings.findUnique({ where: { id: 'default' } });
  if (!settings) return;

  if (settings.fastingStart) {
    await prisma.userSettings.update({
      where: { id: 'default' },
      data: { fastingStart: null },
    });
  } else {
    await prisma.userSettings.update({
      where: { id: 'default' },
      data: { fastingStart: new Date() },
    });
  }
  revalidatePath('/');
  revalidatePath('/health');
}

export async function logInfoDiet(type: 'junk' | 'valuable', minutes: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingLog = await prisma.informationDietLog.findFirst({
    where: {
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });

  const data =
    type === 'junk'
      ? { junkTime: { increment: minutes }, valuableTime: { increment: 0 } }
      : { valuableTime: { increment: minutes }, junkTime: { increment: 0 } };

  if (existingLog) {
    await prisma.informationDietLog.update({
      where: { id: existingLog.id },
      data,
    });
  } else {
    await prisma.informationDietLog.create({
      data: {
        date: today,
        junkTime: type === 'junk' ? minutes : 0,
        valuableTime: type === 'valuable' ? minutes : 0,
      },
    });
  }

  revalidatePath('/');
}

// ============================================================================
// VIETNAMESE FOOD & DAILY ACTIVITY AUTO-ESTIMATOR (NO MANUAL MATH REQUIRED)
// ============================================================================
interface FoodMacroEstimate {
  keywords: string[];
  label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const VN_FOOD_CATALOG: FoodMacroEstimate[] = [
  { keywords: ['phở bò', 'pho bo', 'phở'], label: 'Phở bò', calories: 480, protein: 26, carbs: 62, fat: 12 },
  { keywords: ['phở gà', 'pho ga'], label: 'Phở gà', calories: 430, protein: 28, carbs: 58, fat: 9 },
  { keywords: ['cơm tấm', 'com tam', 'cơm sườn'], label: 'Cơm tấm sườn', calories: 650, protein: 32, carbs: 75, fat: 22 },
  { keywords: ['bún bò', 'bun bo'], label: 'Bún bò Huế', calories: 540, protein: 28, carbs: 64, fat: 16 },
  { keywords: ['bánh mì', 'banh mi'], label: 'Bánh mì thịt/trứng', calories: 380, protein: 16, carbs: 46, fat: 14 },
  { keywords: ['ức gà', 'uc ga'], label: 'Ức gà áp chảo (200g)', calories: 330, protein: 62, carbs: 0, fat: 7 },
  { keywords: ['trứng', 'trung luoc', 'trứng ốp'], label: '2 Quả trứng gà', calories: 155, protein: 13, carbs: 1, fat: 11 },
  { keywords: ['cơm văn phòng', 'cơm trưa', 'com trua', 'cơm gà', 'cơm thịt'], label: 'Phần cơm chuẩn', calories: 580, protein: 28, carbs: 72, fat: 16 },
  { keywords: ['salad', 'eat clean', 'rau trộn'], label: 'Salad Eat Clean', calories: 320, protein: 24, carbs: 22, fat: 14 },
  { keywords: ['cà phê sữa', 'ca phe sua', 'bạc xỉu'], label: 'Cà phê sữa', calories: 160, protein: 3, carbs: 26, fat: 5 },
  { keywords: ['cà phê đen', 'americano', 'cafe'], label: 'Cà phê', calories: 35, protein: 1, carbs: 6, fat: 0 },
  { keywords: ['trà sữa', 'tra sua'], label: 'Trà sữa', calories: 380, protein: 4, carbs: 68, fat: 10 },
  { keywords: ['yến mạch', 'yen mach', 'oatmeal'], label: 'Yến mạch + Sữa', calories: 310, protein: 14, carbs: 48, fat: 6 },
  { keywords: ['whey', 'protein shake'], label: '1 Muỗng Whey Protein', calories: 120, protein: 25, carbs: 3, fat: 1.5 },
  { keywords: ['chuối', 'chuoi'], label: 'Chuối chín', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { keywords: ['sữa chua', 'sua chua', 'yogurt'], label: 'Sữa chua Hy Lạp', calories: 130, protein: 11, carbs: 12, fat: 4 },
  { keywords: ['hủ tiếu', 'hu tieu', 'miến'], label: 'Hủ tiếu / Miến', calories: 420, protein: 22, carbs: 56, fat: 11 },
];

export async function smartAutoLogAction(rawInput: string): Promise<{
  success: boolean;
  summary: string[];
}> {
  const input = rawInput.trim();
  if (!input) return { success: false, summary: [] };

  const lower = input.toLowerCase();
  const actionsTaken: string[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Detect Food & Automatically Calculate Calories + Macros
  let totalCals = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  const matchedFoods: string[] = [];

  for (const item of VN_FOOD_CATALOG) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      totalCals += item.calories;
      totalProtein += item.protein;
      totalCarbs += item.carbs;
      totalFat += item.fat;
      matchedFoods.push(item.label);
    }
  }

  // Also check explicit calorie mention like "500 calo" or "500 kcal" if no catalog food matched
  const explicitCalMatch = lower.match(/(\d{2,4})\s*(kcal|calo|cal)/i);
  if (explicitCalMatch && totalCals === 0) {
    totalCals = parseInt(explicitCalMatch[1], 10);
    totalProtein = Math.round((totalCals * 0.25) / 4);
    totalCarbs = Math.round((totalCals * 0.45) / 4);
    totalFat = Math.round((totalCals * 0.3) / 9);
    matchedFoods.push(`${totalCals} kcal`);
  } else if (
    totalCals === 0 &&
    (lower.includes('ăn sáng') || lower.includes('ăn trưa') || lower.includes('ăn tối'))
  ) {
    totalCals = 500;
    totalProtein = 25;
    totalCarbs = 60;
    totalFat = 15;
    matchedFoods.push('Bữa ăn tiêu chuẩn');
  }

  if (totalCals > 0) {
    const existingNutri = await prisma.nutritionLog.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingNutri) {
      await prisma.nutritionLog.update({
        where: { id: existingNutri.id },
        data: {
          calories: { increment: totalCals },
          protein: { increment: totalProtein },
          carbs: { increment: totalCarbs },
          fat: { increment: totalFat },
        },
      });
    } else {
      await prisma.nutritionLog.create({
        data: {
          date: today,
          calories: totalCals,
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat,
        },
      });
    }
    actionsTaken.push(
      `Dinh dưỡng (${matchedFoods.join(', ')}): +${totalCals} kcal, +${totalProtein}g Protein, +${totalCarbs}g Carbs, +${totalFat}g Fat`
    );
  }

  // 2. Detect Money / Expenses (e.g., "45k", "120k", "50 nghìn", "2tr")
  const moneyRegex = /(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngàn|tr|triệu|đ|vnd)\b/gi;
  let moneyMatch: RegExpExecArray | null;
  while ((moneyMatch = moneyRegex.exec(lower)) !== null) {
    const rawNum = parseFloat(moneyMatch[1].replace(',', '.'));
    const unit = moneyMatch[2].toLowerCase();
    let amountVnd = rawNum;
    if (unit === 'k' || unit === 'nghìn' || unit === 'ngàn') {
      amountVnd = rawNum * 1000;
    } else if (unit === 'tr' || unit === 'triệu') {
      amountVnd = rawNum * 1000000;
    }
    if (amountVnd >= 1000) {
      const isIncome = lower.includes('lương') || lower.includes('thu nhập') || lower.includes('nhận được');
      await prisma.financialTransaction.create({
        data: {
          amount: amountVnd,
          notes: input,
          category: matchedFoods.length > 0 ? 'Ăn uống' : 'Chi tiêu hàng ngày',
          type: isIncome ? 'income' : 'expense',
        },
      });
      actionsTaken.push(
        `Tài chính: Đã ghi ${isIncome ? 'Thu nhập' : 'Chi tiêu'} ${amountVnd.toLocaleString('vi-VN')}đ`
      );
    }
  }

  // 3. Detect Water / Hydration (e.g., "2 ly nước", "uống nước", "500ml nước")
  const waterGlassesMatch = lower.match(/(\d+)\s*(ly|cốc)\s*nước/i);
  const waterMlMatch = lower.match(/(\d{3,4})\s*ml\s*nước/i);
  if (waterGlassesMatch) {
    const glasses = parseInt(waterGlassesMatch[1], 10);
    await hydrate(glasses);
    actionsTaken.push(`Nước uống: +${glasses} ly nước`);
  } else if (waterMlMatch) {
    const glasses = Math.max(1, Math.round(parseInt(waterMlMatch[1], 10) / 250));
    await hydrate(glasses);
    actionsTaken.push(`Nước uống: +${glasses} ly (${waterMlMatch[1]}ml)`);
  } else if (lower.includes('uống nước')) {
    await hydrate(1);
    actionsTaken.push(`Nước uống: +1 ly nước`);
  }

  // 4. Detect Weight (e.g., "cân nặng 54.5kg" or "nặng 60kg")
  const weightMatch = lower.match(/(?:cân nặng|nặng|cân)\s*(\d{2,3}(?:[.,]\d+)?)\s*kg/i);
  if (weightMatch) {
    const w = parseFloat(weightMatch[1].replace(',', '.'));
    const fd = new FormData();
    fd.set('weight', String(w));
    await quickAddWeight(fd);
    actionsTaken.push(`Cân nặng: Cập nhật ${w} kg`);
  }

  // 5. Detect Deep Work / Study / Workout duration (e.g., "học 45 phút", "tập gym 30 phút", "chạy bộ 20p")
  const durationMatch = lower.match(/(?:học|làm việc|deep work|tập|gym|chạy bộ|đọc sách)[^0-9]*(\d{1,3})\s*(?:phút|p\b|mins)/i);
  if (durationMatch) {
    const mins = parseInt(durationMatch[1], 10);
    if (lower.includes('tập') || lower.includes('gym') || lower.includes('chạy bộ')) {
      await prisma.workout.create({
        data: {
          title: input,
          type: 'Gym / Cardio',
          duration: mins,
          notes: input,
        },
      });
      actionsTaken.push(`Tập luyện: +${mins} phút (~${mins * 6} kcal đốt)`);
    } else {
      await quickAddDeepWork(mins, input);
      actionsTaken.push(`⏱️ Tập trung (Deep Work): +${mins} phút`);
    }
  }

  // 6. If nothing specific matched or if it's a task/appointment/note, save as Task or BrainDump
  if (
    lower.includes('lịch hẹn') ||
    lower.includes('họp') ||
    lower.includes('deadline') ||
    lower.includes('cần làm')
  ) {
    const now = new Date();
    const deadline = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    await prisma.task.create({
      data: {
        title: input,
        status: 'TODO',
        energyLevel: 'MEDIUM',
        category: lower.includes('họp') || lower.includes('hẹn') ? 'APPOINTMENT' : 'GENERAL',
        startTime: now,
        deadline,
      },
    });
    actionsTaken.push(`Lịch trình: Đã tạo công việc/lịch hẹn "${input}"`);
  } else if (actionsTaken.length === 0) {
    await prisma.brainDump.create({
      data: { content: input },
    });
    actionsTaken.push(`Ghi chú nhanh: Đã lưu vào Sổ tay Ký ức`);
  }

  revalidatePath('/');
  revalidatePath('/health');
  revalidatePath('/nutrition');
  revalidatePath('/finance');
  revalidatePath('/tasks');
  revalidatePath('/career');

  return {
    success: true,
    summary: actionsTaken,
  };
}
