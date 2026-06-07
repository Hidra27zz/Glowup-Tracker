export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function safeFetch(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GlowUpBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) return res.text();
    return null;
  } catch {
    return null;
  }
}

// ─── SOURCE 1: WIKIPEDIA (VI → EN) ───────────────────────────────────────────

async function fetchFromWikipedia(chapterTitle: string, subjectName: string): Promise<string | null> {
  const cleanTitle = chapterTitle.replace(/Chương \d+[-–\d]*:\s*/i, '').trim();

  const queries = [
    `${cleanTitle} ${subjectName}`,
    cleanTitle,
    cleanTitle.split('&')[0].trim(),
  ];

  for (const lang of ['vi', 'en']) {
    for (const q of queries) {
      try {
        const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&utf8=&format=json&srlimit=1`;
        const searchRes = await safeFetch(searchUrl);
        if (!searchRes) continue;

        const searchData = JSON.parse(searchRes);
        const title = searchData?.query?.search?.[0]?.title;
        if (!title) continue;

        const pageUrl = `https://${lang}.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&format=json&prop=text`;
        const pageRes = await safeFetch(pageUrl);
        if (!pageRes) continue;

        const pageData = JSON.parse(pageRes);
        const rawHtml = pageData?.parse?.text?.['*'];
        if (!rawHtml) continue;

        const $ = cheerio.load(rawHtml);
        $('.mw-editsection, .reference, .infobox, .navbox, .ambox, .metadata, .reflist, .mw-empty-elt, sup').remove();

        const bodyText = $('body').html() || '';
        if (bodyText.length < 300) continue;

        return `<div class="source-badge">Nguồn: <a href="https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}" target="_blank">Wikipedia ${lang.toUpperCase()} — ${title}</a></div>${bodyText}`;
      } catch {
        continue;
      }
    }
    await sleep(300);
  }
  return null;
}

// ─── SOURCE 2: GEEKSFORGEEKS ─────────────────────────────────────────────────

async function fetchFromGFG(chapterTitle: string): Promise<string | null> {
  const cleanTitle = chapterTitle.replace(/Chương \d+[-–\d]*:\s*/i, '').trim();

  // Map common Vietnamese CS terms → English GFG slugs
  const termMap: Record<string, string> = {
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
    'class object': 'classes-and-objects-in-c',
    'deadlock': 'introduction-of-deadlock-in-operating-system',
    'process scheduling': 'cpu-scheduling-in-operating-systems',
    'virtual memory': 'virtual-memory-in-operating-system',
    'tcp ip': 'tcp-ip-model',
    'osi model': 'layers-of-osi-model',
    'normalization': 'normal-forms-in-dbms',
    'sql join': 'sql-join-set-1-inner-left-right-and-full-joins',
    'transaction': 'concurrency-control-in-dbms',
    'big o notation': 'analysis-of-algorithms-set-1-asymptotic-analysis',
    'complexity': 'time-complexity-and-space-complexity',
  };

  const lowerTitle = cleanTitle.toLowerCase();
  let slug: string | null = null;
  for (const [key, val] of Object.entries(termMap)) {
    if (lowerTitle.includes(key)) { slug = val; break; }
  }
  if (!slug) return null;

  const url = `https://www.geeksforgeeks.org/${slug}/`;
  const html = await safeFetch(url);
  if (!html) return null;

  const $ = cheerio.load(html);
  const article = $('.article-page-main, .entry-content, article').first();
  if (!article.length) return null;

  // Clean up ads, navs, sidebars
  article.find('.advertisement, nav, .sidebar, .related-articles, .article-meta, button, .article-header').remove();

  const content = article.html() || '';
  if (content.length < 500) return null;

  return `<div class="source-badge">Nguồn: <a href="${url}" target="_blank">GeeksforGeeks — ${cleanTitle}</a></div><div class="gfg-content">${content}</div>`;
}

// ─── SOURCE 3: PROGRAMIZ ─────────────────────────────────────────────────────

async function fetchFromProgramiz(chapterTitle: string): Promise<string | null> {
  const cleanTitle = chapterTitle.replace(/Chương \d+[-–\d]*:\s*/i, '').trim().toLowerCase();

  const slugMap: Record<string, string> = {
    'stack': 'dsa/stack',
    'queue': 'dsa/queue',
    'linked list': 'dsa/linked-list',
    'binary search': 'dsa/binary-search',
    'bubble sort': 'dsa/bubble-sort',
    'selection sort': 'dsa/selection-sort',
    'insertion sort': 'dsa/insertion-sort',
    'merge sort': 'dsa/merge-sort',
    'quick sort': 'dsa/quick-sort',
    'binary tree': 'dsa/binary-tree',
    'binary search tree': 'dsa/binary-search-tree',
    'heap': 'dsa/heap-data-structure',
    'hash table': 'dsa/hash-table',
    'graph': 'dsa/graph',
    'recursion': 'cpp-programming/recursion',
    'pointer': 'cpp-programming/pointers',
    'function': 'cpp-programming/function',
    'array': 'cpp-programming/arrays',
    'string': 'cpp-programming/string',
    'struct': 'cpp-programming/structure',
  };

  let slug: string | null = null;
  for (const [key, val] of Object.entries(slugMap)) {
    if (cleanTitle.includes(key)) { slug = val; break; }
  }
  if (!slug) return null;

  const url = `https://www.programiz.com/${slug}`;
  const html = await safeFetch(url);
  if (!html) return null;

  const $ = cheerio.load(html);
  const article = $('main article, .entry-content, #tutorial-content').first();
  if (!article.length) return null;
  article.find('nav, .advertisement, footer, .sidebar, .tutorial-meta, .toc-header').remove();

  const content = article.html() || '';
  if (content.length < 400) return null;

  return `<div class="source-badge">Nguồn: <a href="${url}" target="_blank">Programiz — ${cleanTitle}</a></div><div class="programiz-content">${content}</div>`;
}

