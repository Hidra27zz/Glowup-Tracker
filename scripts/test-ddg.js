const cheerio = require('cheerio');

async function testDDG() {
  const query = 'site:github.com "bài giảng" "hệ điều hành"';
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const results = [];
  $('.result__url').each((i, el) => {
    results.push($(el).attr('href'));
  });
  console.log(results);
}
testDDG();
