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

const htmlModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 8192,
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

function buildTheoryPrompt(subjectCode, subjectName, chapterTitle, keywords) {
  return `Bạn là giảng viên Đại học Bách Khoa chuyên ngành HTTT/CNTT. Viết bài giảng lý thuyết HTML CHI TIẾT cho:
Môn: ${subjectCode} - ${subjectName}
Chương: ${chapterTitle}
Từ khóa gợi ý: ${keywords}

YÊU CẦU FORMAT HTML (chỉ trả về HTML, không dùng markdown \`\`\`html):
- Mở đầu bằng thẻ <h3>Tổng quan</h3> giải thích bức tranh toàn cảnh một cách dễ hiểu.
- Sử dụng các thẻ <h3>, <h4>, <p>, <ul>, <li>, <strong>, <em>.
- GIẢI THÍCH CHI TIẾT và có chiều sâu từng khái niệm liên quan đến tiêu đề bài học.
- BẮT BUỘC cung cấp ít nhất 2 ví dụ Code (C++, Python, hoặc SQL tùy môn học) thực tế bên trong thẻ <pre><code>...</code></pre>.
- Kết thúc bằng thẻ <h3>Lưu ý & Lỗi thường gặp</h3>.
- Bài viết phải dài tối thiểu 800 từ, hành văn tự nhiên, chuyên nghiệp như một giáo trình.

LƯU Ý QUAN TRỌNG:
- Trả về trực tiếp mã HTML thuần túy, tuyệt đối KHÔNG bọc trong markdown block \`\`\`html ... \`\`\`.
- Nếu có code, hãy đảm bảo format thò thụt (indentation) rõ ràng.
`;
}

async function main() {
  console.log('AI THEORY GENERATOR (Khắc phục nội dung trống)\n');

  // Lấy các chương có chứa từ khóa trống
  const emptyTheories = await prisma.theorySection.findMany({
    where: {
      OR: [
        { coreConcept: { contains: 'Nội dung chưa cập nhật' } },
        { coreConcept: { contains: 'Đang chờ cập nhật nội dung' } }
      ]
    },
    include: {
      subject: true
    }
  });

  console.log(`Tìm thấy tổng cộng: ${emptyTheories.length} chương đang bị trống nội dung.\n`);

  let done = 0;

  for (const chapter of emptyTheories) {
    done++;
    const subject = chapter.subject;
    process.stdout.write(`[${done}/${emptyTheories.length}] Viết bài cho "${subject.code} - ${chapter.title}"... `);

    let keywords = chapter.title;
    const match = chapter.coreConcept.match(/Từ khóa trọng tâm[^:]*:\s*(.*?)</);
    if (match && match[1]) {
      keywords = match[1].trim();
    }

    const theoryHtml = await withRetry(async () => {
      const prompt = buildTheoryPrompt(subject.code, subject.name, chapter.title, keywords);
      const result = await htmlModel.generateContent(prompt);
      let text = result.response.text().trim();
      // Remove markdown block if AI still outputs it
      if (text.startsWith('\`\`\`html')) text = text.replace(/^\`\`\`html/, '');
      if (text.startsWith('\`\`\`')) text = text.replace(/^\`\`\`/, '');
      if (text.endsWith('\`\`\`')) text = text.replace(/\`\`\`$/, '');
      
      if (text.length < 200) throw new Error('Too short');
      
      const badge = `
        <div style="background: rgba(139,92,246,0.1); padding: 15px; border-left: 3px solid #8b5cf6; border-radius: 4px; margin-bottom: 20px;">
          <strong>Nguồn:</strong> Bài giảng được biên soạn tự động bởi Trợ lý AI (Gemini 2.5).
        </div>
      `;
      
      return badge + text.trim();
    }, 'theory');

    if (theoryHtml) {
      await prisma.theorySection.update({
        where: { id: chapter.id },
        data: { coreConcept: theoryHtml }
      });
      console.log(`Thành công!`);
    } else {
      console.log(`Thất bại!`);
    }
    
    await sleep(2000); // Tránh quá tải API Google Gemini
  }

  console.log(`\n\nHOÀN TẤT VIẾT BÀI GIẢNG CHO ${done} CHƯƠNG!\n`);
  await prisma.$disconnect();
}

main().catch(async e => {
  console.error('LỖI:', e);
  await prisma.$disconnect();
  process.exit(1);
});
