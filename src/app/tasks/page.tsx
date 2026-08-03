import { prisma } from '@/lib/prisma';
import TaskHub from '@/components/tasks/TaskHub';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const [tasks, sprints, lastMood] = await Promise.all([
    prisma.task.findMany({
      where: {
        OR: [
          { status: { not: 'DONE' } },
          { completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
        ]
      },
      include: { blockedBy: true, blocking: true },
      orderBy: { deadline: 'asc' },
    }),
    prisma.sprint.findMany({
      include: { tasks: true },
      orderBy: { startDate: 'desc' },
      take: 10,
    }),
    prisma.moodLog.findFirst({
      orderBy: { date: 'desc' }
    })
  ]);
  
  const currentEnergy = lastMood?.energy || 5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <h1 style={{ marginBottom: '8px' }}>Task & Energy Router</h1>
        <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Phân bổ công việc thông minh dựa trên mức năng lượng thực tế của bạn.</p>
      </header>

      <TaskHub tasks={tasks} sprints={sprints} currentEnergy={currentEnergy} />
    </div>
  );
}
