'use server';

export interface DynamicYoutubeWorkout {
  id: string;
  title: string;
  channel: string;
  duration: string;
}

const FALLBACK_RECIPE_VIDEOS: (DynamicYoutubeWorkout & { keywords: string[] })[] = [
  {
    id: 'kRCH8kD1GD0',
    title: 'Cách làm Ức Gà Áp Chảo Mềm Mọng Không Bị Khô & Bông Cải Xanh Eat Clean',
    channel: 'Eat Clean Vietnam',
    duration: '08:45',
    keywords: ['ức gà', 'gà', 'bông cải', 'súp lơ', 'áp chảo', 'eat clean'],
  },
  {
    id: 'dA0VGEbbw4g',
    title: 'Canh Đậu Hũ Non Cà Chua Trứng Vân Mây Thanh Đạm Chỉ 10 Phút',
    channel: 'Bếp Nhà Dinh Dưỡng',
    duration: '06:18',
    keywords: ['đậu hũ', 'đậu phụ', 'cà chua', 'trứng', 'canh'],
  },
  {
    id: '3vUtRRZG0xY',
    title: 'Thịt Bò Xào Bông Cải Xanh Mềm Ngọt Giữ Trọn Dinh Dưỡng Tăng Cơ',
    channel: 'Healthy Meal Prep',
    duration: '07:30',
    keywords: ['thịt bò', 'bò', 'bông cải', 'rau cải', 'xào'],
  },
  {
    id: 'qW2tC22G7_k',
    title: 'Trứng Cuộn Cà Chua & Rau Củ Giàu Protein Cho Bữa Sáng Nhanh Gọn',
    channel: 'Bếp Eat Clean',
    duration: '05:40',
    keywords: ['trứng', 'trứng cuộn', 'cà chua', 'bữa sáng', 'sữa'],
  },
  {
    id: 'M9F2wR2p8fA',
    title: 'Cá Áp Chảo Sốt Cà Chua & Chanh Dây Giàu Omega-3 Không Tanh',
    channel: 'MasterChef Home',
    duration: '10:15',
    keywords: ['cá', 'cá hồi', 'cá basa', 'sốt cà chua', 'chanh dây'],
  },
  {
    id: 'vN8X4g7t1wE',
    title: 'Đậu Hũ Sốt Cà Chua Thịt Bằm Đậm Đà Chuẩn Cơm Nhà',
    channel: 'Món Ngon Mỗi Ngày',
    duration: '08:12',
    keywords: ['đậu hũ sốt cà chua', 'đậu hũ', 'thịt bằm', 'nấm'],
  },
  {
    id: 'hT_nvWreIhg',
    title: 'Gà Xào Sả Ớt Thơm Lừng Giàu Đạm Cho Thực Đơn Hàng Ngày',
    channel: 'Vào Bếp Cùng Bạn',
    duration: '09:05',
    keywords: ['gà xào', 'sả ớt', 'gừng', 'đùi gà', 'thịt gà'],
  },
  {
    id: '5qap5aO4i9A',
    title: 'Salad Rau Củ Trứng Luộc & Ức Gà Sốt Mè Rang Giảm Mỡ Hiệu Quả',
    channel: 'Healthy Lifestyle',
    duration: '06:50',
    keywords: ['salad', 'rau', 'xà lách', 'dưa leo', 'cá ngừ', 'sữa chua'],
  },
];

const FALLBACK_WORKOUT_VIDEOS: DynamicYoutubeWorkout[] = [
  {
    id: 'ml6cT4AZdqI',
    title: '30 Min Full Body HIIT Workout - No Equipment Fat Burn At Home',
    channel: 'SELF Fitness',
    duration: '30:12',
  },
  {
    id: 'UBMk30rjy0o',
    title: '20 Min Full Body Workout At Home - Beginner & Intermediate Friendly',
    channel: 'MadFit',
    duration: '20:45',
  },
  {
    id: 'gC_L9qAHVJ8',
    title: '25 Min Core & Upper Body Strength Routine',
    channel: 'THENX',
    duration: '25:10',
  },
  {
    id: 'v7AYKMP6rOE',
    title: '15 Min Morning Mobility & Stretch Flow',
    channel: 'Yoga With Adriene',
    duration: '15:30',
  },
];

