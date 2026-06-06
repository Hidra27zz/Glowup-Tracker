'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getHealthData() {
  const weightLogs = await prisma.bodyMetric.findMany({
    orderBy: { date: 'asc' },
    take: 30,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayNutrition = await prisma.nutritionLog.findFirst({
    where: {
      date: {
        gte: today,
      },
    },
  });

  const todayHydration = await prisma.moodLog.findFirst({
    where: {
      date: {
        gte: today,
      },
    },
  });

  const recentWorkouts = await prisma.workout.findMany({
    orderBy: { date: 'desc' },
    take: 5,
  });

  const latestSleepLog = await prisma.sleepLog.findFirst({
    orderBy: { date: 'desc' }
  });

  const latestBioCycle = await prisma.bioCycle.findFirst({
    orderBy: { startDate: 'desc' }
  });

  return {
    weightLogs,
    todayNutrition,
    todayHydration: todayHydration?.hydration || 0,
    recentWorkouts,
    latestSleepLog,
    latestBioCycle,
  };
}

export async function getUserSettings() {
  let settings = await prisma.userSettings.findUnique({
    where: { id: "default" }
  });
  if (!settings) {
    settings = await prisma.userSettings.create({
      data: { id: "default" }
    });
  }
  return settings;
}

export async function updateUserSettings(data: {
  bodyRecompGoal?: string;
  goalCal?: number;
  budgetGoal?: number;
  hydrationGoal?: number;
  activeBlueprint?: string | null;
  fastingStart?: Date | null;
}) {
  const result = await prisma.userSettings.update({
    where: { id: "default" },
    data
  });
  revalidatePath('/health');
  return result;
}

export async function addWeightLog(weight: number, bodyFat?: number, chest?: number, waist?: number, hips?: number) {
  const result = await prisma.bodyMetric.create({
    data: { weight, bodyFat, chest, waist, hips },
  });
  revalidatePath('/health');
  return result;
}

export async function updateHydration(amount: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let log = await prisma.moodLog.findFirst({
    where: { date: { gte: today } },
  });

  if (!log) {
    log = await prisma.moodLog.create({
      data: { energy: 5, mood: 5, hydration: amount },
    });
  } else {
    log = await prisma.moodLog.update({
      where: { id: log.id },
      data: { hydration: log.hydration + amount },
    });
  }
  revalidatePath('/health');
  return log;
}

export async function logWorkout(title: string, type: string, duration: number, notes?: string) {
  const result = await prisma.workout.create({
    data: { title, type, duration, notes },
  });
  revalidatePath('/health');
  return result;
}

export async function logNutrition(calories: number, budgetUsed: number, protein: number = 0, carbs: number = 0, fat: number = 0) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let log = await prisma.nutritionLog.findFirst({
    where: { date: { gte: today } },
  });

  let result;
  if (!log) {
    result = await prisma.nutritionLog.create({
      data: { calories, budgetUsed, protein, carbs, fat },
    });
  } else {
    result = await prisma.nutritionLog.update({
      where: { id: log.id },
      data: { 
        calories: log.calories + calories,
        budgetUsed: log.budgetUsed + budgetUsed,
        protein: log.protein + protein,
        carbs: log.carbs + carbs,
        fat: log.fat + fat
      },
    });
  }
  revalidatePath('/health');
  return result;
}

export async function logSleep(sleepTimeStr: string, wakeTimeStr: string) {
  const sleepTime = new Date(sleepTimeStr);
  const wakeTime = new Date(wakeTimeStr);
  
  // Calculate duration in hours
  let durationHours = (wakeTime.getTime() - sleepTime.getTime()) / (1000 * 60 * 60);
  
  // If wakeTime is before sleepTime (e.g. 23:00 to 07:00 next day)
  if (durationHours < 0) {
    wakeTime.setDate(wakeTime.getDate() + 1);
    durationHours = (wakeTime.getTime() - sleepTime.getTime()) / (1000 * 60 * 60);
  }
  
  // Calculate sleep start hour (0-23)
  const startHour = sleepTime.getHours() + sleepTime.getMinutes() / 60;
  
  let qualityScore = 10;
  
  // Penalty for duration (optimal is 7 - 8.5 hours)
  if (durationHours < 7) {
    qualityScore -= (7 - durationHours) * 1.5; // -1.5 points per hour under 7
  } else if (durationHours > 9) {
    qualityScore -= (durationHours - 9) * 1.0; // -1 point per hour over 9
  }
  
  // Penalty for late sleep (optimal is before 23:00)
  if (startHour >= 0 && startHour < 6) {
    qualityScore -= (startHour + 1) * 1.0; // Sleeping at 2AM -> -3 points
  } else if (startHour > 23) {
    qualityScore -= (startHour - 23) * 0.5;
  }
  
  // Clamp between 1 and 10, round to 1 decimal
  qualityScore = Math.max(1, Math.min(10, Math.round(qualityScore * 10) / 10));

  const result = await prisma.sleepLog.create({
    data: {
      sleepTime,
      wakeTime,
      qualityScore
    }
  });
  revalidatePath('/health');
  return result;
}

