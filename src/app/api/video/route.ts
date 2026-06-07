export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    
    if (!q) {
      return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }

    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = await response.text();
    
    // Extract ytInitialData
    const regex = /var ytInitialData = (\{[\s\S]*?\});<\/script>/;
    const match = html.match(regex);
    
    if (match && match[1]) {
      const data = JSON.parse(match[1]);
      let videoId = null;
      
      try {
        const contents = data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
        for (const item of contents) {
          if (item.videoRenderer && item.videoRenderer.videoId) {
            videoId = item.videoRenderer.videoId;
            break;
          }
        }
      } catch(e) {
         console.log("Parse error:", e);
      }
      
      if (videoId) {
        return NextResponse.json({ videoId });
      } else {
        return NextResponse.json({ error: 'No video renderer found' }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: 'Could not parse YouTube HTML' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Video API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
