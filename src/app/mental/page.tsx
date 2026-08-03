import { prisma } from '@/lib/prisma';
import { logMood } from './actions';
import { Brain, Sparkles, Battery, BookHeart, History, ShieldAlert } from 'lucide-react';
import MentalHub from '@/components/mental/MentalHub';

export const dynamic = 'force-dynamic';

export default async function MentalPage() {
  const [moodLogs, detoxHistory, infoDietLogs] = await Promise.all([
    prisma.moodLog.findMany({
      orderBy: { date: 'desc' },
      take: 7,
    }),
    prisma.detoxSession.findMany({
      orderBy: { startDate: 'desc' },
      take: 5,
    }),
    prisma.informationDietLog.findMany({
      orderBy: { date: 'desc' },
      take: 50,
    })
  ]);

  const activeSession = detoxHistory.find(s => !s.endDate) || null;

  const recentLogs = moodLogs.slice(0, 3);
  const avgEnergy = recentLogs.length > 0 
    ? recentLogs.reduce((acc, log) => acc + log.energy, 0) / recentLogs.length 
    : null;
    
  const burnoutWarning = avgEnergy !== null && avgEnergy <= 4;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <h1 style={{ marginBottom: '8px' }}>Mental & Cognitive</h1>
        <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Bảo vệ sức khỏe tinh thần, theo dõi năng lượng và cảm xúc</p>
      </header>

      <MentalHub 
        moodLogs={moodLogs}
        detoxHistory={detoxHistory}
        infoDietLogs={infoDietLogs}
        activeSession={activeSession}
        burnoutWarning={burnoutWarning}
        avgEnergy={avgEnergy}
      />
    </div>
  );
}
