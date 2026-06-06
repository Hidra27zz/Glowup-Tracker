const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const OOP_CHAPTERS = [
  { title: 'Chương 1: Ôn tập C++ cơ bản & Struct', keywords: 'Struct C++, con trỏ, tham chiếu' },
  { title: 'Chương 2: Tổng quan phương pháp OOP', keywords: 'Lập trình hướng đối tượng, abstraction, encapsulation, inheritance, polymorphism' },
  { title: 'Chương 3: Lớp (Class) và Đối tượng (Object)', keywords: 'Class C++, Access Modifiers, thuộc tính, phương thức' },
  { title: 'Chương 4: Constructor, Destructor & Con trỏ this', keywords: 'Constructor C++, Destructor C++, con trỏ this' },
  { title: 'Chương 5: Đa năng hóa toán tử (Operator Overloading)', keywords: 'Nạp chồng toán tử, operator overloading C++' },
  { title: 'Chương 6: Kế thừa (Inheritance)', keywords: 'Kế thừa C++, đơn kế thừa, đa kế thừa' },
  { title: 'Chương 7: Đa hình (Polymorphism) & Hàm ảo', keywords: 'Đa hình C++, virtual function, override, override C++' },
  { title: 'Chương 8: Lớp trừu tượng & Giao diện (Interface)', keywords: 'Abstract Class C++, pure virtual function, Interface OOP' },
  { title: 'Chương 9: Khuôn hình (Templates & Generics)', keywords: 'Template C++, Generics C++, function template, class template' },
  { title: 'Chương 10: Xử lý ngoại lệ (Exception Handling)', keywords: 'try catch C++, Exception handling, std::exception' },
  { title: 'Chương 11: Design Patterns cơ bản', keywords: 'Mẫu thiết kế, Design Patterns, Singleton pattern, Factory pattern, Observer pattern' }
];

async function main() {
  console.log('Đang nâng cấp đề cương môn Lập trình Hướng đối tượng (IT002)...');
  
  const subject = await prisma.subject.findFirst({
    where: { code: 'IT002' },
    include: { theories: true }
  });

  if (!subject) {
    console.log('Không tìm thấy môn Lập trình Hướng đối tượng (IT002)');
    return;
  }

  // Xóa các chapter cũ
  await prisma.theorySection.deleteMany({
    where: { subjectId: subject.id }
  });
  console.log('️  Đã xóa đề cương cũ...');

  // Tạo các chapter mới
  for (let i = 0; i < OOP_CHAPTERS.length; i++) {
    const ch = OOP_CHAPTERS[i];
    const defaultHtml = `
      <h3>Nội dung chưa cập nhật...</h3>
      <p>Sử dụng công cụ <strong>Import (Zero-Token)</strong> từ Wikipedia hoặc dán nội dung từ file PDF của bạn vào đây.</p>
      <p><em>Từ khóa trọng tâm của chương: ${ch.keywords}</em></p>
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
