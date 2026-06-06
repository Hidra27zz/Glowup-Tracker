'use server';

import { searchYoutubeTutorials } from './youtube.actions';

export interface LearningResource {
  id: string;
  title: string;
  source: 'YouTube' | 'Dev.to' | 'GitHub' | 'Article' | 'Google';
  url: string;
  author: string;
  thumbnail?: string;
  type: 'video' | 'article' | 'repo';
}

export async function fetchDevToArticles(query: string): Promise<LearningResource[]> {
  try {
    const res = await fetch(`https://dev.to/api/articles?q=${encodeURIComponent(query)}&per_page=5`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: any) => ({
      id: `devto_${item.id}`,
      title: item.title,
      source: 'Dev.to',
      url: item.url,
      author: item.user?.name || 'Dev.to Author',
      thumbnail: item.cover_image || item.social_image,
      type: 'article'
    }));
  } catch (e) {
    console.error('Lỗi khi fetch Dev.to', e);
    return [];
  }
}

export async function fetchGithubRepos(query: string): Promise<LearningResource[]> {
  try {
    const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+language:javascript&sort=stars&order=desc&per_page=5`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      id: `github_${item.id}`,
      title: item.full_name,
      source: 'GitHub',
      url: item.html_url,
      author: item.owner?.login || 'GitHub User',
      thumbnail: item.owner?.avatar_url,
      type: 'repo'
    }));
  } catch (e) {
    console.error('Lỗi khi fetch Github', e);
    return [];
  }
}

export async function fetchMultiSourceResources(query: string, limit: number = 4, pageOffset: number = 0): Promise<LearningResource[]> {
  try {
    // Gọi song song các API
    const [ytVideos, devToArticles, githubRepos] = await Promise.all([
      searchYoutubeTutorials(query),
      fetchDevToArticles(query),
      fetchGithubRepos(query)
    ]);

    // Chuẩn hóa Youtube format
    const formattedYt: LearningResource[] = ytVideos.map(v => ({
      id: `yt_${v.id}`,
      title: v.title,
      source: 'YouTube',
      url: `https://youtube.com/watch?v=${v.id}`,
      author: v.channel,
      thumbnail: `https://img.youtube.com/vi/${v.id}/mqdefault.jpg`,
      type: 'video'
    }));

    // Tạo resource Google Search dự phòng
    const googleFallback: LearningResource = {
      id: `google_${Date.now()}`,
      title: `Tìm kiếm thêm tài liệu, khóa học về: "${query}"`,
      source: 'Google',
      url: `https://www.google.com/search?q=${encodeURIComponent(query + ' tutorial course guide')}`,
      author: 'Google Search',
      type: 'article'
    };

    // Gộp tất cả lại
    const allResources = [...formattedYt, ...devToArticles, ...githubRepos];
    
    // Đảo mảng hoặc trộn (shuffle) cho ngẫu nhiên phong phú
    const shuffled = allResources.sort(() => Math.random() - 0.5);

    // Lấy theo limit
    const results = shuffled.slice(pageOffset, pageOffset + limit);
    
    // Luôn nhét Google Search vào cuối nếu có
    if (!results.find(r => r.source === 'Google')) {
        results.push(googleFallback);
    }

    return results;
  } catch (error) {
    console.error('Lỗi khi fetch MultiSourceResources:', error);
    return [{
      id: `google_fallback_${Date.now()}`,
      title: `Tìm kiếm tài liệu cho: "${query}"`,
      source: 'Google',
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      author: 'Google Search',
      type: 'article'
    }];
  }
}

export async function fetchSingleResource(query: string, skipIds: string[] = []): Promise<LearningResource | null> {
    try {
        const [ytVideos, devToArticles, githubRepos] = await Promise.all([
            searchYoutubeTutorials(query),
            fetchDevToArticles(query),
            fetchGithubRepos(query)
        ]);

        const formattedYt: LearningResource[] = ytVideos.map(v => ({
            id: `yt_${v.id}`,
            title: v.title,
            source: 'YouTube',
            url: `https://youtube.com/watch?v=${v.id}`,
            author: v.channel,
            thumbnail: `https://img.youtube.com/vi/${v.id}/mqdefault.jpg`,
            type: 'video'
        }));

        const allResources = [...formattedYt, ...devToArticles, ...githubRepos];
        
        // Lọc bỏ các ID đã học
        const available = allResources.filter(r => !skipIds.includes(r.id));
        
        if (available.length === 0) return null;
        
        // Chọn ngẫu nhiên 1 cái
        return available[Math.floor(Math.random() * available.length)];
    } catch (e) {
        return null;
    }
}
