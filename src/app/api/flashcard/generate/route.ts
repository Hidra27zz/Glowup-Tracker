export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

async function fetchFlashcardsFromAI(coreConcept: string): Promise<any[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: { temperature: 0.6, maxOutputTokens: 2048, responseMimeType: 'application/json' },
    });

    const prompt = `Dựa vào TÀI LIỆU HỌC TẬP sau đây, hãy tạo 10 thẻ Flashcard (hỏi - đáp hoặc thuật ngữ - định nghĩa) BÁM SÁT nội dung.
TÀI LIỆU HỌC TẬP:
${coreConcept.slice(0, 15000)}

TUYỆT ĐỐI KHÔNG SỬ DỤNG EMOJI.
Định dạng JSON:
{ "flashcards": [{ "front": "Mặt trước (câu hỏi/thuật ngữ)", "back": "Mặt sau (trả lời/định nghĩa)" }] }`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const data = JSON.parse(text);
      return data.flashcards || null;
    } catch (parseErr) {
      console.error('[Flashcard AI] JSON Parse Error. Raw text:', text.slice(0, 200));
      return null;
    }
  } catch (e: any) {
    console.error('[Flashcard AI] Error:', e?.message);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { sectionId, forceGenerate } = await req.json();

    if (!sectionId) {
      return NextResponse.json({ error: 'Thiếu sectionId' }, { status: 400 });
    }

    const section = await prisma.theorySection.findUnique({ where: { id: sectionId } });
    if (!section) {
      return NextResponse.json({ error: 'Không tìm thấy bài giảng' }, { status: 404 });
    }

    // Nếu đã có flashcards và không force, trả về cache
    if (section.flashcards && !forceGenerate) {
      return NextResponse.json({ success: true, flashcards: JSON.parse(section.flashcards), source: 'cache' });
    }

    if (!section.coreConcept) {
      return NextResponse.json({ error: 'Chưa có nội dung bài giảng để tạo flashcard' }, { status: 400 });
    }

    const generated = await fetchFlashcardsFromAI(section.coreConcept);

    if (!generated || generated.length === 0) {
      return NextResponse.json({ error: 'Không tạo được Flashcards' }, { status: 500 });
    }

    // Save to DB
    await prisma.theorySection.update({
      where: { id: sectionId },
      data: { flashcards: JSON.stringify(generated) }
    });

    return NextResponse.json({ success: true, flashcards: generated, source: 'ai' });
  } catch (error: any) {
    console.error('[Flashcard API]', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
