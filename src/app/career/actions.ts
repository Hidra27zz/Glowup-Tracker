'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ... (existing actions will be added back below)
export async function logDeepWork(duration: number, taskName: string, flowState: number) {
  if (isNaN(duration)) throw new Error('Duration is required');

  await prisma.deepWorkSession.create({
    data: {
      duration,
      taskName,
      flowState: isNaN(flowState) ? null : flowState,
    }
  });

  revalidatePath('/career');
}

export async function addSkill(name: string, category: string) {
  if (!name || !category) throw new Error('Missing required fields');

  await prisma.skill.create({
    data: {
      name,
      category,
    }
  });

  revalidatePath('/career');
}

export async function addExp(id: string, amount: number) {
  const skill = await prisma.skill.findUnique({ where: { id } });
  if (!skill) return;

  const newExp = skill.exp + amount;
  let newLevel = skill.level;

  if (newExp >= 100) {
    newLevel += Math.floor(newExp / 100);
  }

  await prisma.skill.update({
    where: { id },
    data: {
      exp: newExp % 100,
      level: newLevel,
    }
  });

  revalidatePath('/career');
}

// ==========================================
// FLASHCARD VAULT ACTIONS
// ==========================================

export async function createFlashcardDeck(name: string, category: string = 'General', description: string = '') {
  await prisma.flashcardDeck.create({
    data: { name, category, description }
  });
  revalidatePath('/career');
}

export async function createFlashcard(deckId: string, front: string, back: string) {
  await prisma.flashcard.create({
    data: { deckId, front, back }
  });
  revalidatePath('/career');
}

export async function bulkCreateFlashcards(deckId: string, cards: { front: string; back: string }[]) {
  if (!cards || cards.length === 0) return;
  await prisma.flashcard.createMany({
    data: cards.map(c => ({
      deckId,
      front: c.front,
      back: c.back
    }))
  });
  revalidatePath('/career');
}

export async function deleteFlashcardDeck(id: string) {
  await prisma.flashcardDeck.delete({ where: { id } });
  revalidatePath('/career');
}

export async function deleteFlashcard(id: string) {
  await prisma.flashcard.delete({ where: { id } });
  revalidatePath('/career');
}

export async function updateFlashcardMastery(id: string, mastery: number) {
  // Spaced Repetition Logic
  let interval = 0;
  if (mastery === 0) interval = 1;      // Chưa thuộc: ngày mai
  else if (mastery === 1) interval = 3; // Tạm ổn: 3 ngày
  else if (mastery === 2) interval = 7; // Đã thuộc: 7 ngày

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  await prisma.flashcard.update({
    where: { id },
    data: { 
      mastery,
      interval,
      nextReview
    }
  });
  revalidatePath('/career');
}

// ==========================================
// ADAPTIVE AI MENTOR ACTIONS
// ==========================================
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateCareerBlueprint as fallbackGenerate } from '@/lib/utils/careerEngine';

