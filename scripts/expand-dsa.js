const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DSA_CHAPTERS = [
  { title: 'Chương 1: Độ phức tạp & Thuật toán', keywords: 'Độ phức tạp thuật toán, Big O notation' },
  { title: 'Chương 2: Tìm kiếm & Sắp xếp', keywords: 'Thuật toán tìm kiếm, thuật toán sắp xếp, thuật toán tìm kiếm nhị phân' },
  { title: 'Chương 3: Linked List, Stack, Queue', keywords: 'Danh sách liên kết, Ngăn xếp, Hàng đợi' },
  { title: 'Chương 4: Cây nhị phân & Cây tìm kiếm nhị phân', keywords: 'Cây nhị phân, cây tìm kiếm nhị phân' },
  { title: 'Chương 5: Bảng băm (Hash Table)', keywords: 'Bảng băm, Hàm băm' },
  { title: 'Chương 6: Đồ thị (Graph - Căn bản)', keywords: 'Đồ thị, Tìm kiếm theo chiều sâu, Tìm kiếm theo chiều rộng' },
  { title: 'Chương 7: Đồ thị nâng cao (Đường đi ngắn nhất)', keywords: 'Thuật toán Dijkstra, Thuật toán Bellman-Ford' },
  { title: 'Chương 8: Cây tự cân bằng & Heap', keywords: 'Cây AVL, Cây đỏ đen, Hàng đợi ưu tiên' },
  { title: 'Chương 9: Quy hoạch động (Dynamic Programming)', keywords: 'Quy hoạch động, Bài toán cái túi' },
  { title: 'Chương 10: Thuật toán Tham lam (Greedy) & Chia để trị', keywords: 'Thuật toán tham lam, Thuật toán chia để trị' },
  { title: 'Chương 11: Cấu trúc dữ liệu nâng cao', keywords: 'Cấu trúc dữ liệu Disjoint-set, Trie' }
];

async function main() {
  console.log('Đang nâng cấp đề cương môn Cấu trúc Dữ liệu & Giải thuật (IT003)...');
  
  const subject = await prisma.subject.findFirst({
    where: { code: 'IT003' },
    include: { theories: true }
  });

  if (!subject) {
    console.log('Không tìm thấy môn IT003');
    return;
  }

  // Xóa các chapter cũ
  await prisma.theorySection.deleteMany({
    where: { subjectId: subject.id }
  });
  console.log('️  Đã xóa đề cương cũ...');

  // Tạo các chapter mới
  for (let i = 0; i < DSA_CHAPTERS.length; i++) {
    const ch = DSA_CHAPTERS[i];
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

  console.log('Hoàn thành nâng cấp khung chương trình DSA!');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
