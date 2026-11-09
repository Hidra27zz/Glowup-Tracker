import { NextRequest, NextResponse } from 'next/server';
import { buildScheduleTemplateBuffer, buildSampleIcsContent } from '@/lib/utils/scheduleParser';

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get('format') || 'xlsx';

  if (format === 'ics') {
    const ics = buildSampleIcsContent(new Date());
    return new NextResponse(ics, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="Mau_Lich_Calendar_GlowUp.ics"',
      },
    });
  }

  const buf = buildScheduleTemplateBuffer(new Date());
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="Mau_Lich_Calendar_GlowUp.xlsx"',
    },
  });
}
