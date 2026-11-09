import { prisma } from '@/lib/prisma';
import CareerHub from '@/components/career/CareerHub';
import { getCurriculumData } from '@/app/career/curriculum-actions';

export const dynamic = 'force-dynamic';

export default async function CareerPage() {
  const [skills, deepWorkSessions, flashcardDecks, jobApplications, codeSnippets, curriculumData] =
    await Promise.all([
      prisma.skill.findMany({
        orderBy: { category: 'asc' },
      }),
      prisma.deepWorkSession.findMany({
        orderBy: { date: 'desc' },
        take: 5,
      }),
      prisma.flashcardDeck.findMany({
        include: { cards: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.jobApplication.findMany({
        orderBy: { appliedDate: 'desc' },
        take: 50,
      }),
      prisma.codeSnippet.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      getCurriculumData(),
    ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <header>
        <h1 style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Career & Learning Hub
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Hệ thống quản lý học liệu đa ngành, ôn tập thẻ nhớ, cố vấn lộ trình nghề nghiệp và luyện phỏng vấn AI
        </p>
      </header>

      <CareerHub
        skills={skills}
        recentSessions={deepWorkSessions}
        flashcardDecks={flashcardDecks}
        jobApplications={jobApplications}
        codeSnippets={codeSnippets}
        curriculumData={curriculumData}
      />
    </div>
  );
}
