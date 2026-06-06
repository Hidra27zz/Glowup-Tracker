'use server';

import { prisma } from '@/lib/prisma';
import { subjectGroups } from '@/lib/data/subjects';

export async function getCurriculumData() {
  const count = await prisma.subjectGroup.count();
  
  if (count === 0) {
    // Seed data từ subjects.ts nếu DB trống
    let groupOrder = 0;
    for (const group of subjectGroups) {
      const createdGroup = await prisma.subjectGroup.create({
        data: {
          name: group.name,
          icon: group.icon,
          color: group.color,
          order: groupOrder++,
        }
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
          }
        });
        
        // Add theory sections - bao gồm quiz
        for (let i = 0; i < subject.theory.length; i++) {
          const t = subject.theory[i];
          await prisma.theorySection.create({
            data: {
              title: t.title,
              order: i,
              coreConcept: t.content,
              codeIllustrations: t.quiz ? JSON.stringify(t.quiz) : null,
              realWorldApplications: null,
              edgeCases: null,
              subjectId: createdSubject.id,
            }
          });
        }
        
        // Add exercises - bao gồm realWorldScenario và edgeCases
        for (const ex of subject.exercises) {
          const createdEx = await prisma.exercise.create({
            data: {
              title: ex.title,
              difficulty: ex.difficulty,
              hint: ex.hint || '',
              description: ex.description,
              starterCode: JSON.stringify(ex.starterCode),
              realWorldScenario: ex.realWorldScenario || null,
              edgeCasesToConsider: ex.edgeCases ? JSON.stringify(ex.edgeCases) : null,
              subjectId: createdSubject.id,
            }
          });
          
          for (const tc of ex.testCases) {
            await prisma.exerciseTestCase.create({
              data: {
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                isHidden: tc.isHidden || false,
                exerciseId: createdEx.id,
              }
            });
          }
        }
      }
    }
  }
  
  // Fetch data
  const data = await prisma.subjectGroup.findMany({
    include: {
      subjects: {
        include: {
          theories: { 
            orderBy: { order: 'asc' },
            include: {
              exercises: { include: { testCases: true } },
              quizzes: true
            }
          },
          exercises: {
            include: { testCases: true }
          }
        },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { order: 'asc' }
  });
  
  return data;
}

// Hàm tạo nội dung AI nâng cao
export async function generateDeepLearningContent(theoryId: string) {
  const theory = await prisma.theorySection.findUnique({ where: { id: theoryId }});
  if (!theory) throw new Error("Not found");
  
  await new Promise(res => setTimeout(res, 1500));
  
  const updatedTheory = await prisma.theorySection.update({
    where: { id: theoryId },
    data: {
      realWorldApplications: JSON.stringify([
        `Hệ thống Netflix sử dụng kiến trúc này để xử lý hàng triệu request mỗi giây.`,
        `Google Search Engine áp dụng thuật toán tương tự trong indexing và ranking.`,
        `Uber và Grab dùng để tính toán tuyến đường tối ưu theo thời gian thực.`
      ]),
      edgeCases: JSON.stringify([
        `Tràn số (Integer overflow): Khi n > 2×10⁹, dùng long long thay vì int.`,
        `Division by zero: Luôn kiểm tra mẫu số trước khi chia.`,
        `Null/empty input: Luôn validate dữ liệu đầu vào trước khi xử lý.`,
        `Off-by-one error: Kiểm tra kỹ điều kiện vòng lặp và index mảng.`
      ])
    }
  });
  
  return updatedTheory;
}

// Xóa và reset toàn bộ dữ liệu để seed lại
export async function resetCurriculumData() {
  await prisma.subjectGroup.deleteMany({});
  return getCurriculumData();
}
