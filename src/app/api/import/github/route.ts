export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { marked } from 'marked';

export async function POST(request: NextRequest) {
  try {
    const { url, subjectId, titleOverride } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'GitHub raw URL is required' }, { status: 400 });
    }

    // Ensure it's a raw.githubusercontent.com URL
    let rawUrl = url;
    if (url.includes('github.com') && url.includes('/blob/')) {
      rawUrl = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }

    const response = await fetch(rawUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch the Markdown file from GitHub' }, { status: 500 });
    }

    const markdownText = await response.text();

    // Convert Markdown to HTML
    const htmlContent = await marked.parse(markdownText);
    
    // Create title from filename if not provided
    let finalTitle = titleOverride;
    if (!finalTitle) {
      const parts = rawUrl.split('/');
      finalTitle = parts[parts.length - 1].replace('.md', '').replace(/-/g, ' ');
      // Capitalize
      finalTitle = finalTitle.charAt(0).toUpperCase() + finalTitle.slice(1);
    }

    const finalHtml = `<h3>Nguồn GitHub: <a href="${url}" target="_blank" rel="noopener">${finalTitle}</a></h3>\n` + htmlContent;

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
          coreConcept: finalHtml,
          subjectId
        }
      });

      return NextResponse.json({ success: true, theory });
    }

    return NextResponse.json({
      success: true,
      data: {
        title: finalTitle,
        content: finalHtml,
      }
    });

  } catch (error: any) {
    console.error('GitHub Import Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
