export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { code, name, groupId, chapterTitles } = await req.json();

    if (!code || !name) {
      return NextResponse.json({ error: 'Thiếu mã môn hoặc tên môn' }, { status: 400 });
    }

    let targetGroupId = groupId;
    
    // Nếu không truyền groupId, lấy group đầu tiên
    if (!targetGroupId) {
      const firstGroup = await prisma.subjectGroup.findFirst({ orderBy: { order: 'asc' } });
      if (firstGroup) {
        targetGroupId = firstGroup.id;
      } else {
        // Tạo group mặc định nếu database trống
        const newGroup = await prisma.subjectGroup.create({
          data: { name: 'Khóa học Cá nhân', icon: '', color: '#facc15' }
        });
        targetGroupId = newGroup.id;
      }
    }

    // Tạo subject
    const subject = await prisma.subject.create({
      data: {
        code,
        name,
        icon: '',
        color: '#4ade80',
        groupId: targetGroupId,
      }
    });

    // Tạo chapters nếu có
    const titles = Array.isArray(chapterTitles) ? chapterTitles : ['Chương 1: Tổng quan'];
    for (let i = 0; i < titles.length; i++) {
      await prisma.theorySection.create({
        data: {
          title: titles[i],
          order: i,
          coreConcept: '<p>Nội dung đang chờ cập nhật...</p>',
          subjectId: subject.id,
        }
      });
    }

    return NextResponse.json({ success: true, subject });

  } catch (error: any) {
    console.error('[Subject Create API]', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
