async function run() {
    const query = 'vòng lặp C++';
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = await response.text();
    
    // Find ytInitialData
    const regex = /var ytInitialData = (\{.*?\});<\/script>/s;
    const match = html.match(regex);
    if (match && match[1]) {
      const data = JSON.parse(match[1]);
      // Navigate deep into the JSON to find the first videoId
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
         console.log("Parse error:", e.message);
      }
      console.log("Video ID found:", videoId);
    } else {
      console.log("Could not find ytInitialData in HTML");
    }
}
run();
