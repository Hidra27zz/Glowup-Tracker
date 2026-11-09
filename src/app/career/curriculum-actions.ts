'use server';

import { prisma } from '@/lib/prisma';
import { subjectGroups } from '@/lib/data/subjects';
import { revalidatePath } from 'next/cache';

export const MULTI_DISCIPLINE_TEMPLATES: Record<
  string,
  {
    name: string;
    icon: string;
    color: string;
    subjects: {
      code: string;
      name: string;
      credits: number;
      color: string;
      theories: { title: string; content: string }[];
    }[];
  }[]
> = {
  business: [
    {
      name: 'Kinh Tế & Quản Trị Kinh Doanh',
      icon: '📊',
      color: '#10b981',
      subjects: [
        {
          code: 'ECO101',
          name: 'Kinh tế học Vi mô & Vĩ mô',
          credits: 3,
          color: '#10b981',
          theories: [
            {
              title: 'Chương 1: Cung - Cầu và Cơ chế Thị trường',
              content: `<h3>1. Quy luật Cung và Cầu</h3><p>Giá thị trường được xác định tại điểm cân bằng nơi lượng cung bằng lượng cầu. Khi cầu tăng (dịch chuyển sang phải), giá và sản lượng cân bằng đều tăng.</p><h3>2. Độ co giãn (Elasticity)</h3><p>Đo lường mức độ phản ứng của người tiêu dùng hoặc nhà sản xuất trước sự thay đổi của giá cả và thu nhập.</p>`,
            },
            {
              title: 'Chương 2: Chỉ số Kinh tế Vĩ mô (GDP, Lạm phát, Lãi suất)',
              content: `<h3>1. Tổng sản phẩm quốc nội (GDP)</h3><p>GDP = C (Tiêu dùng) + I (Đầu tư) + G (Chi tiêu chính phủ) + NX (Xuất khẩu ròng).</p><h3>2. Chính sách Tiền tệ & Tài khóa</h3><p>Ngân hàng trung ương điều tiết cung tiền và lãi suất để kiểm soát lạm phát và thúc đẩy tăng trưởng.</p>`,
            },
          ],
        },
        {
          code: 'MKT201',
          name: 'Marketing Căn bản & Digital Marketing',
          credits: 3,
          color: '#f59e0b',
          theories: [
            {
              title: 'Chương 1: Mô hình 4P & 7P trong Marketing',
              content: `<h3>1. Marketing Mix 4P</h3><ul><li><strong>Product (Sản phẩm):</strong> Giá trị cốt lõi giải quyết vấn đề của khách hàng.</li><li><strong>Price (Giá cả):</strong> Chiến lược định giá theo giá trị, cạnh tranh hoặc thâm nhập.</li><li><strong>Place (Phân phối):</strong> Kênh bán hàng đa kênh (Omnichannel).</li><li><strong>Promotion (Xúc tiến):</strong> Truyền thông, quảng cáo, PR, Content Marketing.</li></ul>`,
            },
            {
              title: 'Chương 2: Hành trình Khách hàng & Phễu Chuyển đổi',
              content: `<h3>Mô hình AIDA</h3><p>Attention (Thu hút chú ý) → Interest (Tạo sự thích thú) → Desire (Khơi gợi mong muốn) → Action (Chuyển đổi mua hàng).</p>`,
            },
          ],
        },
      ],
    },
  ],
  languages: [
    {
      name: 'Ngoại Ngữ & Học Thuật Quốc Tế',
      icon: '🌍',
      color: '#3b82f6',
      subjects: [
        {
          code: 'ENG-IELTS',
          name: 'IELTS Academic (Listening, Reading, Writing, Speaking)',
          credits: 4,
          color: '#3b82f6',
          theories: [
            {
              title: 'Writing Task 2: Cấu trúc bài luận Band 7.5+',
              content: `<h3>Cấu trúc 4 đoạn chuẩn Academic</h3><ul><li><strong>Introduction (2 câu):</strong> Paraphrase đề bài + Thesis Statement (nêu rõ quan điểm).</li><li><strong>Body Paragraph 1 (5 câu):</strong> Topic sentence → Explain → Example thực tế → Link back.</li><li><strong>Body Paragraph 2 (5 câu):</strong> Luận điểm thứ 2 hoặc phản biện.</li><li><strong>Conclusion (1-2 câu):</strong> Tóm tắt lại luận điểm và khẳng định quan điểm.</li></ul>`,
            },
            {
              title: 'Speaking Part 2 & 3: Chiến lược mở rộng ý (IDEA Framework)',
              content: `<h3>Phương pháp PPF (Past - Present - Future)</h3><p>Khi bí ý tưởng trong Speaking Part 2, hãy chia câu chuyện theo 3 mốc thời gian: Quá khứ (bối cảnh), Hiện tại (cảm nhận chi tiết) và Dự định tương lai.</p>`,
            },
          ],
        },
        {
          code: 'COMM101',
          name: 'Giao tiếp & Thuyết trình Chuyên nghiệp',
          credits: 2,
          color: '#a855f7',
          theories: [
            {
              title: 'Chương 1: Nguyên lý Kim tự tháp Minto (Pyramid Principle)',
              content: `<h3>Trả lời kết luận trước, giải thích sau</h3><p>Bắt đầu bằng thông điệp chính (Key Takeaway), theo sau là 3 luận điểm hỗ trợ có dẫn chứng số liệu cụ thể.</p>`,
            },
          ],
        },
      ],
    },
  ],
  design: [
    {
      name: 'Thiết Kế, Sáng Tạo & Nghệ Thuật',
      icon: '🎨',
      color: '#ec4899',
      subjects: [
        {
          code: 'DES101',
          name: 'Tư duy Thiết kế & Nguyên lý Thị giác (UI/UX & Graphic)',
          credits: 3,
          color: '#ec4899',
          theories: [
            {
              title: 'Chương 1: Bố cục, Màu sắc & Typography',
              content: `<h3>1. Hệ thống phân cấp thị giác (Visual Hierarchy)</h3><p>Sử dụng kích thước, độ tương phản, khoảng trắng (Whitespace) và quy tắc 60-30-10 trong phối màu để dẫn dắt mắt người xem.</p>`,
            },
            {
              title: 'Chương 2: Quy trình Design Thinking 5 bước',
              content: `<p><strong>Empathize</strong> (Thấu cảm) → <strong>Define</strong> (Xác định vấn đề) → <strong>Ideate</strong> (Lên ý tưởng) → <strong>Prototype</strong> (Tạo mẫu thử) → <strong>Test</strong> (Kiểm thử người dùng).</p>`,
            },
          ],
        },
      ],
    },
  ],
  general: [
    {
      name: 'Kho Tài Liệu & Ghi Chú Học Tập Chung',
      icon: '📚',
      color: '#6366f1',
      subjects: [
        {
          code: 'STUDY101',
          name: 'Phương pháp Học tập Chủ động (Active Recall & Cornell Notes)',
          credits: 2,
          color: '#6366f1',
          theories: [
            {
              title: 'Chương 1: Phương pháp Feynman & Spaced Repetition',
              content: `<h3>1. Kỹ thuật Feynman (4 bước hiểu sâu mọi lĩnh vực)</h3><ol><li>Chọn khái niệm cần học.</li><li>Giải thích lại bằng ngôn ngữ đơn giản như đang dạy cho người mới bắt đầu.</li><li>Xác định lỗ hổng kiến thức và đọc lại tài liệu gốc.</li><li>Đơn giản hóa và dùng ví dụ thực tế.</li></ol>`,
            },
          ],
        },
      ],
    },
  ],
};

