// Load .env thủ công
const fs_env = require('fs');
const path_env = require('path');
const envPath = path_env.join(__dirname, '..', '.env');
if (fs_env.existsSync(envPath)) {
  fs_env.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim().replace(/^"|"$/g, '');
  });
}

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const prisma = new PrismaClient();

const jsonModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 4096,
    responseMimeType: 'application/json',
  }
});

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function withRetry(fn, name, retries = 3) {
  for (let i = 1; i <= retries; i++) {
    try { return await fn(); }
    catch (e) {
      process.stdout.write(`️[${i}/${retries}] `);
      if (i < retries) await sleep(4000 * i);
      else {
        process.stdout.write('FALLBACK ');
        return null;
      }
    }
  }
}

function buildQuizPrompt(subjectCode, subjectName, chapterTitle) {
  return `Tạo quiz trắc nghiệm cho môn học ${subjectCode} - ${subjectName}, chương: ${chapterTitle}.

Trả về JSON hợp lệ theo schema sau:
{
  "quiz": [
    {
      "question": "string - câu hỏi tiếng Việt",
      "options": ["A. option", "B. option", "C. option", "D. option"],
      "correctIndex": 0,
      "explanation": "string - giải thích chi tiết tại sao đáp án đúng"
    }
  ]
}

Yêu cầu:
- quiz: Sinh ra 5 câu hỏi trắc nghiệm 4 đáp án A B C D, bám sát nội dung học thuật của ${chapterTitle}.
- Câu hỏi có độ khó từ cơ bản đến nâng cao.
- Không dùng ký tự đặc biệt gây lỗi JSON trong string.`;
}

async function main() {
  console.log('CURRICULUM QUIZ AI GENERATOR (An toàn - Không xóa dữ liệu lý thuyết)\n');

  // Lấy toàn bộ môn học và các chương lý thuyết từ database
  const subjects = await prisma.subject.findMany({
    include: {
      theories: {
        orderBy: { order: 'asc' }
      }
    }
  });

  let total = 0;
  for (const s of subjects) total += s.theories.length;
  console.log(`Tìm thấy tổng cộng: ${total} chương học để tạo Quiz.\n`);

  let done = 0;

  for (const subject of subjects) {
    console.log(`\n  Môn: ${subject.code} - ${subject.name}`);

    for (const chapter of subject.theories) {
      done++;
      process.stdout.write(`     [${done}/${total}] Đang sinh Quiz cho "${chapter.title}"... `);

      const topicName = `${subject.code} - ${chapter.title}`;

      // Kiểm tra xem đã có quiz chưa để tránh tạo trùng lặp
      const existingQuizzes = await prisma.reviewQuiz.count({
        where: { topic: topicName }
      });

      if (existingQuizzes >= 5) {
        process.stdout.write(`Đã tồn tại (${existingQuizzes} câu)\n`);
        continue;
      }

      // Xóa các câu cũ nếu số lượng không đủ để thay thế bằng 5 câu mới hoàn chỉnh
      if (existingQuizzes > 0) {
        await prisma.reviewQuiz.deleteMany({ where: { topic: topicName } });
      }

      const qData = await withRetry(async () => {
        const prompt = buildQuizPrompt(subject.code, subject.name, chapter.title);
        const result = await jsonModel.generateContent(prompt);
        return JSON.parse(result.response.text());
      }, 'quiz') || { quiz: [] };

      // Lưu quiz vào database
      for (const q of (qData.quiz || [])) {
        if (!q.question) continue;
        await prisma.reviewQuiz.create({
          data: {
            topic: topicName,
            question: String(q.question).slice(0, 1000),
            options: JSON.stringify((q.options || []).map(o => String(o))),
            answerIndex: Number(q.correctIndex) || 0,
            explanation: String(q.explanation || '').slice(0, 1000),
            difficulty: 'Medium',
          }
        });
      }

      console.log(`Hoàn thành (${qData.quiz?.length || 0} câu)`);
      await sleep(2000); // Tránh quá tải API Google Gemini
    }
  }

  console.log(`\n\nHOÀN TẤT TẠO QUIZ CHO ${done}/${total} CHƯƠNG!\n`);
  await prisma.$disconnect();
}

main().catch(async e => {
  console.error('LỖI:', e);
  await prisma.$disconnect();
  process.exit(1);
});
