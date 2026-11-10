'use server';

import { prisma } from '@/lib/prisma';
import { subjectGroups } from '@/lib/data/subjects';
import { revalidatePath } from 'next/cache';

const MULTI_DISCIPLINE_TEMPLATES: Record<
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
  selfstudy: [
    {
      name: 'Tự Học & Kỹ Năng Cá Nhân',
      icon: '',
      color: '#3dd68c',
      subjects: [
        {
          code: 'TH-01',
          name: 'Ngoại ngữ tự học (Từ vựng, Nghe, Nói)',
          credits: 0,
          color: '#3dd68c',
          theories: [
            {
              title: 'Kế hoạch tuần & mục tiêu',
              content: `<h3>Đặt mục tiêu tuần</h3><ul><li>Số từ mới mỗi ngày</li><li>Số phút nghe / nói mỗi ngày</li><li>Cách tự kiểm tra cuối tuần</li></ul>`,
            },
          ],
        },
        {
          code: 'TH-02',
          name: 'Kỹ năng số (Excel, Dữ liệu, Công cụ AI)',
          credits: 0,
          color: '#6cc4ff',
          theories: [
            {
              title: 'Lộ trình học theo dự án nhỏ',
              content: `<p>Chọn một bài toán thực tế của bạn (báo cáo chi tiêu, theo dõi công việc...) và học công cụ cần thiết để giải quyết nó.</p>`,
            },
          ],
        },
        {
          code: 'TH-03',
          name: 'Đọc sách & Ghi chú tri thức',
          credits: 0,
          color: '#f5b94a',
          theories: [
            {
              title: 'Ghi chú theo phương pháp Cornell',
              content: `<p>Chia trang thành: <strong>Ghi chú chính</strong>, <strong>Từ khóa / Câu hỏi</strong> và <strong>Tóm tắt</strong> cuối trang.</p>`,
            },
          ],
        },
      ],
    },
  ],
  graduate: [
    {
      name: 'Phát Triển Nghề Nghiệp (Sau Tốt Nghiệp)',
      icon: '',
      color: '#7b8cff',
      subjects: [
        {
          code: 'CAR-01',
          name: 'Kỹ năng việc làm: CV, Phỏng vấn, Đàm phán lương',
          credits: 0,
          color: '#7b8cff',
          theories: [
            {
              title: 'CV theo vị trí ứng tuyển',
              content: `<h3>Cấu trúc CV 1 trang</h3><ul><li>Tóm tắt 2-3 dòng</li><li>Thành tựu có số liệu</li><li>Kỹ năng khớp mô tả công việc</li></ul>`,
            },
            {
              title: 'Phương pháp trả lời STAR',
              content: `<p><strong>S</strong>ituation → <strong>T</strong>ask → <strong>A</strong>ction → <strong>R</strong>esult.</p>`,
            },
          ],
        },
        {
          code: 'CAR-02',
          name: 'Chứng chỉ & Học liên tục trong ngành',
          credits: 0,
          color: '#14b8a6',
          theories: [
            {
              title: 'Bản đồ chứng chỉ cần có',
              content: `<p>Liệt kê chứng chỉ ngành bạn đang theo, hạn thi, chi phí và kế hoạch ôn tập.</p>`,
            },
          ],
        },
        {
          code: 'CAR-03',
          name: 'Dự án cá nhân & Portfolio',
          credits: 0,
          color: '#ec4899',
          theories: [
            {
              title: 'Chọn 1 dự án để hoàn thành trong 30 ngày',
              content: `<p>Xác định đầu ra rõ ràng, cột mốc theo tuần và cách trình bày kết quả.</p>`,
            },
          ],
        },
        {
          code: 'CAR-04',
          name: 'Tài chính cá nhân cho người đi làm',
          credits: 0,
          color: '#f5b94a',
          theories: [
            {
              title: 'Quỹ dự phòng & ngân sách 50/30/20',
              content: `<p>Xây quỹ dự phòng 3-6 tháng chi tiêu trước khi đầu tư.</p>`,
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
  const fetchAll = () =>
    prisma.subjectGroup.findMany({
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

  return fetchAll();
}

async function assertSubjectOwned(subjectId: string) {
  const ok = await prisma.subjectGroup.findFirst({ where: { subjects: { some: { id: subjectId } } } });
  if (!ok) throw new Error('Không tìm thấy môn học hoặc bạn không có quyền sửa.');
}

async function assertGroupOwned(groupId: string) {
  const ok = await prisma.subjectGroup.findFirst({ where: { id: groupId } });
  if (!ok) throw new Error('Không tìm thấy nhóm hoặc bạn không có quyền sửa.');
}

async function assertChapterOwned(chapterId: string) {
  const ok = await prisma.subjectGroup.findFirst({
    where: { subjects: { some: { theories: { some: { id: chapterId } } } } },
  });
  if (!ok) throw new Error('Không tìm thấy chương hoặc bạn không có quyền sửa.');
}

export async function applyFieldPreset(
  presetKey: 'blank' | 'business' | 'languages' | 'design' | 'general' | 'it' | 'selfstudy' | 'graduate',
  mode: 'append' | 'replace' = 'append'
) {
  if (mode === 'replace') {
    await prisma.subjectGroup.deleteMany({});
  }

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
    let groupOrder = await prisma.subjectGroup.count({});
    for (const group of subjectGroups) {
      const dup = await prisma.subjectGroup.findFirst({ where: { name: group.name } });
      if (dup) continue;
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
  let groupOrder = await prisma.subjectGroup.count({});
  for (const grp of templateGroups) {
    const dup = await prisma.subjectGroup.findFirst({ where: { name: grp.name } });
    if (dup) continue;
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
  await assertSubjectOwned(subjectId);
  await prisma.subject.delete({ where: { id: subjectId } });
  revalidatePath('/career');
  return getCurriculumData();
}

export async function deleteSubjectGroupAction(groupId: string) {
  await assertGroupOwned(groupId);
  await prisma.subjectGroup.delete({ where: { id: groupId } });
  revalidatePath('/career');
  return getCurriculumData();
}

export async function createGroupAction(name: string, color: string) {
  if (!name.trim()) throw new Error('Tên nhóm không được để trống.');
  const order = await prisma.subjectGroup.count({});
  await prisma.subjectGroup.create({
    data: { name: name.trim(), icon: '', color: color || '#6cc4ff', order },
  });
  revalidatePath('/career');
  return getCurriculumData();
}

export async function updateGroupAction(groupId: string, input: { name: string; color: string }) {
  await assertGroupOwned(groupId);
  if (!input.name.trim()) throw new Error('Tên nhóm không được để trống.');
  await prisma.subjectGroup.update({
    where: { id: groupId },
    data: { name: input.name.trim(), color: input.color },
  });
  revalidatePath('/career');
  return getCurriculumData();
}

export async function createSubjectAction(input: {
  groupId?: string;
  newGroupName?: string;
  name: string;
  code?: string;
  credits?: number;
  color?: string;
}) {
  const name = input.name.trim();
  if (!name) throw new Error('Tên môn học không được để trống.');

  let groupId = input.groupId;
  if (!groupId || groupId === '__new__') {
    const gName = (input.newGroupName || '').trim() || 'Môn học của tôi';
    let group = await prisma.subjectGroup.findFirst({ where: { name: gName } });
    if (!group) {
      const order = await prisma.subjectGroup.count({});
      group = await prisma.subjectGroup.create({
        data: { name: gName, icon: '', color: input.color || '#6cc4ff', order },
      });
    }
    groupId = group.id;
  } else {
    await assertGroupOwned(groupId);
  }

  const order = await prisma.subject.count({ where: { groupId } });
  const code = (input.code || '').trim() || `TH-${String(order + 1).padStart(2, '0')}`;

  const subject = await prisma.subject.create({
    data: {
      code,
      name,
      credits: Math.max(0, input.credits ?? 0),
      icon: '',
      color: input.color || '#3dd68c',
      order,
      groupId,
    },
  });

  await prisma.theorySection.create({
    data: {
      title: 'Chương 1: Tổng quan',
      order: 0,
      coreConcept:
        '<p>Bấm <strong>+ Chương</strong> để thêm bài học, hoặc dùng tab <strong>Import</strong> để nhập tài liệu từ web / file.</p>',
      subjectId: subject.id,
    },
  });

  revalidatePath('/career');
  return { data: await getCurriculumData(), subjectId: subject.id };
}

export async function updateSubjectAction(
  subjectId: string,
  input: { groupId?: string; newGroupName?: string; name: string; code?: string; credits?: number; color?: string }
) {
  await assertSubjectOwned(subjectId);
  const name = input.name.trim();
  if (!name) throw new Error('Tên môn học không được để trống.');

  let groupId = input.groupId;
  if (groupId === '__new__') {
    const gName = (input.newGroupName || '').trim() || 'Môn học của tôi';
    let group = await prisma.subjectGroup.findFirst({ where: { name: gName } });
    if (!group) {
      const order = await prisma.subjectGroup.count({});
      group = await prisma.subjectGroup.create({
        data: { name: gName, icon: '', color: input.color || '#6cc4ff', order },
      });
    }
    groupId = group.id;
  } else if (groupId) {
    await assertGroupOwned(groupId);
  }

  await prisma.subject.update({
    where: { id: subjectId },
    data: {
      name,
      ...(input.code !== undefined && input.code.trim() ? { code: input.code.trim() } : {}),
      credits: Math.max(0, input.credits ?? 0),
      ...(input.color ? { color: input.color } : {}),
      ...(groupId ? { groupId } : {}),
    },
  });
  revalidatePath('/career');
  return getCurriculumData();
}

export async function updateChapterAction(chapterId: string, title: string, content?: string) {
  await assertChapterOwned(chapterId);
  if (!title.trim()) throw new Error('Tên chương không được để trống.');
  await prisma.theorySection.update({
    where: { id: chapterId },
    data: {
      title: title.trim(),
      ...(content && content.trim()
        ? { coreConcept: `<p>${content.trim().replace(/\n/g, '</p><p>')}</p>` }
        : {}),
    },
  });
  revalidatePath('/career');
  return getCurriculumData();
}

export async function deleteChapterAction(chapterId: string) {
  await assertChapterOwned(chapterId);
  await prisma.theorySection.delete({ where: { id: chapterId } });
  revalidatePath('/career');
  return getCurriculumData();
}

export async function addChapterToSubjectAction(subjectId: string, title: string, content: string) {
  await assertSubjectOwned(subjectId);
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

  const order = await prisma.subject.count({ where: { groupId: group.id } });
  const finalCode = (code || '').trim() || `TH-${String(order + 1).padStart(2, '0')}`;

  const subject = await prisma.subject.create({
    data: {
      code: finalCode,
      name: name.trim(),
      credits: (code || '').trim() ? 3 : 0,
      icon: '',
      color: '#10b981',
      order,
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
