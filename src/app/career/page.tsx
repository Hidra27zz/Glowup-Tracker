import { prisma } from '@/lib/prisma';
import CareerHub from '@/components/career/CareerHub';

export const dynamic = 'force-dynamic';

export default async function CareerPage() {
  const skills = await prisma.skill.findMany({
    orderBy: { category: 'asc' },
  });

  const deepWorkSessions = await prisma.deepWorkSession.findMany({
    orderBy: { date: 'desc' },
    take: 5,
  });

  const flashcardDecks = await prisma.flashcardDeck.findMany({
    include: { cards: true },
    orderBy: { createdAt: 'desc' },
  });

  const jobApplications = await prisma.jobApplication.findMany({
    orderBy: { appliedDate: 'desc' },
  });

  const codeSnippets = await prisma.codeSnippet.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <header>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
          Career & Learning Hub
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
          Lộ trình học tập, phỏng vấn AI, kỹ năng và quản lý tri thức
        </p>
      </header>

      <CareerHub
        skills={skills}
        recentSessions={deepWorkSessions}
        flashcardDecks={flashcardDecks}
        jobApplications={jobApplications}
        codeSnippets={codeSnippets}
      />
    </div>
  );
}
