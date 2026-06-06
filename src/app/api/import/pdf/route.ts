import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const pdfParse = require('pdf-parse');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const subjectId = formData.get('subjectId') as string;
    const titleOverride = formData.get('titleOverride') as string;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the PDF
    const data = await pdfParse(buffer);
    const rawText = String(data.text);

    if (!rawText || rawText.trim() === '') {
      return NextResponse.json({ error: 'Could not extract text from the PDF. It might be scanned.' }, { status: 500 });
    }

    // Basic formatting: split by newlines, wrap in <p> tags, and attempt to identify slide headers
    const lines = rawText.split('\\n').filter((line: string) => line.trim() !== '');
    
    let htmlContent = `<h3>Nguồn File: ${file.name} (Bóc tách tự động)</h3>\\n`;
    htmlContent += `<p><em>Lưu ý: Nội dung bóc tách từ PDF có thể mất định dạng bảng biểu hoặc hình ảnh.</em></p>\\n`;
    
    htmlContent += '<div style="background: rgba(255,255,255,0.02); padding: 20px; border-radius: 8px;">';
    for (const line of lines) {
      // Very basic heuristic for headers (all caps or short lines)
      if (line.length < 50 && line === line.toUpperCase() && /[A-Z]/.test(line)) {
        htmlContent += `<h4>${line.trim()}</h4>\\n`;
      } else {
        htmlContent += `<p>${line.trim()}</p>\\n`;
      }
    }
    htmlContent += '</div>';

    const finalTitle = titleOverride || file.name.replace('.pdf', '') || 'Lý thuyết từ Slide';

    if (subjectId) {
      const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
      if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });

      const lastSection = await prisma.theorySection.findFirst({
        where: { subjectId },
        orderBy: { order: 'desc' }
      });
      const nextOrder = lastSection ? lastSection.order + 1 : 0;

      const theory = await prisma.theorySection.create({
        data: {
          title: finalTitle,
          order: nextOrder,
          coreConcept: htmlContent,
          subjectId
        }
      });

      return NextResponse.json({ success: true, theory });
    }

    return NextResponse.json({
      success: true,
      data: {
        title: finalTitle,
        content: htmlContent,
      }
    });

  } catch (error: any) {
    console.error('PDF Import Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
