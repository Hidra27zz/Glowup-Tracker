const { PrismaClient } = require('@prisma/client');
const cheerio = require('cheerio');
const prisma = new PrismaClient();

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
  console.log('Đang sửa lỗi nội dung cho Mạng P2P (Blockchain)...');

  const subject = await prisma.subject.findFirst({
    where: { code: 'IS355' }
  });

  if (!subject) {
    console.log('Không tìm thấy môn Blockchain (IS355)');
    return;
  }

  const section = await prisma.theorySection.findFirst({
    where: {
      subjectId: subject.id,
      title: { contains: 'P2P' }
    }
  });

  if (!section) {
    console.log('Không tìm thấy chương P2P');
    return;
  }

  console.log(`Đang cào lại dữ liệu cho bài "Mạng ngang hàng"...`);
  const html = await getWikiHtml('Mạng_ngang_hàng', 'vi');

  if (html) {
    await prisma.theorySection.update({
      where: { id: section.id },
      data: { coreConcept: html }
    });
    console.log(`Đã cập nhật thành công nội dung chuẩn Mạng ngang hàng cho chương P2P!`);
  } else {
    console.log(`Lỗi khi lấy dữ liệu Wikipedia.`);
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
