/**
 * BULK CONTENT MINER — Zero-Token First, AI Last Resort
 * Pipeline: Wikipedia VI → Wikipedia EN → GeeksforGeeks → Programiz → AI
 * 
 * Usage: npm run mine:all
 */

const { PrismaClient } = require('@prisma/client');
const cheerio = require('cheerio');
const prisma = new PrismaClient();

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function safeFetch(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GlowUpBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) return res.text();
  } catch {}
  return null;
}

// ── WIKIPEDIA REMOVED ──────────────────────────────────────────────────────────
// Wikipedia has been deprecated due to low academic quality and lack of context.

// ── GEEKSFORGEEKS ──────────────────────────────────────────────────────────────
const GFG_MAP = {
  'linked list': 'linked-list-data-structure',
  'stack': 'stack-data-structure',
  'queue': 'queue-data-structure',
  'binary search': 'binary-search',
  'bubble sort': 'bubble-sort',
  'quick sort': 'quick-sort',
  'merge sort': 'merge-sort',
  'binary tree': 'binary-tree-data-structure',
  'binary search tree': 'binary-search-tree-data-structure',
  'hash table': 'hashing-data-structure',
  'graph': 'graph-data-structure-and-algorithms',
  'dynamic programming': 'dynamic-programming',
  'recursion': 'recursion',
  'pointer': 'pointers-in-c-and-c-plus-plus',
  'inheritance': 'inheritance-in-c',
  'polymorphism': 'polymorphism-in-c',
  'class': 'classes-and-objects-in-c',
  'deadlock': 'introduction-of-deadlock-in-operating-system',
  'scheduling': 'cpu-scheduling-in-operating-systems',
  'virtual memory': 'virtual-memory-in-operating-system',
  'tcp': 'tcp-ip-model',
  'osi': 'layers-of-osi-model',
  'normalization': 'normal-forms-in-dbms',
  'transaction': 'concurrency-control-in-dbms',
  'big o': 'analysis-of-algorithms-set-1-asymptotic-analysis',
  'complexity': 'time-complexity-and-space-complexity',
  'heap': 'heap-data-structure',
  'greedy': 'greedy-algorithms',
  'backtracking': 'backtracking-algorithms',
  'trie': 'trie-insert-and-search',
};

async function fetchGFG(chapterTitle) {
  const lower = chapterTitle.toLowerCase();
  let slug = null;
  for (const [key, val] of Object.entries(GFG_MAP)) {
    if (lower.includes(key)) { slug = val; break; }
  }
  if (!slug) return null;

  const url = `https://www.geeksforgeeks.org/${slug}/`;
  const html = await safeFetch(url);
  if (!html) return null;

  const $ = cheerio.load(html);
  const article = $('.article-page-main, .entry-content').first();
  if (!article.length) return null;
  article.find('.advertisement, nav, footer, .sidebar, .article-meta, button').remove();
  const content = article.html() || '';
  if (content.length < 500) return null;

  return {
    html: `<div class="source-badge">Nguồn: <a href="${url}" target="_blank">GeeksforGeeks</a></div><div class="gfg-content">${content}</div>`,
    source: 'geeksforgeeks'
  };
}

// ── PROGRAMIZ ─────────────────────────────────────────────────────────────────
const PROGRAMIZ_MAP = {
  'stack': 'dsa/stack', 'queue': 'dsa/queue', 'linked list': 'dsa/linked-list',
  'binary search': 'dsa/binary-search', 'bubble sort': 'dsa/bubble-sort',
  'selection sort': 'dsa/selection-sort', 'insertion sort': 'dsa/insertion-sort',
  'merge sort': 'dsa/merge-sort', 'quick sort': 'dsa/quick-sort',
  'binary tree': 'dsa/binary-tree', 'binary search tree': 'dsa/binary-search-tree',
  'heap': 'dsa/heap-data-structure', 'hash table': 'dsa/hash-table',
  'graph': 'dsa/graph', 'recursion': 'cpp-programming/recursion',
  'pointer': 'cpp-programming/pointers', 'function': 'cpp-programming/function',
  'array': 'cpp-programming/arrays', 'string': 'cpp-programming/string',
  'struct': 'cpp-programming/structure', 'class': 'cpp-programming/object-class',
  'inheritance': 'cpp-programming/inheritance', 'polymorphism': 'cpp-programming/polymorphism',
};

async function fetchProgramiz(chapterTitle) {
  const lower = chapterTitle.toLowerCase();
  let slug = null;
  for (const [key, val] of Object.entries(PROGRAMIZ_MAP)) {
    if (lower.includes(key)) { slug = val; break; }
  }
  if (!slug) return null;

  const url = `https://www.programiz.com/${slug}`;
  const html = await safeFetch(url);
  if (!html) return null;

  const $ = cheerio.load(html);
  const article = $('main article, .entry-content, #tutorial-content').first();
  if (!article.length) return null;
  article.find('nav, .advertisement, footer, .sidebar').remove();
  const content = article.html() || '';
  if (content.length < 400) return null;

  return {
    html: `<div class="source-badge">Nguồn: <a href="${url}" target="_blank">Programiz</a></div><div class="programiz-content">${content}</div>`,
    source: 'programiz'
  };
}

