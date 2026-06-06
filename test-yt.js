const https = require('https');
https.get('https://www.youtube.com/results?search_query=boxing+workout+at+home', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/var ytInitialData = (.*);<\/script>/);
    if (match) {
      const json = JSON.parse(match[1]);
      const contents = json.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
      const videos = contents.filter(c => c.videoRenderer).slice(0, 4).map(c => {
        const v = c.videoRenderer;
        return {
          id: v.videoId,
          title: v.title.runs[0].text,
          channel: v.ownerText.runs[0].text,
          duration: v.lengthText ? v.lengthText.simpleText : ''
        };
      });
      console.log(videos);
    } else {
      console.log("No match");
    }
  });
});
