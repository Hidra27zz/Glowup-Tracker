import { NextResponse } from 'next/server';
import { getGlowUpTemplateSheets, generateXlsxBuffer } from '@/lib/utils/excelWorkbook';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sheets = getGlowUpTemplateSheets();
  const buffer = generateXlsxBuffer(sheets);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="GlowUp_OS_Mau_Nhap_Lieu_7_Sheets.xlsx"',
      'Cache-Control': 'no-store',
    },
  });
}
