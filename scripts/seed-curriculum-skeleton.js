/**
 * CURRICULUM SKELETON SEEDER (Zero-Token)
 * Chỉ tạo cấu trúc môn học, chương, bài tập mẫu (không gọi AI).
 * Giúp người dùng có sẵn sườn chương trình để tự Import dữ liệu.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CURRICULUM = [
  {
    groupName: 'Lập trình & Thuật toán',
    groupIcon: '', groupColor: '#3b82f6',
    subjects: [
      {
        code: 'IT001', name: 'Nhập môn Lập trình', credits: 4, icon: 'C', color: '#60a5fa', language: 'cpp',
        chapters: [
          { title: 'Chương 1: Khái niệm cơ bản & Flowchart', keywords: 'thuật toán, lưu đồ flowchart' },
          { title: 'Chương 2: Kiểu dữ liệu & Rẽ nhánh', keywords: 'if else, switch case' },
          { title: 'Chương 3: Vòng lặp', keywords: 'for, while, do-while' },
          { title: 'Chương 4: Hàm (Functions)', keywords: 'hàm, tham trị, tham chiếu' },
          { title: 'Chương 5: Mảng (Array)', keywords: 'mảng 1 chiều, 2 chiều' },
          { title: 'Chương 6: Con trỏ & Cấp phát động', keywords: 'pointer, memory leak' },
        ]
      },
      {
        code: 'IT002', name: 'Lập trình Hướng đối tượng', credits: 4, icon: '', color: '#a855f7', language: 'cpp',
        chapters: [
          { title: 'Chương 1-2: Tổng quan OOP', keywords: 'đóng gói, kế thừa, đa hình, trừu tượng' },
          { title: 'Chương 3-4: Class, Object, Constructor', keywords: 'class, object, this pointer' },
          { title: 'Chương 5: Đa năng hóa toán tử', keywords: 'operator overloading' },
          { title: 'Chương 6: Kế thừa (Inheritance)', keywords: 'single, multiple inheritance' },
          { title: 'Chương 7: Đa hình (Polymorphism)', keywords: 'virtual function, override' },
        ]
      },
      {
        code: 'IT003', name: 'Cấu trúc Dữ liệu và Giải thuật', credits: 4, icon: '', color: '#22c55e', language: 'cpp',
        chapters: [
          { title: 'Chương 1: Độ phức tạp & Thuật toán', keywords: 'Big O, chia để trị, quy hoạch động' },
          { title: 'Chương 2: Tìm kiếm & Sắp xếp', keywords: 'binary search, quick sort, merge sort' },
          { title: 'Chương 3: Linked List, Stack, Queue', keywords: 'danh sách liên kết, ngăn xếp, hàng đợi' },
          { title: 'Chương 4: Cây nhị phân & BST', keywords: 'cây nhị phân tìm kiếm, duyệt cây' },
          { title: 'Chương 5: Bảng băm (Hash Table)', keywords: 'hàm băm, xử lý đụng độ' },
          { title: 'Chương 6: Đồ thị (Graph)', keywords: 'DFS, BFS, Dijkstra' },
        ]
      },
    ]
  },
  {
    groupName: 'Kiến trúc Hệ thống & Hạ tầng',
    groupIcon: '️', groupColor: '#0ea5e9',
    subjects: [
      {
        code: 'IT007', name: 'Hệ điều hành', credits: 4, icon: '', color: '#0284c7', language: 'c',
        chapters: [
          { title: 'Chương 1-2: Tổng quan OS & System Call', keywords: 'OS architecture, system call' },
          { title: 'Chương 3-4: Tiến trình & Định thời', process: 'PCB, context switch, CPU scheduling' },
          { title: 'Chương 5: Đồng bộ hóa tiến trình', keywords: 'semaphore, mutex lock, critical section' },
          { title: 'Chương 6: Tắc nghẽn (Deadlock)', keywords: 'deadlock prevention, avoidance Banker' },
          { title: 'Chương 7-8: Quản lý Bộ nhớ', keywords: 'paging, virtual memory, page replacement' },
        ]
      },
      {
        code: 'IT005', name: 'Nhập môn Mạng máy tính', credits: 4, icon: '', color: '#38bdf8', language: 'python',
        chapters: [
          { title: 'Chương 1: Tổng quan Mạng', keywords: 'OSI 7 layers, TCP/IP 4 layers' },
          { title: 'Chương 2: Tầng ứng dụng', keywords: 'HTTP, DNS, DHCP, SMTP' },
          { title: 'Chương 3: Tầng giao vận', keywords: 'TCP, UDP, congestion control' },
          { title: 'Chương 4-5: Tầng mạng', keywords: 'IP address, IPv4, NAT, routing' },
          { title: 'Chương 6-8: Data Link & Bảo mật', keywords: 'MAC address, CSMA/CD, mã hóa' },
        ]
      },
      {
        code: 'CLOUD', name: 'Điện toán Đám mây (Azure)', credits: 3, icon: '️', color: '#0284c7', language: 'python',
        chapters: [
          { title: 'Tài nguyên lõi Azure', keywords: 'Blob Storage, VM, VNet' },
          { title: 'Tích hợp & Xử lý dữ liệu', keywords: 'Azure Data Factory, Synapse' },
          { title: 'Hạ tầng ứng dụng', keywords: 'App Service, AKS, Container Registry' },
          { title: 'Serverless & AI Services', keywords: 'Azure Functions, Logic Apps' },
        ]
      },
    ]
  },
  {
    groupName: 'Hệ thống Dữ liệu Chuyên sâu',
    groupIcon: '️', groupColor: '#f59e0b',
    subjects: [
      {
        code: 'IS210', name: 'Hệ Quản trị CSDL', credits: 4, icon: '', color: '#f59e0b', language: 'sql',
        chapters: [
          { title: 'Chương 1-2: Kiến trúc & T-SQL', keywords: 'kiến trúc 3 mức, stored procedure, trigger' },
          { title: 'Chương 3: Giao tác (Transaction)', keywords: 'ACID properties, serializability' },
          { title: 'Chương 4: Điều khiển đồng thời', keywords: '2-Phase Locking, deadlock' },
          { title: 'Chương 5: Phục hồi dữ liệu', keywords: 'Write Ahead Logging, ARIES' },
          { title: 'Chương 6: Tối ưu hóa truy vấn', keywords: 'execution plan, index B-tree' },
        ]
      },
      {
        code: 'IS211', name: 'Cơ sở dữ liệu Phân tán', credits: 3, icon: '️', color: '#d97706', language: 'sql',
        chapters: [
          { title: 'Chương 1-2: Kiến trúc CSDL Phân tán', keywords: 'CAP theorem, transparency' },
          { title: 'Chương 3: Phân mảnh dữ liệu', keywords: 'horizontal, vertical fragmentation' },
          { title: 'Chương 4-5: Tối ưu truy vấn phân tán', keywords: 'distributed join, semijoin' },
          { title: 'Chương 6: Quản lý giao dịch', keywords: '2PC, distributed deadlock' },
        ]
      },
      {
        code: 'IS217', name: 'Kho dữ liệu và OLAP', credits: 3, icon: '', color: '#fbbf24', language: 'sql',
        chapters: [
          { title: 'Chương 1-2: Data Warehouse', keywords: 'star schema, snowflake schema' },
          { title: 'Chương 3: ETL với SSIS', keywords: 'Extract Transform Load, data flow' },
          { title: 'Chương 4: OLAP & MDX', keywords: 'SSAS cube, roll-up drill-down' },
          { title: 'Chương 5: BI & Dashboard', keywords: 'Reporting, Power BI, KPI' },
        ]
      },
      {
        code: 'IS405', name: 'Dữ liệu lớn - Big Data', credits: 3, icon: '', color: '#fb923c', language: 'python',
        chapters: [
          { title: 'Chương 1-2: Big Data & Hadoop', keywords: 'HDFS, MapReduce, YARN' },
          { title: 'Chương 3: NoSQL & Ingestion', keywords: 'MongoDB BSON, Kafka, Cassandra' },
          { title: 'Chương 4: Apache Spark', keywords: 'RDD, DataFrame, in-memory DAG' },
          { title: 'Chương 5: Lambda & Kappa', keywords: 'Lambda architecture, Stream processing' },
        ]
      },
    ]
  },
  {
    groupName: 'Công nghệ Phi tập trung',
    groupIcon: '', groupColor: '#6366f1',
    subjects: [
      {
        code: 'IS355', name: 'Công nghệ Blockchain', credits: 3, icon: '️', color: '#4f46e5', language: 'python',
        chapters: [
          { title: 'Chương 1-2: Cơ bản & Mạng P2P', keywords: 'Bitcoin, hash, Merkle tree' },
          { title: 'Chương 3: Đồng thuận', keywords: 'PoW, PoS, Byzantine' },
          { title: 'Chương 4: Ethereum & Smart Contract', keywords: 'EVM, Solidity' },
          { title: 'Chương 5-7: DeFi & Privacy', keywords: 'DEX, ZK-Rollup' },
        ]
      },
    ]
  },
  {
    groupName: 'Nghiệp vụ & Phát triển Sản phẩm',
    groupIcon: '', groupColor: '#ec4899',
    subjects: [
      {
        code: 'IS336', name: 'Hoạch định Nguồn lực Doanh nghiệp (ERP)', credits: 3, icon: '', color: '#e11d48', language: 'python',
        chapters: [
          { title: 'Chương 1: Tổng quan ERP', keywords: 'Supply Chain, MRP' },
          { title: 'Chương 2-3: Quy trình Mua / Bán', keywords: 'Order to Cash, Procure to Pay' },
          { title: 'Chương 4-5: Sản xuất & Kho', keywords: 'BOM, WMS' },
          { title: 'Chương 6: Tài chính Kế toán', keywords: 'General Ledger, P&L' },
        ]
      },
      {
        code: 'IS208', name: 'Quản lý Dự án CNTT', credits: 3, icon: '', color: '#be185d', language: 'none',
        chapters: [
          { title: 'Chương 1-3: Cơ sở Quản lý', keywords: 'PMBOK, project lifecycle' },
          { title: 'Phạm vi & Thời gian', keywords: 'WBS, CPM, Gantt' },
          { title: 'Chi phí & Rủi ro', keywords: 'EVM, risk register' },
          { title: 'Agile & Scrum Framework', keywords: 'Sprint, Product Owner' },
        ]
      },
      {
        code: 'NT118', name: 'Phát triển Ứng dụng Di động', credits: 3, icon: '', color: '#db2777', language: 'javascript',
        chapters: [
          { title: 'Quy trình & Công nghệ Mobile', keywords: 'React Native, Flutter, Native iOS' },
          { title: 'Android Dev & Firebase', keywords: 'Activity lifecycle, Firestore' },
        ]
      },
      {
        code: 'IS252', name: 'Khai thác dữ liệu (Data Mining)', credits: 3, icon: '️', color: '#8b5cf6', language: 'python',
        chapters: [
          { title: 'Chương 1: Tổng quan KDD', keywords: 'Knowledge Discovery' },
          { title: 'Chương 2: Tiền xử lý dữ liệu', keywords: 'missing values, normalization' },
          { title: 'Chương 3: Khai thác luật kết hợp', keywords: 'Apriori, FP-Growth' },
          { title: 'Chương 4: Phân lớp dữ liệu', keywords: 'Decision Tree, Naive Bayes, KNN' },
          { title: 'Chương 5: Phân cụm dữ liệu', keywords: 'K-Means, DBSCAN' },
        ]
      },
      {
        code: 'IS403', name: 'Phân tích dữ liệu kinh doanh', credits: 3, icon: '', color: '#6d28d9', language: 'python',
        chapters: [
          { title: 'Chương 1: Tổng quan BA', keywords: 'Descriptive, Predictive, Prescriptive' },
          { title: 'Chương 2: Phân tích mô tả', keywords: 'EDA, Dashboard' },
          { title: 'Chương 3: Phân tích dự báo', keywords: 'Regression, Time Series' },
          { title: 'Chương 4: Phân tích đề xuất', keywords: 'Linear Programming, Simulation' },
          { title: 'Chương 5: Ứng dụng thực tế', keywords: 'RFM, Churn prediction' },
        ]
      }
    ]
  },
];

async function main() {
  console.log('Đang khởi tạo Skeleton Toàn bộ Chương Trình Học...');

  let doneSubjects = 0;
  for (const group of CURRICULUM) {
    let dbGroup = await prisma.subjectGroup.findFirst({ where: { name: group.groupName } });
    if (!dbGroup) {
      dbGroup = await prisma.subjectGroup.create({
        data: { name: group.groupName, icon: group.groupIcon, color: group.groupColor, order: CURRICULUM.indexOf(group) }
      });
    }

    for (const subject of group.subjects) {
      // Chỉ tạo nếu chưa tồn tại
      let dbSubject = await prisma.subject.findFirst({ where: { code: subject.code } });
      if (!dbSubject) {
        dbSubject = await prisma.subject.create({
          data: { code: subject.code, name: subject.name, credits: subject.credits, icon: subject.icon, color: subject.color, order: group.subjects.indexOf(subject), groupId: dbGroup.id }
        });
      }

      for (let i = 0; i < subject.chapters.length; i++) {
        const ch = subject.chapters[i];
        
        // Kiểm tra xem chapter này có chưa
        const existing = await prisma.theorySection.findFirst({
          where: { title: ch.title, subjectId: dbSubject.id }
        });

        if (!existing) {
          const defaultHtml = `
            <h3>Nội dung chưa cập nhật</h3>
            <p>Sử dụng công cụ <strong>Import (Zero-Token)</strong> để đưa nội dung bài giảng, slide hoặc file ghi chú vào đây nhé.</p>
            <p><em>Từ khóa trọng tâm của chương: ${ch.keywords || ch.process || ''}</em></p>
          `;
          await prisma.theorySection.create({
            data: { title: ch.title, order: i, coreConcept: defaultHtml, subjectId: dbSubject.id }
          });
        }
      }
      doneSubjects++;
    }
  }

  console.log(`Đã tạo sườn (skeleton) cho ${doneSubjects} môn học thành công.`);
  await prisma.$disconnect();
}

main().catch(async e => {
  console.error('LỖI:', e);
  await prisma.$disconnect();
  process.exit(1);
});