export async function updateBioCycle(startDate: string, cycleLength: number) {
  const result = await prisma.bioCycle.create({
    data: {
      startDate: new Date(startDate),
      cycleLength
    }
  });
  revalidatePath('/health');
  return result;
}

export async function getPantryItems() {
  return await prisma.pantryItem.findMany({
    orderBy: { expiresAt: 'asc' }
  });
}

export async function addPantryItem(name: string, quantity: string, expiresAt: Date | null) {
  const result = await prisma.pantryItem.create({
    data: { name, quantity, expiresAt, category: 'General' }
  });
  revalidatePath('/health');
  return result;
}

export async function deletePantryItem(id: string) {
  const result = await prisma.pantryItem.delete({
    where: { id }
  });
  revalidatePath('/nutrition');
  revalidatePath('/health');
  return result;
}

export async function updatePantryItemQuantity(id: string, newQuantity: string) {
  const result = await prisma.pantryItem.update({
    where: { id },
    data: { quantity: newQuantity }
  });
  revalidatePath('/nutrition');
  revalidatePath('/health');
  return result;
}

// ==========================================
// ADAPTIVE AI FITNESS MENTOR
// ==========================================
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateBlueprint as fallbackGenerateFitness } from '@/lib/utils/blueprintEngine';

export async function generateFitnessBlueprintAI(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("No GEMINI_API_KEY found, using local fallback regex engine.");
    return fallbackGenerateFitness(prompt);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    // Lấy thông tin Health hiện tại để cá nhân hóa
    const weightLogs = await prisma.bodyMetric.findFirst({ orderBy: { date: 'desc' } });
    const settings = await prisma.userSettings.findUnique({ where: { id: "default" } });
    
    let userContext = "Người dùng chưa có dữ liệu cân nặng.";
    if (weightLogs?.weight) {
      userContext = `Hiện tại người dùng nặng ${weightLogs.weight}kg, Body Fat: ${weightLogs.bodyFat || 'chưa rõ'}%. Mục tiêu cài đặt: ${settings?.bodyRecompGoal || 'Chưa rõ'}.`;
    }

    const systemPrompt = `
Bạn là một Huấn luyện viên thể hình (Personal Trainer) và Chuyên gia dinh dưỡng cấp cao.
Mục tiêu của bạn là đọc yêu cầu của người dùng, phân tích tình trạng hiện tại và tạo ra một Kế hoạch tập luyện & dinh dưỡng (Fitness Blueprint) tùy chỉnh dạng JSON.

Ngữ cảnh người dùng hiện tại:
${userContext}

Dữ liệu đầu vào của người dùng:
"${prompt}"

YÊU CẦU ĐẦU RA:
Trả về DUY NHẤT một đối tượng JSON hợp lệ theo cấu trúc sau (KHÔNG giải thích gì thêm, KHÔNG format markdown backticks \`\`\`json):
{
  "goalType": "Loại mục tiêu (Ví dụ: Cut (Giảm Mỡ), Bulk (Tăng Cơ), Maintain)",
  "focusArea": "Vùng cơ thể tập trung (Ví dụ: Fullbody, Thân trên, Chân mông)",
  "nutrition": [
    "Lời khuyên dinh dưỡng 1 (chi tiết lượng calo, protein)",
    "Lời khuyên dinh dưỡng 2",
    "Lời khuyên dinh dưỡng 3"
  ],
  "workout": [
    "Chi tiết phương pháp tập 1",
    "Chi tiết bài tập hoặc tần suất tập 2",
    "Lưu ý phục hồi 3"
  ],
  "timeline": [
    "Tuần 1-2: Mục tiêu ngắn hạn...",
    "Tuần 3-6: Phát triển...",
    "Tuần 7-8: Đạt mục tiêu..."
  ],
  "youtubeQuery": "từ khóa tìm kiếm video youtube tập luyện tốt nhất bằng tiếng Anh (ví dụ: 15 min hiit fat burn)"
}
`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    
    let jsonStr = responseText.trim();
    const match = jsonStr.match(/```(?:json)?([\s\S]*?)```/);
    if (match) {
      jsonStr = match[1].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);
    return parsedData;

  } catch (error) {
    console.error("Gemini API Error (Fitness):", error);
    return fallbackGenerateFitness(prompt);
  }
}
