export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();

// ─── SOURCE 1: OPEN TRIVIA DB (100% miễn phí, không cần API key) ─────────────

const OTD_CATEGORY_MAP: Record<string, number> = {
  // Category 18 = Science: Computers
  'IT001': 18, 'IT002': 18, 'IT003': 18,
  'IT007': 18, 'IT005': 18, 'IT004': 18,
  'IS210': 18, 'IS211': 18, 'IS217': 18,
  'CLOUD': 18, 'IS355': 18, 'IS405': 18,
};

async function fetchFromOpenTriviaDB(subjectCode: string, amount = 5): Promise<any[] | null> {
  try {
    const categoryId = OTD_CATEGORY_MAP[subjectCode] || 18;
    const url = `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&type=multiple&encode=url3986`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;

    const data = await res.json();
    if (data.response_code !== 0 || !data.results?.length) return null;

    return data.results.map((item: any, idx: number) => {
      const question = decodeURIComponent(item.question);
      const correct = decodeURIComponent(item.correct_answer);
      const incorrects = item.incorrect_answers.map((a: string) => decodeURIComponent(a));
      
      // Shuffle options with correct answer inserted at random position
      const options = [...incorrects];
      const correctIndex = Math.floor(Math.random() * 4);
      options.splice(correctIndex, 0, correct);
      
      return {
        question,
        options: options.map((o, i) => `${['A', 'B', 'C', 'D'][i]}. ${o}`),
        answerIndex: correctIndex,
        explanation: `Đáp án đúng: ${correct}`,
        difficulty: item.difficulty === 'hard' ? 'Hard' : item.difficulty === 'medium' ? 'Medium' : 'Easy',
      };
    });
  } catch (e) {
    console.error('[Quiz] OpenTriviaDB error:', e);
    return null;
  }
}

// ─── SOURCE 2: AI FALLBACK ────────────────────────────────────────────────────

async function fetchFromAI(subjectCode: string, subjectName: string, chapterTitle: string, coreConcept: string = ''): Promise<any[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048, responseMimeType: 'application/json' },
    });

    let prompt = `Tạo 5 câu hỏi trắc nghiệm (Tiếng Việt) cho môn ${subjectCode} - ${subjectName}, chương: ${chapterTitle}.
JSON: { "quiz": [{ "question": "string", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correctIndex": 0, "explanation": "string" }] }
Độ khó: 2 dễ, 2 trung bình, 1 khó.
TUYỆT ĐỐI KHÔNG SỬ DỤNG EMOJI.`;

    if (coreConcept && coreConcept.trim().length > 0) {
      prompt = `Dựa vào TÀI LIỆU HỌC TẬP sau đây của môn ${subjectCode} - ${subjectName} (Chương: ${chapterTitle}), hãy tạo 5 câu hỏi trắc nghiệm (Tiếng Việt) BÁM SÁT 100% nội dung tài liệu.
TÀI LIỆU HỌC TẬP:
${coreConcept.slice(0, 15000)}

Định dạng JSON yêu cầu:
{ "quiz": [{ "question": "string", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correctIndex": 0, "explanation": "string" }] }
Độ khó: 2 dễ, 2 trung bình, 1 khó. Giải thích (explanation) phải trích dẫn ngắn gọn ý trong tài liệu.
TUYỆT ĐỐI KHÔNG SỬ DỤNG EMOJI.`;
    }

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const data = JSON.parse(text);
      return data.quiz || null;
    } catch (parseErr) {
      console.error('[Quiz AI] JSON Parse Error. Raw text:', text.slice(0, 200));
      return null;
    }
  } catch (e: any) {
    console.error('[Quiz AI] Error:', e?.message);
    return null;
  }
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { subjectCode, subjectName, chapterTitle, coreConcept, sectionId } = await req.json();

    if (!subjectCode || !chapterTitle) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
    }

    const topicName = `${subjectCode} - ${chapterTitle}`;

    // Check cache — nếu đã có quiz rồi thì không tạo lại (ưu tiên sectionId nếu có)
    const existingCount = sectionId 
      ? await prisma.reviewQuiz.count({ where: { sectionId } })
      : await prisma.reviewQuiz.count({ where: { topic: topicName } });
      
    if (existingCount >= 3) {
      const existing = sectionId 
        ? await prisma.reviewQuiz.findMany({ where: { sectionId } })
        : await prisma.reviewQuiz.findMany({ where: { topic: topicName } });
      return NextResponse.json({ success: true, count: existingCount, quizzes: existing, source: 'cache' });
    }

    let questions: any[] | null = null;
    let source = '';

    // ── 1. Open Trivia DB ──
    console.log(`[Quiz] Trying OpenTriviaDB for: ${subjectCode}`);
    questions = await fetchFromOpenTriviaDB(subjectCode, 5);
    if (questions?.length) source = 'opentriviadb';

    // ── 2. AI Last Resort ──
    if (!questions?.length) {
      console.log(`[Quiz] OpenTriviaDB empty. Calling AI for: ${chapterTitle}`);
      questions = await fetchFromAI(subjectCode, subjectName || '', chapterTitle, coreConcept || '');
      if (questions?.length) source = 'ai';
    }

    if (!questions?.length) {
      return NextResponse.json({ error: 'Không tìm được câu hỏi quiz từ bất kỳ nguồn nào.' }, { status: 404 });
    }

    // Delete old quiz for this topic then insert new
    if (sectionId) {
      await prisma.reviewQuiz.deleteMany({ where: { sectionId } });
    } else {
      await prisma.reviewQuiz.deleteMany({ where: { topic: topicName } });
    }

    const created = [];
    for (const q of questions) {
      if (!q.question) continue;
      const item = await prisma.reviewQuiz.create({
        data: {
          topic: topicName,
          question: String(q.question).slice(0, 1000),
          options: JSON.stringify((q.options || []).map((o: string) => String(o))),
          answerIndex: Number(q.answerIndex ?? q.correctIndex) || 0,
          explanation: String(q.explanation || '').slice(0, 1000),
          difficulty: q.difficulty || 'Medium',
          sectionId: sectionId || null,
        },
      });
      created.push(item);
    }

    console.log(`[Quiz] Saved ${created.length} questions from source: ${source}`);
    return NextResponse.json({ success: true, count: created.length, quizzes: created, source });

  } catch (error: any) {
    console.error('[Quiz API] Error:', error);
    if (error?.message?.includes('429')) {
      return NextResponse.json({ error: 'AI đang quá tải. Hãy thử lại sau 30 giây.' }, { status: 429 });
    }
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
