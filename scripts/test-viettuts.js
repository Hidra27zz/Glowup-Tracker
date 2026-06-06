const cheerio = require('cheerio');
async function testDDG() {
  const query = 'site:viettuts.vn "hệ điều hành"';
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const results = [];
  $('.result__url').each((i, el) => {
    let href = $(el).attr('href');
    if (href.startsWith('//duckduckgo.com/l/?uddg=')) {
      href = decodeURIComponent(href.split('uddg=')[1].split('&')[0]);
    }
    results.push(href);
  });
  console.log(results);
}
testDDG();