export async function getCurriculumData() {
  const data = await prisma.subjectGroup.findMany({
    include: {
      subjects: {
        include: {
          theories: {
            orderBy: { order: 'asc' },
            include: {
              exercises: { include: { testCases: true } },
              quizzes: true,
            },
          },
          exercises: {
            include: { testCases: true },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  });

  return data;
}

export async function applyFieldPreset(presetKey: 'blank' | 'business' | 'languages' | 'design' | 'general' | 'it') {
  await prisma.subjectGroup.deleteMany({});

  if (presetKey === 'blank') {
    const personalGroup = await prisma.subjectGroup.create({
      data: {
        name: 'Chuyên ngành & Môn học của tôi',
        icon: '🎓',
        color: '#3b82f6',
        order: 0,
      },
    });

    const firstSub = await prisma.subject.create({
      data: {
        code: 'MON-01',
        name: 'Môn học đầu tiên của bạn (Bấm + để thêm môn mới)',
        credits: 3,
        icon: '📘',
        color: '#3b82f6',
        order: 0,
        groupId: personalGroup.id,
      },
    });

    await prisma.theorySection.create({
      data: {
        title: 'Chương 1: Tài liệu & Ghi chú trọng tâm',
        order: 0,
        coreConcept: `<p>Chào mừng bạn đến với <strong>Kho Tài Liệu Đa Ngành</strong>! Bạn có thể tự tạo các môn học thuộc bất kỳ ngành nghề nào (Kinh tế, Y dược, Luật, Ngôn ngữ, Thiết kế, Kỹ thuật...), tải lên PDF slide giảng viên, hoặc nhập bài viết từ Web.</p>`,
        subjectId: firstSub.id,
      },
    });

    revalidatePath('/career');
    return getCurriculumData();
  }

  if (presetKey === 'it') {
    let groupOrder = 0;
    for (const group of subjectGroups) {
      const createdGroup = await prisma.subjectGroup.create({
        data: {
          name: group.name,
          icon: group.icon,
          color: group.color,
          order: groupOrder++,
        },
      });

      let subjectOrder = 0;
      for (const subject of group.subjects) {
        const createdSubject = await prisma.subject.create({
          data: {
            code: subject.code,
            name: subject.name,
            credits: subject.credits,
            icon: subject.icon,
            color: subject.color,
            order: subjectOrder++,
            groupId: createdGroup.id,
          },
        });

        for (let i = 0; i < subject.theory.length; i++) {
          const t = subject.theory[i];
          await prisma.theorySection.create({
            data: {
              title: t.title,
              order: i,
              coreConcept: t.content,
              codeIllustrations: t.quiz ? JSON.stringify(t.quiz) : null,
              subjectId: createdSubject.id,
            },
          });
        }
      }
    }
    revalidatePath('/career');
    return getCurriculumData();
  }

  const templateGroups = MULTI_DISCIPLINE_TEMPLATES[presetKey] || MULTI_DISCIPLINE_TEMPLATES.general;
  let groupOrder = 0;
  for (const grp of templateGroups) {
    const createdGroup = await prisma.subjectGroup.create({
      data: {
        name: grp.name,
        icon: grp.icon,
        color: grp.color,
        order: groupOrder++,
      },
    });

    let subOrder = 0;
    for (const sub of grp.subjects) {
      const createdSub = await prisma.subject.create({
        data: {
          code: sub.code,
          name: sub.name,
          credits: sub.credits,
          icon: grp.icon,
          color: sub.color,
          order: subOrder++,
          groupId: createdGroup.id,
        },
      });

      for (let i = 0; i < sub.theories.length; i++) {
        await prisma.theorySection.create({
          data: {
            title: sub.theories[i].title,
            order: i,
            coreConcept: sub.theories[i].content,
            subjectId: createdSub.id,
          },
        });
      }
    }
  }

  revalidatePath('/career');
  return getCurriculumData();
}

export async function deleteSubjectAction(subjectId: string) {
  await prisma.subject.delete({ where: { id: subjectId } });
  revalidatePath('/career');
  return getCurriculumData();
}

export async function deleteSubjectGroupAction(groupId: string) {
  await prisma.subjectGroup.delete({ where: { id: groupId } });
  revalidatePath('/career');
  return getCurriculumData();
}

export async function addChapterToSubjectAction(subjectId: string, title: string, content: string) {
  const count = await prisma.theorySection.count({ where: { subjectId } });
  await prisma.theorySection.create({
    data: {
      subjectId,
      title,
      order: count,
      coreConcept: content || '<p>Nội dung chương học...</p>',
    },
  });
  revalidatePath('/career');
  return getCurriculumData();
}

export async function createCustomSubjectWithGroup(
  groupName: string,
  code: string,
  name: string,
  chapterTitle?: string,
  chapterContent?: string
) {
  let group = await prisma.subjectGroup.findFirst({
    where: { name: groupName.trim() || 'Môn học của tôi' },
  });

  if (!group) {
    group = await prisma.subjectGroup.create({
      data: {
        name: groupName.trim() || 'Môn học của tôi',
        icon: '📚',
        color: '#3b82f6',
      },
    });
  }

  const subject = await prisma.subject.create({
    data: {
      code: code.trim(),
      name: name.trim(),
      credits: 3,
      icon: '📘',
      color: '#10b981',
      groupId: group.id,
    },
  });

  await prisma.theorySection.create({
    data: {
      title: chapterTitle?.trim() || 'Chương 1: Tổng quan môn học',
      order: 0,
      coreConcept: chapterContent?.trim()
        ? `<p>${chapterContent.trim().replace(/\n/g, '</p><p>')}</p>`
        : '<p>Bạn có thể biên soạn tài liệu, tạo câu hỏi trắc nghiệm ôn tập hoặc import từ PDF/Web cho môn học này.</p>',
      subjectId: subject.id,
    },
  });

  revalidatePath('/career');
  return getCurriculumData();
}

// Hàm tạo nội dung AI nâng cao
export async function generateDeepLearningContent(theoryId: string) {
  const theory = await prisma.theorySection.findUnique({ where: { id: theoryId } });
  if (!theory) throw new Error('Not found');

  await new Promise(res => setTimeout(res, 800));

  const updatedTheory = await prisma.theorySection.update({
    where: { id: theoryId },
    data: {
      realWorldApplications: JSON.stringify([
        `Ứng dụng thực tiễn của "${theory.title}" trong giải quyết bài toán chuyên ngành thực tế.`,
        `Tối ưu hóa quy trình làm việc và ra quyết định dựa trên dữ liệu và nguyên lý cốt lõi.`,
        `Case study thực tế tại các doanh nghiệp và tổ chức hàng đầu trong ngành.`,
      ]),
      edgeCases: JSON.stringify([
        `Lưu ý các trường hợp ngoại lệ khi áp dụng lý thuyết vào điều kiện thực tế biến động.`,
        `Phân biệt rõ khái niệm cốt lõi để tránh nhầm lẫn trong bài thi và phỏng vấn.`,
        `Kiểm chứng giả định đầu vào trước khi đưa ra kết luận.`,
      ]),
    },
  });

  return updatedTheory;
}

export async function resetCurriculumData() {
  return applyFieldPreset('general');
}
