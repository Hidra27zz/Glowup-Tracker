/**
 * AUTO MINER - WIKIPEDIA (Multi-language Fallback)
 * Tự động tìm kiếm và lấy lý thuyết từ Wikipedia tiếng Việt.
 * Nếu không có, tự động tìm trên Wikipedia tiếng Anh.
 */

const { PrismaClient } = require('@prisma/client');
const cheerio = require('cheerio');
const prisma = new PrismaClient();

async function searchWiki(query, lang = 'vi') {
  try {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.query && data.query.search && data.query.search.length > 0) {
      return data.query.search[0].title;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function getWikiHtml(title, lang = 'vi') {
  try {
    const pageUrl = `https://${lang}.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&format=json`;
    const res = await fetch(pageUrl);
    const data = await res.json();
    if (data.parse && data.parse.text) {
      const html = data.parse.text['*'];
      
      const $ = cheerio.load(html);
      
      $('.mw-editsection, .reference, .infobox, .navbox, .ambox, .metadata, .reflist').remove();
      
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.startsWith('/wiki/')) {
          $(el).attr('href', `https://${lang}.wikipedia.org` + href);
          $(el).attr('target', '_blank');
        }
      });

      const cleanHtml = `
        <div style="background: rgba(56,189,248,0.05); padding: 15px; border-left: 3px solid #38bdf8; border-radius: 4px; margin-bottom: 20px;">
          <strong>Nguồn tự động:</strong> Wikipedia ${lang.toUpperCase()} (Bài: <a href="https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}" target="_blank">${title}</a>)
        </div>
        ${$('body').html()}
      `;
      return cleanHtml;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function main() {
  console.log('Bắt đầu khai thác dữ liệu Wikipedia (Đa ngôn ngữ)...');
  
  const sections = await prisma.theorySection.findMany({
    include: { subject: true }
  });

  let updatedCount = 0;

  for (const section of sections) {
    if (section.coreConcept.includes('Nội dung chưa cập nhật')) {
      process.stdout.write(`Đang tìm dữ liệu cho: ${section.title}... `);
      
      let keywords = section.title;
      const match = section.coreConcept.match(/Từ khóa trọng tâm của chương: (.*?)</);
      if (match && match[1]) {
        const kwList = match[1].split(',').map(k => k.trim());
        keywords = kwList[0] || section.title;
      }
      
      const cleanTitle = section.title.replace(/Chương \d+[-\d]*: /, '').trim();
      let query = `${cleanTitle} ${section.subject.name}`.slice(0, 50);
      
      // 1. Try Vietnamese
      let lang = 'vi';
      let title = await searchWiki(query, 'vi');
      if (!title) title = await searchWiki(cleanTitle, 'vi');
      if (!title && keywords !== section.title) title = await searchWiki(keywords, 'vi');

      // 2. Fallback to English using keywords
      if (!title && keywords) {
        lang = 'en';
        // often keywords are in English in the IT curriculum (e.g., "Big O", "binary search", "deadlock")
        title = await searchWiki(keywords, 'en');
        if (!title) title = await searchWiki(cleanTitle, 'en');
      }

      if (title) {
        const html = await getWikiHtml(title, lang);
        if (html) {
          await prisma.theorySection.update({
            where: { id: section.id },
            data: { coreConcept: html }
          });
          process.stdout.write(`Đã lấy bài "${title}" (${lang.toUpperCase()})\n`);
          updatedCount++;
        } else {
          process.stdout.write(`Lỗi khi lấy bài "${title}"\n`);
        }
      } else {
        process.stdout.write(`️ Không tìm thấy kết quả phù hợp trên cả VI và EN\n`);
      }
      
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log(`\nHoàn thành! Đã cập nhật thêm ${updatedCount} chương học.`);
  await prisma.$disconnect();
}

main().catch(async e => {
  console.error('LỖI:', e);
  await prisma.$disconnect();
  process.exit(1);
});
