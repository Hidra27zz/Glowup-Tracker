export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import * as cheerio from 'cheerio';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { url, subjectId, titleOverride } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Fetch the raw HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch the URL' }, { status: 500 });
    }

    const html = await response.text();

    // Remove some common ad/tracking scripts before parsing to improve readability accuracy
    const $ = cheerio.load(html);
    $('script, style, noscript, iframe, svg, nav, footer, header').remove();
    const cleanHtml = $.html();

    // Use JSDOM and Readability to extract the main article
    const doc = new JSDOM(cleanHtml, { url });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    if (!article || !article.content) {
      return NextResponse.json({ error: 'Could not extract main content from the URL' }, { status: 500 });
    }

    const finalTitle = titleOverride || article.title || 'Bài giảng crawl từ Web';
    const contentHtml = `<h3>Nguồn: <a href="${url}" target="_blank" rel="noopener">${new URL(url).hostname}</a></h3>\n` + article.content;

    // Nếu có subjectId, lưu thẳng vào DB luôn
    if (subjectId) {
      const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
      if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });

      // Lấy order cao nhất
      const lastSection = await prisma.theorySection.findFirst({
        where: { subjectId },
        orderBy: { order: 'desc' }
      });
      const nextOrder = lastSection ? lastSection.order + 1 : 0;

      const theory = await prisma.theorySection.create({
        data: {
          title: finalTitle,
          order: nextOrder,
          coreConcept: contentHtml,
          subjectId
        }
      });

      return NextResponse.json({ success: true, theory });
    }

    // Nếu không có subjectId, chỉ trả về dữ liệu preview
    return NextResponse.json({
      success: true,
      data: {
        title: finalTitle,
        content: contentHtml,
        excerpt: article.excerpt
      }
    });

  } catch (error: any) {
    console.error('Web Import Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
