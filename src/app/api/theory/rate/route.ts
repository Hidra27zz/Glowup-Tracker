export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { sectionId, rating } = await req.json();

    if (!sectionId || rating === undefined) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating không hợp lệ' }, { status: 400 });
    }

    const updated = await prisma.theorySection.update({
      where: { id: sectionId },
      data: { rating }
    });

    return NextResponse.json({ success: true, rating: updated.rating });
  } catch (error: any) {
    console.error('[Rate Theory API]', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