// ── AI LAST RESORT ────────────────────────────────────────────────────────────
async function fetchAI(subjectCode, subjectName, chapterTitle, focusKeywords = '', retryCount = 0) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  // Read env manually
  const fs = require('fs'), path = require('path');
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const m = line.match(/^([^=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
    });
  }

  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.5, maxOutputTokens: 4096, responseMimeType: 'application/json' },
    });

    const prompt = `Đóng vai Giáo sư Khoa học Máy tính đại học. Viết bài giảng chuyên sâu cho phần: "${chapterTitle}".
Thuộc môn học: "${subjectCode} - ${subjectName}".${focusKeywords ? `\nTừ khóa trọng tâm BẮT BUỘC tuân theo: ${focusKeywords}.` : ''}

Yêu cầu BẮT BUỘC:
- Kiến thức phải ĐÚNG TRỌNG TÂM của môn học này (Ví dụ: môn Mạng Máy Tính thì "Tổng quan" là về Mạng, môn C++ thì code là C++). Mỗi chương của mỗi môn phải hoàn toàn khác biệt.
- Nội dung mang tính học thuật cao, bám sát giáo trình chuẩn của MIT OpenCourseWare và các trường Bách Khoa/Đại học CNTT.
- TUYỆT ĐỐI KHÔNG SỬ DỤNG EMOJI TRONG TOÀN BỘ VĂN BẢN VÀ CODE. Đây là tài liệu học thuật nghiêm túc.
- Định dạng HTML hợp lệ bằng các thẻ <h2>, <h3>, <p>, <ul>, <li>, <pre><code>. Code sample phải sạch, chuẩn mực.

Trả về định dạng JSON: { "theory": "string HTML" }`;

    const result = await model.generateContent(prompt);
    const data = JSON.parse(result.response.text());
    if (!data.theory) return null;

    return {
      html: `<div class="source-badge source-badge--ai">Nguồn: AI University Professor</div>${data.theory}`,
      source: 'ai_professor'
    };
  } catch (e) {
    if (e.message?.includes('429') && retryCount < 3) {
      console.log(`   [AI] Rate limit hit. Sleeping 65s and retrying (attempt ${retryCount + 1})...`);
      await sleep(65000);
      return await fetchAI(subjectCode, subjectName, chapterTitle, retryCount + 1);
    }
    return null;
  }
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  // Load .env
  const fs = require('fs'), path = require('path');
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const m = line.match(/^([^=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
    });
  }

  console.log('BULK CONTENT MINER — Static First, AI Last Resort');
  console.log('Pipeline: Wikipedia → GFG → Programiz → AI\n');

  const sections = await prisma.theorySection.findMany({
    include: { subject: true },
    where: {
      OR: [
        { coreConcept: '' },
        { coreConcept: { contains: 'Đang chờ cập nhật' } },
        { coreConcept: { contains: 'chưa cập nhật' } },
      ]
    }
  });

  console.log(`Found ${sections.length} sections with empty content.\n`);

  const stats = { wiki: 0, gfg: 0, programiz: 0, ai: 0, failed: 0 };
  let aiCallsThisMinute = 0;
  let minuteStart = Date.now();

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const label = `${section.subject.code} — ${section.title}`;
    process.stdout.write(`[${i + 1}/${sections.length}] ${label}... `);

    let result = null;

    // Nâng cao: Chỉ dùng GFG / Programiz cho các môn C/C++, DSA (IT001, IT002, IT003)
    // Các môn có ngữ cảnh chuyên biệt cao như IT005 (Mạng), IT007 (OS), IS... ép buộc dùng AI Professor.
    const forceAI = !['IT001', 'IT002', 'IT003'].includes(section.subject.code);

    if (!forceAI) {
      // 1. GFG
      result = await fetchGFG(section.title);
      if (result) await sleep(600);

      // 2. Programiz
      if (!result) {
        result = await fetchProgramiz(section.title);
        if (result) await sleep(400);
      }
    }

    // 3. AI Professor Mode (Rate-limit aware)
    if (!result) {
      const now = Date.now();
      if (now - minuteStart > 60000) { aiCallsThisMinute = 0; minuteStart = now; }
      if (aiCallsThisMinute < 12) {
        
        let autoFocusKeywords = '';
        if (section.subject.code === 'IT001' || section.subject.code === 'IT002') {
          const lower = section.title.toLowerCase();
          if (lower.includes('kiểu dữ liệu có cấu trúc')) autoFocusKeywords = 'Cấu trúc struct, từ khóa struct trong C++, struct data type in C/C++, KHÔNG PHẢI cấu trúc dữ liệu và giải thuật (Data Structures)';
          if (lower.includes('rẽ nhánh')) autoFocusKeywords = 'if else, switch case, toán tử ba ngôi trong C++';
          if (lower.includes('vòng lặp')) autoFocusKeywords = 'for, while, do while, break, continue trong C++';
          if (lower.includes('con trỏ')) autoFocusKeywords = 'pointer, cấp phát động, malloc, new, delete, con trỏ hàm trong C++';
        }

        result = await fetchAI(section.subject.code, section.subject.name, section.title, autoFocusKeywords);
        if (result) { aiCallsThisMinute++; await sleep(5500); }
      } else {
        process.stdout.write('AI rate limit — skipping\n');
        stats.failed++;
        continue;
      }
    }

    if (result) {
      await prisma.theorySection.update({ where: { id: section.id }, data: { coreConcept: result.html } });
      stats[result.source === 'ai_professor' ? 'ai' : result.source === 'geeksforgeeks' ? 'gfg' : 'programiz']++;
      process.stdout.write(`OK [${result.source}]\n`);
    } else {
      stats.failed++;
      process.stdout.write('FAILED\n');
    }
  }

  console.log('\n--- SUMMARY ---');
  console.log(`GFG: ${stats.gfg} | Programiz: ${stats.programiz} | AI Professor: ${stats.ai} | Failed: ${stats.failed}`);
  await prisma.$disconnect();
}

main().catch(async e => {
  console.error('Error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
