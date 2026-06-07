export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subjectCode = searchParams.get('subject');

  try {
    if (!subjectCode) {
      return NextResponse.json({ error: 'Missing subject parameter' }, { status: 400 });
    }

    // Lấy quiz questions từ DB theo topic chứa mã môn
    const quizzes = await prisma.reviewQuiz.findMany({
      where: {
        topic: { contains: subjectCode }
      },
      orderBy: { createdAt: 'asc' },
      take: 20, // tối đa 20 câu
    });

    const questions = quizzes.map(q => ({
      id: q.id,
      question: q.question,
      options: (() => {
        try { return JSON.parse(q.options); } catch { return []; }
      })(),
      answerIndex: q.answerIndex,
      explanation: q.explanation,
      topic: q.topic,
    }));

    return NextResponse.json({ questions, total: questions.length });
  } catch (error) {
    console.error('Quiz API error:', error);
    return NextResponse.json({ error: 'Internal server error', questions: [] }, { status: 500 });
  }
}