export async function generateCareerBlueprintAI(prompt: string) {
  console.log("[generateCareerBlueprintAI] Started with prompt length:", prompt?.length);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("No GEMINI_API_KEY found, using local fallback regex engine.");
    return fallbackGenerate(prompt);
  }

  try {
    console.log("[generateCareerBlueprintAI] Connecting to Gemini API...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    console.log("[generateCareerBlueprintAI] Querying Prisma for skills...");
    // Lấy ngữ cảnh user (các kĩ năng hiện tại và lỗi sai thường gặp)
    const skills = await prisma.skill.findMany({ select: { name: true, level: true, exp: true } });
    console.log("[generateCareerBlueprintAI] Prisma returned", skills.length, "skills.");
    const userContext = skills.length > 0 
      ? `Người dùng hiện có các kỹ năng: ${skills.map(s => `${s.name} (Lv${s.level})`).join(', ')}.` 
      : 'Người dùng là người mới bắt đầu.';

    const systemPrompt = `
Bạn là một Senior Tech Lead và AI Mentor xuất sắc.
Mục tiêu của bạn là đọc Job Description (JD) hoặc yêu cầu học tập của người dùng, phân tích ngữ cảnh của họ, và tạo ra một Lộ trình học tập (Career Blueprint) tùy chỉnh dạng JSON.

Ngữ cảnh người dùng hiện tại:
${userContext}

Dữ liệu đầu vào của người dùng:
"${prompt}"

YÊU CẦU ĐẦU RA:
Trả về DUY NHẤT một đối tượng JSON hợp lệ theo cấu trúc sau (KHÔNG giải thích gì thêm, KHÔNG format markdown backticks \`\`\`json):
{
  "focusArea": "Tên ngành/Vị trí trọng tâm",
  "pathway": {
    "basic": ["3-4 kỹ năng cốt lõi cần học"],
    "intermediate": ["3-4 kỹ năng trung cấp"],
    "advanced": ["3-4 kỹ năng chuyên sâu"]
  },
  "interviewQuestions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "Câu hỏi trắc nghiệm thực tế chuyên sâu (không quá dễ)",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "Câu trả lời đúng",
      "explanation": "Giải thích chi tiết tại sao"
    },
    {
      "id": "q2",
      "type": "text_input",
      "question": "Câu hỏi điền từ khóa khóa (không quá dễ)",
      "correctAnswer": ["keyword1", "keyword2"],
      "explanation": "Giải thích chi tiết"
    }
  ],
  "youtubeQuery": "từ khóa tìm kiếm youtube tốt nhất",
  "theoryReview": [
    {
      "title": "Chủ đề lý thuyết 1",
      "content": "Giải thích chuyên sâu chuẩn bị phỏng vấn"
    }
  ],
  "codingExercises": [
    {
      "title": "Tên bài tập thực hành",
      "language": "javascript/python/swift...",
      "code": "Đoạn code snippet để học viên sửa lỗi hoặc phân tích",
      "task": "Yêu cầu bài tập chi tiết"
    }
  ]
}
`;

    console.log("[generateCareerBlueprintAI] Generating content with Gemini...");
    const result = await model.generateContent(systemPrompt);
    console.log("[generateCareerBlueprintAI] Content generated.");
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting just in case
    let jsonStr = responseText.trim();
    const match = jsonStr.match(/```(?:json)?([\s\S]*?)```/);
    if (match) {
      jsonStr = match[1].trim();
    }
    
    console.log("[generateCareerBlueprintAI] Parsing JSON...");
    const parsedData = JSON.parse(jsonStr);
    console.log("[generateCareerBlueprintAI] Complete.");
    return parsedData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback to local offline engine if AI fails
    return fallbackGenerate(prompt);
  }
}

export async function saveQuizResult(questionId: string, questionText: string, userAnswer: string, isCorrect: boolean, skillCategory?: string | null) {
  await prisma.quizHistory.create({
    data: {
      questionId,
      questionText,
      userAnswer,
      isCorrect,
      skillCategory: skillCategory || null
    }
  });
}

// ==========================================
// JOB APPLICATION ACTIONS
// ==========================================

export async function createJobApplication(formData: FormData) {
  const company = formData.get('company') as string;
  const position = formData.get('position') as string;
  const notes = formData.get('notes') as string;

  if (!company || !position) throw new Error('Company and position are required');

  await prisma.jobApplication.create({
    data: {
      company,
      position,
      notes,
      status: 'CV_SENT',
    }
  });
  revalidatePath('/career');
}

export async function updateJobApplicationStatus(id: string, status: string) {
  await prisma.jobApplication.update({
    where: { id },
    data: { status }
  });
  revalidatePath('/career');
}

export async function deleteJobApplication(id: string) {
  await prisma.jobApplication.delete({ where: { id } });
  revalidatePath('/career');
}

// ==========================================
// CODE SNIPPET ACTIONS
// ==========================================

export async function createCodeSnippet(formData: FormData) {
  const title = formData.get('title') as string;
  const code = formData.get('code') as string;
  const language = formData.get('language') as string || 'typescript';
  const tags = formData.get('tags') as string;

  if (!title || !code) throw new Error('Title and code are required');

  await prisma.codeSnippet.create({
    data: {
      title,
      code,
      language,
      tags
    }
  });
  revalidatePath('/career');
}

export async function deleteCodeSnippet(id: string) {
  await prisma.codeSnippet.delete({ where: { id } });
  revalidatePath('/career');
}
