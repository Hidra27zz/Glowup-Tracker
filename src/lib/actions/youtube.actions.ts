'use server';

export interface DynamicYoutubeWorkout {
  id: string;
  title: string;
  channel: string;
  duration: string;
}

export async function searchYoutubeWorkouts(query: string): Promise<DynamicYoutubeWorkout[]> {
  try {
    const searchQuery = encodeURIComponent(`${query} workout at home`);
    return await fetchYouTube(searchQuery);
  } catch (error) {
    console.error('Lỗi khi search Youtube:', error);
    return [];
  }
}

export async function searchYoutubeTutorials(query: string): Promise<DynamicYoutubeWorkout[]> {
  try {
    const searchQuery = encodeURIComponent(query);
    return await fetchYouTube(searchQuery);
  } catch (error) {
    console.error('Lỗi khi search Youtube:', error);
    return [];
  }
}

export async function searchYoutubeRecipes(ingredients: string[]): Promise<DynamicYoutubeWorkout[]> {
  try {
    const query = `cách nấu món ăn với ${ingredients.join(' ')}`;
    const searchQuery = encodeURIComponent(query);
    return await fetchYouTube(searchQuery);
  } catch (error) {
    console.error('Lỗi khi search Youtube:', error);
    return [];
  }
}

async function fetchYouTube(searchQuery: string): Promise<DynamicYoutubeWorkout[]> {
  const res = await fetch(`https://www.youtube.com/results?search_query=${searchQuery}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
    },
    next: { revalidate: 3600 } 
  });
  
  const html = await res.text();
  const match = html.match(/var ytInitialData = (.*?);<\/script>/);
  if (!match) return [];
  
  const json = JSON.parse(match[1]);
  const contents = json.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;
  
  if (!contents || !Array.isArray(contents)) return [];
  
  const videos = contents
    .filter((c: any) => c.videoRenderer)
    .slice(0, 4) 
    .map((c: any) => {
      const v = c.videoRenderer;
      return {
        id: v.videoId,
        title: v.title?.runs?.[0]?.text || '',
        channel: v.ownerText?.runs?.[0]?.text || '',
        duration: v.lengthText?.simpleText || 'N/A'
      };
    });
    
  return videos;
}
