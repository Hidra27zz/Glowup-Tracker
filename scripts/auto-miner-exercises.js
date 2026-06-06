/**
 * AUTO MINER - EXERCISES & QUIZZES (Micro-token mode) - RESILIENT VERSION
 */

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
    temperature: 0.2, // Lower temp for more stable JSON
    maxOutputTokens: 2048,
    responseMimeType: 'application/json',
  }
});

async function generateContent(subject, section, retries = 3) {
  const prompt = `Môn:${subject.name}, Chương:${section.title}.
Generate JSON exactly in this format without any markdown wrappers:
{
  "exercise": {
    "title": "Tên bài",
    "difficulty": "Easy|Medium|Hard",
    "hint": "Gợi ý",
    "description": "Đề bài ngắn gọn",
    "realWorldScenario": "Ứng dụng thực tế",
    "edgeCasesToConsider": "[\"Biên 1\", \"Biên 2\"]",
    "starterCode": "{\\"${subject.language || 'cpp'}\\": \\"// code here\\"}",
    "testCases": [{"input": "vd1", "expectedOutput": "kq1", "isHidden": false}]
  },
  "quizzes": [
    {
      "topic": "Keyword",
      "question": "Câu hỏi?",
      "options": "[\"A\", \"B\", \"C\", \"D\"]",
      "answerIndex": 0,
      "explanation": "Giải thích ngắn",
      "difficulty": "Easy"
    }
  ]
}
Return EXACTLY 1 exercise and exactly 3 quizzes in this format. Use Vietnamese.`;

  for (let i = 0; i < retries; i++) {
    try {
      const result = await jsonModel.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/^```json/g, '').replace(/```$/g, '').trim();
      return JSON.parse(text);
    } catch (e) {
      if (e.message && e.message.includes('429 Too Many Requests')) {
        console.error(`\n[Lần ${i+1}] Quota AI đầy (429). Đang ngủ 60 giây...`);
        await new Promise(r => setTimeout(r, 65000)); // sleep 65s
      } else {
        console.error(`\n[Lần ${i+1}] Lỗi AI cho ${section.title}: ${e.message}`);
        await new Promise(r => setTimeout(r, 3000 * (i + 1))); // backoff
      }
    }
  }
  return null;
}

async function main() {
  console.log('Bắt đầu khai thác Bài tập & Quiz (Resilient Version)...');
  
  const subjects = await prisma.subject.findMany({ include: { theories: true, exercises: true } });
  
  let totalEx = 0;
  let totalQuiz = 0;

  for (const subject of subjects) {
    console.log(`\nĐang xử lý môn: ${subject.code} - ${subject.name}`);
    
    for (const section of subject.theories) {
      // Bỏ qua nếu chương này đã có bài tập tương ứng
      const chName = section.title.split(':')[0]; // Ví dụ: "Chương 1"
      const hasEx = subject.exercises.some(e => e.title.includes(chName) || e.title.includes(section.title));
      
      if (hasEx) {
        process.stdout.write(`  - ${section.title}: Đã có bài tập, bỏ qua.\n`);
        continue;
      }
      
      process.stdout.write(`  - Tạo bài tập cho: ${section.title}... `);
      
      const data = await generateContent(subject, section);
      if (data && data.exercise) {
        const exData = data.exercise;
        await prisma.exercise.create({
          data: {
            title: exData.title ? `${chName}: ${exData.title}` : `Bài tập ${section.title}`,
            difficulty: exData.difficulty || 'Medium',
            hint: exData.hint,
            description: exData.description || 'Hoàn thành bài tập sau.',
            realWorldScenario: typeof exData.realWorldScenario === 'string' ? exData.realWorldScenario : JSON.stringify(exData.realWorldScenario),
            edgeCasesToConsider: Array.isArray(exData.edgeCasesToConsider) ? JSON.stringify(exData.edgeCasesToConsider) : (exData.edgeCasesToConsider || '[]'),
            starterCode: typeof exData.starterCode === 'string' ? exData.starterCode : JSON.stringify(exData.starterCode),
            subjectId: subject.id,
            testCases: {
              create: Array.isArray(exData.testCases) ? exData.testCases.map(tc => ({
                input: tc.input || '',
                expectedOutput: tc.expectedOutput || '',
                isHidden: tc.isHidden || false
              })) : []
            }
          }
        });
        totalEx++;
        
        if (Array.isArray(data.quizzes)) {
          for (const q of data.quizzes) {
            await prisma.reviewQuiz.create({
              data: {
                topic: `${subject.code} - ${section.title}`,
                question: q.question || 'Câu hỏi',
                options: typeof q.options === 'string' ? q.options : JSON.stringify(q.options || []),
                answerIndex: q.answerIndex || 0,
                explanation: q.explanation || '',
                difficulty: q.difficulty || 'Medium'
              }
            });
            totalQuiz++;
          }
        }
        process.stdout.write(`Xong!\n`);
      } else {
        process.stdout.write(`Bỏ qua (Thất bại sau 3 lần thử)\n`);
      }
      
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`\nHoàn thành! Đã tạo thêm ${totalEx} bài tập và ${totalQuiz} câu trắc nghiệm.`);
  await prisma.$disconnect();
}

main().catch(async e => {
  console.error('LỖI:', e);
  await prisma.$disconnect();
  process.exit(1);
});