// ─── SOURCE 4: AI FALLBACK (LAST RESORT) ─────────────────────────────────────

async function fetchFromAI(subjectCode: string, subjectName: string, chapterTitle: string, focusKeywords: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: { temperature: 0.5, maxOutputTokens: 4096 },
    });

    const prompt = `Đóng vai Giáo sư Khoa học Máy tính đại học. Viết bài giảng chuyên sâu cho phần: "${chapterTitle}".
Thuộc môn học: "${subjectCode} - ${subjectName}".${focusKeywords ? `\nTừ khóa trọng tâm: ${focusKeywords}.` : ''}

Yêu cầu BẮT BUỘC:
- Kiến thức phải ĐÚNG TRỌNG TÂM của môn học này (Ví dụ: môn Mạng Máy Tính thì "Tổng quan" là về Mạng, môn C++ thì code là C++). Mỗi chương của mỗi môn phải hoàn toàn khác biệt.
- Nội dung mang tính học thuật cao, bám sát giáo trình chuẩn của MIT OpenCourseWare và các trường Bách Khoa/Đại học CNTT.
    - TUYỆT ĐỐI KHÔNG SỬ DỤNG EMOJI TRONG TOÀN BỘ VĂN BẢN VÀ CODE. Đây là tài liệu học thuật nghiêm túc.
    - Định dạng HTML hợp lệ bằng các thẻ <h2>, <h3>, <p>, <ul>, <li>, <pre><code>. Code sample phải sạch, chuẩn mực.
    
    KHÔNG TRẢ VỀ JSON. CHỈ TRẢ VỀ RAW HTML.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```html/g, '').replace(/```/g, '').trim();
    
    if (!text || text.length < 50) return null;
    return `<div class="source-badge source-badge--ai">Nguồn: AI Generated (Gemini)</div>${text}`;
  } catch (e: any) {
    console.error('[AI Fallback] Error:', e?.message);
    if (e?.message?.includes('429')) throw e;
    return null;
  }
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { sectionId, subjectCode, subjectName, chapterTitle, focusKeywords, forceGenerate } = await req.json();

    if (!sectionId || !chapterTitle) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
    }

    // Check if already has real content (not the empty placeholder)
    const existing = await prisma.theorySection.findUnique({ where: { id: sectionId } });
    if (!forceGenerate && existing?.coreConcept && !existing.coreConcept.includes('Đang chờ cập nhật') && existing.coreConcept.length > 500) {
      return NextResponse.json({ success: true, theory: existing.coreConcept, source: 'cache' });
    }

    let theory: string | null = null;
    let source = '';

    // ── 1. GeeksforGeeks ──
    console.log(`[Theory] Trying GFG for: ${chapterTitle}`);
    theory = await fetchFromGFG(chapterTitle);
    if (theory) source = 'geeksforgeeks';

    // ── 2. Programiz ──
    if (!theory) {
      console.log(`[Theory] Trying Programiz for: ${chapterTitle}`);
      theory = await fetchFromProgramiz(chapterTitle);
      if (theory) source = 'programiz';
    }

    // ── 3. AI Professor Mode ──
    if (!theory) {
      console.log(`[Theory] Static sources failed/bypassed. Calling AI Professor for: ${chapterTitle}`);
      
      // Khử nhập nhằng (Disambiguation) cho các chương dễ bị AI hiểu sai
      let autoFocusKeywords = focusKeywords || '';
      if (subjectCode === 'IT001' || subjectCode === 'IT002') {
        const lower = chapterTitle.toLowerCase();
        if (lower.includes('kiểu dữ liệu có cấu trúc')) autoFocusKeywords = 'Cấu trúc struct, từ khóa struct trong C++, struct data type in C/C++, KHÔNG PHẢI cấu trúc dữ liệu và giải thuật (Data Structures)';
        if (lower.includes('rẽ nhánh')) autoFocusKeywords = 'if else, switch case, toán tử ba ngôi trong C++';
        if (lower.includes('vòng lặp')) autoFocusKeywords = 'for, while, do while, break, continue trong C++';
        if (lower.includes('con trỏ')) autoFocusKeywords = 'pointer, cấp phát động, malloc, new, delete, con trỏ hàm trong C++';
      }

      theory = await fetchFromAI(subjectCode, subjectName || '', chapterTitle, autoFocusKeywords);
      if (theory) source = 'ai_professor';
    }

    if (!theory) {
      return NextResponse.json({ error: 'Không tìm thấy nội dung từ bất kỳ nguồn nào.' }, { status: 404 });
    }

    // Save to DB (cache forever)
    const updated = await prisma.theorySection.update({
      where: { id: sectionId },
      data: { coreConcept: theory },
    });

    console.log(`[Theory] Saved from source: ${source}`);
    return NextResponse.json({ success: true, theory: updated.coreConcept, source });

  } catch (error: any) {
    console.error('[Theory API] Error:', error);
    if (error?.message?.includes('429')) {
      return NextResponse.json({ error: 'AI đang quá tải. Hệ thống đã thử tất cả nguồn tĩnh trước.' }, { status: 429 });
    }
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