export async function searchYoutubeWorkouts(query: string): Promise<DynamicYoutubeWorkout[]> {
  try {
    const searchQuery = encodeURIComponent(`${query} workout at home`);
    const results = await fetchYouTube(searchQuery);
    if (results.length > 0) return results;
  } catch (error) {
    console.error('Lỗi khi search Youtube workout:', error);
  }
  return FALLBACK_WORKOUT_VIDEOS;
}

export async function searchYoutubeTutorials(query: string): Promise<DynamicYoutubeWorkout[]> {
  try {
    const searchQuery = encodeURIComponent(query);
    const results = await fetchYouTube(searchQuery);
    if (results.length > 0) return results;
  } catch (error) {
    console.error('Lỗi khi search Youtube tutorial:', error);
  }
  return FALLBACK_RECIPE_VIDEOS.slice(0, 4);
}

export async function searchYoutubeRecipes(ingredients: string[]): Promise<DynamicYoutubeWorkout[]> {
  const joined = ingredients.join(' ').toLowerCase();
  try {
    const query = `cách nấu món ăn ${ingredients.join(' ')} hướng dẫn`;
    const searchQuery = encodeURIComponent(query);
    const results = await fetchYouTube(searchQuery);
    if (results.length > 0) return results;
  } catch (error) {
    console.error('Lỗi khi search Youtube recipes:', error);
  }

  // Fallback khớp theo nguyên liệu / tên món ăn khi YouTube chặn IP Serverless
  const matched = FALLBACK_RECIPE_VIDEOS.filter((v) =>
    v.keywords.some((kw) => joined.includes(kw) || kw.includes(joined)) ||
    ingredients.some((ing) => v.title.toLowerCase().includes(ing.toLowerCase()))
  );

  if (matched.length > 0) {
    const rest = FALLBACK_RECIPE_VIDEOS.filter((v) => !matched.some((m) => m.id === v.id));
    return [...matched, ...rest].slice(0, 4).map(({ id, title, channel, duration }) => ({
      id,
      title,
      channel,
      duration,
    }));
  }

  return FALLBACK_RECIPE_VIDEOS.slice(0, 4).map(({ id, title, channel, duration }) => ({
    id,
    title,
    channel,
    duration,
  }));
}

async function fetchYouTube(searchQuery: string): Promise<DynamicYoutubeWorkout[]> {
  const res = await fetch(`https://www.youtube.com/results?search_query=${searchQuery}`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
      Cookie: 'CONSENT=YES+cb.20230531-07-p0.vi+FX+999',
    },
    next: { revalidate: 3600 },
  });

  const html = await res.text();
  const match =
    html.match(/var ytInitialData = (\{[\s\S]*?\});<\/script>/) ||
    html.match(/window\["ytInitialData"\] = (\{[\s\S]*?\});<\/script>/);

  if (match && match[1]) {
    try {
      const json = JSON.parse(match[1]);
      const sections =
        json.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
      for (const sec of sections) {
        const contents = sec?.itemSectionRenderer?.contents;
        if (Array.isArray(contents)) {
          const videos = contents
            .filter((c: any) => c.videoRenderer && c.videoRenderer.videoId)
            .slice(0, 4)
            .map((c: any) => {
              const v = c.videoRenderer;
              return {
                id: v.videoId,
                title: v.title?.runs?.[0]?.text || 'Hướng dẫn chế biến món ăn',
                channel: v.ownerText?.runs?.[0]?.text || 'YouTube Cooking',
                duration: v.lengthText?.simpleText || '08:00',
              };
            });
          if (videos.length > 0) return videos;
        }
      }
    } catch {
      // fallback to regex extraction below
    }
  }

  // Secondary regex extraction directly from HTML if JSON structure varies
  const idMatches = Array.from(html.matchAll(/"videoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})"/g));
  const uniqueIds = Array.from(new Set(idMatches.map((m) => m[1]))).slice(0, 4);
  if (uniqueIds.length > 0) {
    return uniqueIds.map((id, idx) => ({
      id,
      title: `Video hướng dẫn công thức #${idx + 1}`,
      channel: 'YouTube Culinary',
      duration: 'HD',
    }));
  }

  return [];
}
