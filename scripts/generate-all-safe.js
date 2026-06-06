const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Manually load .env to avoid next.js environment issues
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let val = match[2].trim().replace(/^"|"$/g, '');
      process.env[match[1].trim()] = val;
    }
  });
}

// Lấy danh sách API Keys
const apiKeys = Object.keys(process.env)
  .filter(k => k.startsWith('GEMINI_API_KEY'))
  .map(k => process.env[k])
  .filter(Boolean);

if (apiKeys.length === 0) {
  console.error("Không tìm thấy API Key nào trong file .env!");
  process.exit(1);
}

console.log(`Đã tìm thấy ${apiKeys.length} API Key(s). Sẽ sử dụng xoay vòng (Round Robin).`);

let currentKeyIndex = 0;
function getNextGenAI() {
  const key = apiKeys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  return new GoogleGenerativeAI(key);
}

const prisma = new PrismaClient();
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function main() {
  console.log("Bắt đầu Hàng đợi sinh dữ liệu an toàn (Safe Queue)...");

  // 1. Quét Theory bị rỗng
  const emptyTheories = await prisma.theorySection.findMany({
    where: { OR: [{ coreConcept: null }, { coreConcept: '' }] },
    include: { subject: true }
  });

  // 2. Quét các Subject để sinh Quiz (chỉ cho các Section chưa có Quiz)
  const allSections = await prisma.theorySection.findMany({
    include: { subject: true }
  });
  
  const sectionsNeedingQuiz = [];
  for (const sec of allSections) {
    const topicName = `${sec.subject.code} - ${sec.title}`;
    const quizCount = await prisma.reviewQuiz.count({
      where: { topic: topicName }
    });
    if (quizCount === 0) {
      sectionsNeedingQuiz.push(sec);
    }
  }

  console.log(`Tìm thấy ${emptyTheories.length} chương thiếu lý thuyết.`);
  console.log(`Tìm thấy ${sectionsNeedingQuiz.length} chương thiếu Quiz.`);
  
  const SAFE_DELAY = 5000; // 5 giây (an toàn cho 15 RPM)
  const DELAY = Math.max(2000, SAFE_DELAY / apiKeys.length); // Nếu có nhiều key, delay sẽ giảm đi
  console.log(`⏱️ Thời gian nghỉ giữa các Request: ${DELAY}ms (để tránh lỗi 429)`);

  let requestCount = 0;

  // XỬ LÝ LÝ THUYẾT (THEORY)
  if (emptyTheories.length > 0) {
    console.log("\nPHẦN 1: TẠO LÝ THUYẾT...");
    for (let i = 0; i < emptyTheories.length; i++) {
      const section = emptyTheories[i];
      console.log(`[${i+1}/${emptyTheories.length}] Tạo bài giảng: ${section.subject.code} - ${section.title}...`);
      
      const prompt = `Viết bài giảng chuyên ngành CNTT (Tiếng Việt) cho môn học: ${section.subject.code} - ${section.subject.name}.
Chương học: ${section.title}.
Định dạng HTML hợp lệ. Có tiêu đề, giải thích khái niệm, code mẫu (C/C++, Java, JS tuỳ môn), bảng biểu nếu cần.
Trả về định dạng JSON: { "theory": "string chứa mã HTML" }`;
      
      let success = false;
      let retries = 3;
      while (!success && retries > 0) {
        try {
          const genAI = getNextGenAI();
          const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: { temperature: 0.7, responseMimeType: 'application/json' }
          });
          const result = await model.generateContent(prompt);
          const data = JSON.parse(result.response.text());
          
          if (data.theory) {
            await prisma.theorySection.update({
              where: { id: section.id },
              data: { coreConcept: data.theory }
            });
            console.log(`  Thành công!`);
            success = true;
          } else {
            throw new Error("Không có dữ liệu theory");
          }
        } catch (error) {
          retries--;
          console.log(`  ️ Lỗi (${error.message?.includes('429') ? '429 Quota' : 'AI'}). Thử lại (${3-retries}/3)... Đang đợi 60s`);
          if (retries > 0) await sleep(60000); // Đợi 60s nếu lỗi
        }
      }
      
      if (!success) console.log(`  Bỏ qua (Thất bại sau 3 lần thử)`);
      else {
        requestCount++;
        await sleep(DELAY);
      }
    }
  }

  // XỬ LÝ QUIZ
  if (sectionsNeedingQuiz.length > 0) {
    console.log("\nPHẦN 2: TẠO QUIZ...");
    for (let i = 0; i < sectionsNeedingQuiz.length; i++) {
      const section = sectionsNeedingQuiz[i];
      console.log(`[${i+1}/${sectionsNeedingQuiz.length}] Tạo Quiz: ${section.subject.code} - ${section.title}...`);
      
      const prompt = `Tạo quiz trắc nghiệm cho môn học ${section.subject.code} - ${section.subject.name}, chương: ${section.title}.
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
Sinh 5 câu hỏi có độ khó vừa phải.`;

      let success = false;
      let retries = 3;
      const topicName = `${section.subject.code} - ${section.title}`;

      while (!success && retries > 0) {
        try {
          const genAI = getNextGenAI();
          const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: { temperature: 0.7, responseMimeType: 'application/json' }
          });
          const result = await model.generateContent(prompt);
          const data = JSON.parse(result.response.text());
          
          if (data.quiz && data.quiz.length > 0) {
            for (const q of data.quiz) {
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
            console.log(`  Thành công! (${data.quiz.length} câu)`);
            success = true;
          } else {
            throw new Error("Dữ liệu quiz trống");
          }
        } catch (error) {
          retries--;
          console.log(`  ️ Lỗi (${error.message?.includes('429') ? '429 Quota' : 'AI'}). Thử lại (${3-retries}/3)... Đang đợi 60s`);
          if (retries > 0) await sleep(60000); // Đợi 60s nếu lỗi 429
        }
      }
      
      if (!success) console.log(`  Bỏ qua (Thất bại sau 3 lần thử)`);
      else {
        requestCount++;
        await sleep(DELAY);
      }
    }
  }

  console.log("\nHOÀN THÀNH TẤT CẢ! Đã thực hiện", requestCount, "requests thành công.");
}

main().catch(async (e) => {
  console.error("Fatal Error:", e);
}).finally(async () => {
  await prisma.$disconnect();
  process.exit(0);
});
