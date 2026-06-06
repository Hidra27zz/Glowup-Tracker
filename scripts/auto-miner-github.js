/**
 * AUTO MINER - GITHUB REPO (TheAlgorithms & Sinh viên UIT)
 * Tự động cào code mẫu từ GitHub Raw API (Zero-Token).
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Danh sách một số file code mẫu kinh điển trên GitHub
const CODE_SOURCES = [
  {
    subject: 'IT001', chapterMatch: 'vòng lặp',
    title: 'In dãy Fibonacci',
    url: 'https://raw.githubusercontent.com/TheAlgorithms/C-Plus-Plus/master/math/fibonacci.cpp'
  },
  {
    subject: 'IT001', chapterMatch: 'mảng',
    title: 'Tìm kiếm tuyến tính',
    url: 'https://raw.githubusercontent.com/TheAlgorithms/C-Plus-Plus/master/search/linear_search.cpp'
  },
  {
    subject: 'IT003', chapterMatch: 'tìm kiếm',
    title: 'Tìm kiếm nhị phân (Binary Search)',
    url: 'https://raw.githubusercontent.com/TheAlgorithms/C-Plus-Plus/master/search/binary_search.cpp'
  },
  {
    subject: 'IT003', chapterMatch: 'sắp xếp',
    title: 'Sắp xếp nổi bọt (Bubble Sort)',
    url: 'https://raw.githubusercontent.com/TheAlgorithms/C-Plus-Plus/master/sorting/bubble_sort.cpp'
  },
  {
    subject: 'IT003', chapterMatch: 'sắp xếp',
    title: 'Sắp xếp nhanh (Quick Sort)',
    url: 'https://raw.githubusercontent.com/TheAlgorithms/C-Plus-Plus/master/sorting/quick_sort.cpp'
  },
  {
    subject: 'IT003', chapterMatch: 'cây nhị phân',
    title: 'Duyệt cây nhị phân (BST)',
    url: 'https://raw.githubusercontent.com/TheAlgorithms/C-Plus-Plus/master/data_structures/binary_search_tree.cpp'
  },
  {
    subject: 'IT003', chapterMatch: 'đồ thị',
    title: 'Duyệt theo chiều sâu (DFS)',
    url: 'https://raw.githubusercontent.com/TheAlgorithms/C-Plus-Plus/master/graph/depth_first_search.cpp'
  },
  {
    subject: 'IT003', chapterMatch: 'đồ thị',
    title: 'Thuật toán Dijkstra',
    url: 'https://raw.githubusercontent.com/TheAlgorithms/C-Plus-Plus/master/graph/dijkstra.cpp'
  }
];

async function fetchGithubRaw(url) {
  try {
    const res = await fetch(url);
    if (res.ok) {
      const code = await res.text();
      return code;
    }
  } catch (e) {
    return null;
  }
  return null;
}

async function main() {
  console.log('Bắt đầu cào Code thực tế từ GitHub (Zero-Token)...');
  
  const subjects = await prisma.subject.findMany({ include: { theories: true, exercises: true } });
  let count = 0;

  for (const source of CODE_SOURCES) {
    // Tìm môn học tương ứng
    const subject = subjects.find(s => s.code === source.subject);
    if (!subject) continue;

    // Kéo code từ GitHub
    process.stdout.write(`Đang tải file ${source.title} từ GitHub... `);
    const codeContent = await fetchGithubRaw(source.url);
    
    if (codeContent) {
      // Tìm xem đã có bài tập này chưa
      const exist = subject.exercises.find(e => e.title === source.title);
      if (!exist) {
        // Tạo bài tập mới với code mẫu
        await prisma.exercise.create({
          data: {
            title: source.title,
            difficulty: 'Medium',
            description: `Đọc hiểu và chạy thử mã nguồn mở từ GitHub. Bài toán: ${source.title}.`,
            starterCode: JSON.stringify({ cpp: codeContent }),
            realWorldScenario: 'Sử dụng mã nguồn được đóng góp từ cộng đồng (TheAlgorithms).',
            subjectId: subject.id,
            testCases: {
              create: [
                { input: "Biên dịch và chạy thuật toán", expectedOutput: "Kết quả đúng như logic thuật toán.", isHidden: false }
              ]
            }
          }
        });
        process.stdout.write(`Đã lưu vào Bài tập!\n`);
        count++;
      } else {
        process.stdout.write(`️ Bài tập đã tồn tại.\n`);
      }
    } else {
      process.stdout.write(`Lỗi khi tải URL.\n`);
    }
  }

  console.log(`\nHoàn thành! Đã cào thêm ${count} bài tập code thực tế từ GitHub.`);
  await prisma.$disconnect();
}

main().catch(async e => {
  console.error('LỖI:', e);
  await prisma.$disconnect();
  process.exit(1);
});
