import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { parseScheduleFileBuffer } from '@/lib/utils/scheduleParser';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: 'Vui lòng chọn file lịch trình (.xlsx, .ics, .csv hoặc .json).' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);
    const { events, sprints } = parseScheduleFileBuffer(buf, file.name, new Date());

    if (events.length === 0 && sprints.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Không tìm thấy sự kiện hoặc lịch trình hợp lệ trong file. Hãy kiểm tra lại định dạng (.xlsx, .ics, .csv) hoặc tải file mẫu.',
        },
        { status: 400 }
      );
    }

    let eventsAdded = 0;
    let sprintsAdded = 0;

    for (const sp of sprints) {
      await prisma.sprint.create({
        data: {
          name: sp.name,
          startDate: sp.startDate,
          endDate: sp.endDate,
          isActive: true,
        },
      });
      sprintsAdded++;
    }

    for (const ev of events) {
      await prisma.task.create({
        data: {
          title: ev.title,
          category: ev.category,
          startTime: ev.startTime,
          deadline: ev.endTime,
          location: ev.location || null,
          description: ev.description || null,
          energyLevel: ev.energyLevel || 'Medium',
          status: 'TODO',
          isCoreTask: ev.energyLevel === 'High',
        },
      });
      eventsAdded++;
    }

    revalidatePath('/');
    revalidatePath('/tasks');

    return NextResponse.json({
      ok: true,
      eventsAdded,
      sprintsAdded,
      message: `Đã import thành công ${eventsAdded} lịch học/làm việc/lịch hẹn${
        sprintsAdded > 0 ? ` và ${sprintsAdded} Sprint` : ''
      } vào Calendar.`,
    });
  } catch (err: any) {
    console.error('Schedule import error:', err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Lỗi khi xử lý file lịch trình.' },
      { status: 500 }
    );
  }
}
