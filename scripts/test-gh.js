async function testGH() {
  const query = encodeURIComponent('"hệ điều hành" "bài giảng" extension:md');
  const res = await fetch(`https://api.github.com/search/code?q=${query}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  if(res.ok) {
    const data = await res.json();
    console.log(data.items.slice(0, 3).map(i => i.html_url));
  } else {
    console.log('Error:', res.status, await res.text());
  }
}
testGH();
