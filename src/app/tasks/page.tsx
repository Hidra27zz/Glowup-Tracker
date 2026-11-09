import { prisma } from '@/lib/prisma';
import TaskHub from '@/components/tasks/TaskHub';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const [tasks, sprints, lastMood, smartGoals] = await Promise.all([
    prisma.task.findMany({
      where: {
        OR: [
          { status: { not: 'DONE' } },
          { completedAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } }
        ]
      },
      include: { blockedBy: true, blocking: true, sprint: true },
      orderBy: { deadline: 'asc' },
    }),
    prisma.sprint.findMany({
      include: { tasks: true },
      orderBy: { startDate: 'desc' },
      take: 20,
    }),
    prisma.moodLog.findFirst({
      orderBy: { date: 'desc' }
    }),
    prisma.smartGoal.findMany({
      orderBy: { deadline: 'asc' }
    })
  ]);
  
  const currentEnergy = lastMood?.energy || 5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <h1 style={{ marginBottom: '8px' }}>Task, Schedule & SMART Goals Hub</h1>
        <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
          Quản lý Công việc, Thời khóa biểu, Lịch làm việc, Lịch hẹn, Sprint & Mục tiêu SMART với cảnh báo thời gian thực.
        </p>
      </header>

      <TaskHub tasks={tasks} sprints={sprints} currentEnergy={currentEnergy} smartGoals={smartGoals} />
    </div>
  );
}
