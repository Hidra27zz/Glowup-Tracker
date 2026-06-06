const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const IT001_CHAPTERS = [
  { title: 'Chương 1: Tổng quan về máy tính & lập trình', keywords: 'Lưu đồ thuật toán, Flowchart, máy tính' },
  { title: 'Chương 2: Kiểu dữ liệu, Biến, Hằng & Biểu thức', keywords: 'Kiểu dữ liệu cơ bản C++, hằng số, biểu thức' },
  { title: 'Chương 3: Cấu trúc điều khiển rẽ nhánh', keywords: 'if else, switch case C++' },
  { title: 'Chương 4: Cấu trúc vòng lặp', keywords: 'vòng lặp for, while, do-while C++' },
  { title: 'Chương 5: Hàm và Đệ quy', keywords: 'Hàm C++, tham số truyền bằng giá trị, tham số truyền bằng tham chiếu, đệ quy' },
  { title: 'Chương 6: Mảng & Chuỗi ký tự', keywords: 'Mảng 1 chiều, mảng 2 chiều, chuỗi ký tự C++ std::string' },
  { title: 'Chương 7: Con trỏ & Cấp phát bộ nhớ động', keywords: 'Con trỏ C++, cấp phát động bộ nhớ new delete' },
  { title: 'Chương 8: Kiểu dữ liệu có cấu trúc', keywords: 'struct C++, union, enum' },
  { title: 'Chương 9: Thao tác với Tập tin', keywords: 'đọc ghi file C++, fstream ifstream ofstream' }
];

async function main() {
  console.log('Đang nâng cấp đề cương môn IT001 (Chuẩn Bách Khoa HCM)...');
  
  const subject = await prisma.subject.findFirst({
    where: { code: 'IT001' },
    include: { theories: true }
  });

  if (!subject) {
    console.log('Không tìm thấy môn IT001');
    return;
  }

  // Xóa các chapter cũ
  await prisma.theorySection.deleteMany({
    where: { subjectId: subject.id }
  });
  console.log('️  Đã xóa đề cương cũ...');

  // Xóa luôn bài tập cũ của IT001 để render lại chuẩn
  await prisma.exercise.deleteMany({
    where: { subjectId: subject.id }
  });
  await prisma.reviewQuiz.deleteMany({
    where: { topic: { contains: 'IT001' } }
  });

  // Tạo các chapter mới
  for (let i = 0; i < IT001_CHAPTERS.length; i++) {
    const ch = IT001_CHAPTERS[i];
    const defaultHtml = `
      <h3>Đang chờ cập nhật nội dung...</h3>
      <p>Sử dụng công cụ <strong>Import (Zero-Token)</strong> từ Wikipedia hoặc dán nội dung từ file PDF của bạn vào đây.</p>
      <p><em>Từ khóa trọng tâm: ${ch.keywords}</em></p>
    `;
    await prisma.theorySection.create({
      data: {
        title: ch.title,
        order: i,
        coreConcept: defaultHtml,
        subjectId: subject.id
      }
    });
    console.log(`Đã tạo: ${ch.title}`);
  }

  console.log('Hoàn thành nâng cấp khung chương trình!');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
