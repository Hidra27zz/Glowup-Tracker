export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const FALLBACK_EDU_VIDEOS: { keywords: string[]; videoId: string }[] = [
  { keywords: ['kinh tế', 'cung', 'cầu', 'gdp', 'vĩ mô'], videoId: '3ez10ADR_gM' },
  { keywords: ['marketing', '4p', 'aida', 'digital'], videoId: 'QusJ4fpWQwA' },
  { keywords: ['ielts', 'writing', 'speaking', 'english'], videoId: 'tbd4t-ua-WQ' },
  { keywords: ['ui', 'ux', 'design', 'thiết kế'], videoId: 'c9Wg6Cb_YlU' },
  { keywords: ['feynman', 'active recall', 'cornell', 'học'], videoId: 'IlU-zDU6aQ0' },
  { keywords: ['python', 'javascript', 'c++', 'algorithm', 'code'], videoId: '8hly31xKli0' },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    if (!q) {
      return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }

    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
          Cookie: 'CONSENT=YES+cb.20230531-07-p0.vi+FX+999',
        },
      });

      const html = await response.text();
      const idMatch = html.match(/"videoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})"/);
      if (idMatch && idMatch[1]) {
        return NextResponse.json({ videoId: idMatch[1] });
      }
    } catch {
      // Fall through to curated fallback
    }

    const lower = q.toLowerCase();
    const matched = FALLBACK_EDU_VIDEOS.find((item) =>
      item.keywords.some((kw) => lower.includes(kw))
    );
    return NextResponse.json({ videoId: matched ? matched.videoId : 'IlU-zDU6aQ0' });
  } catch (error: any) {
    console.error('Video API Error:', error);
    return NextResponse.json({ videoId: 'IlU-zDU6aQ0' });
  }
}
