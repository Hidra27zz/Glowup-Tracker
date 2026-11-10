import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import QuickActionForms from '@/components/dashboard/QuickActionForms';
import HydrationTracker from '@/components/dashboard/HydrationTracker';
import InteractiveTasks from '@/components/dashboard/InteractiveTasks';
import QuickStatsForms from '@/components/dashboard/QuickStatsForms';
import FastingWidget from '@/components/dashboard/FastingWidget';
import InfoDietLog from '@/components/dashboard/InfoDietLog';
import DashboardDeepWorkTimer from '@/components/dashboard/DashboardDeepWorkTimer';
import SmartGoalBoard from '@/components/dashboard/SmartGoalBoard';
import DashboardScheduleHub from '@/components/dashboard/DashboardScheduleHub';
import SmartAICommandBar from '@/components/dashboard/SmartAICommandBar';
import ExcelImportHub from '@/components/dashboard/ExcelImportHub';
import { getTaskTimeStatus, formatDateTimeRange } from '@/lib/utils/timeFormat';

export const dynamic = 'force-dynamic';

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="glass-card"
      style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: color || 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

export default async function Dashboard() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const [
    todayMoodLog,
    tasks,
    weeklyExpenses,
    todayNutrition,
    settings,
    activeDetox,
    dueFlashcardsCount,
    smartGoals,
    sprints,
    todayDeepWorkAgg,
  ] = await Promise.all([
    prisma.moodLog.findFirst({ where: { date: { gte: startOfDay } } }),
    prisma.task.findMany({ orderBy: { deadline: 'asc' }, take: 30 }),
    prisma.financialTransaction.aggregate({
      where: { createdAt: { gte: startOfWeek }, type: 'expense' },
      _sum: { amount: true },
    }),
    prisma.nutritionLog.findFirst({ where: { date: { gte: startOfDay } } }),
    prisma.userSettings.findUnique({ where: { id: 'default' } }),
    prisma.detoxSession.findFirst({ where: { endDate: null }, orderBy: { startDate: 'desc' } }),
    prisma.flashcard.count({ where: { nextReview: { lte: new Date() } } }),
    prisma.smartGoal.findMany({ orderBy: { deadline: 'asc' } }),
    prisma.sprint.findMany({
      where: { isActive: true },
      include: { tasks: true },
      orderBy: { startDate: 'desc' },
      take: 5,
    }),
    prisma.deepWorkSession.aggregate({
      where: { date: { gte: startOfDay } },
      _sum: { duration: true },
    }),
  ]);

  const totalDeepWorkMinutesToday = todayDeepWorkAgg._sum?.duration || 0;

  const primarySmartGoal = smartGoals[0];
  const goalTitle = primarySmartGoal
    ? primarySmartGoal.title
    : settings?.bodyRecompGoal || 'Chưa đặt mục tiêu chính';
  const goalProgress = primarySmartGoal
    ? Math.min(100, Math.round((primarySmartGoal.currentValue / (primarySmartGoal.targetValue || 1)) * 100))
    : 0;
  const antiHabit = activeDetox?.notes || 'Không lướt video ngắn sau 23:00';
  const fastingStartStr = settings?.fastingStart ? settings.fastingStart.toISOString() : null;
  const waterDrops = todayMoodLog?.hydration || 0;

  const todoTasks = tasks.filter((t) => t.status !== 'DONE');
  const coreTasks = todoTasks.slice(0, 4);
  const closestTask = coreTasks[0] || null;
  const closestStatus = closestTask
    ? getTaskTimeStatus(closestTask.startTime, closestTask.deadline, closestTask.status)
    : null;

  const overdueTasks = todoTasks.filter((t) => getTaskTimeStatus(t.startTime, t.deadline, t.status).isOverdue);
  const warningTasks = todoTasks.filter((t) => getTaskTimeStatus(t.startTime, t.deadline, t.status).isWarning);

  const spent = weeklyExpenses._sum.amount || 0;
  const budget = settings?.budgetGoal || 400000;
  const budgetPercent = Math.min((spent / budget) * 100, 100);
  const budgetColor = spent > budget * 0.8 ? 'var(--danger-color)' : spent > budget * 0.6 ? 'var(--warning-color)' : 'var(--success-color)';

  const calConsumed = todayNutrition?.calories || 0;
  const calGoal = settings?.goalCal || 1500;
  const calPercent = Math.min((calConsumed / calGoal) * 100, 100);

  const dateLabel = now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Tổng quan</h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.9rem', textTransform: 'capitalize' }}>{dateLabel}</p>
        </div>
      </header>

      {/* Quick capture */}
      <SmartAICommandBar />

      {/* Alerts */}
      {(dueFlashcardsCount > 0 || overdueTasks.length > 0 || warningTasks.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {overdueTasks.length > 0 && (
            <Link
              href="/tasks"
              className="glass-card"
              style={{ borderLeft: '3px solid var(--danger-color)', padding: '14px 16px', display: 'block' }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--danger-color)', marginBottom: '6px' }}>
                Trễ hạn · {overdueTasks.length} việc
              </div>
              {overdueTasks.slice(0, 3).map((t) => {
                const st = getTaskTimeStatus(t.startTime, t.deadline, t.status);
                return (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '0.85rem', padding: '3px 0' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{t.title}</span>
                    <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{st.overdueDurationText}</span>
                  </div>
                );
              })}
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '6px' }}>Mở để giải trình</div>
            </Link>
          )}
          {warningTasks.length > 0 && (
            <Link
              href="/tasks"
              className="glass-card"
              style={{ borderLeft: '3px solid var(--warning-color)', padding: '14px 16px', display: 'block' }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--warning-color)', marginBottom: '6px' }}>
                Sắp đến hạn · {warningTasks.length} việc
              </div>
              {warningTasks.slice(0, 3).map((t) => {
                const st = getTaskTimeStatus(t.startTime, t.deadline, t.status);
                return (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '0.85rem', padding: '3px 0' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{t.title}</span>
                    <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{st.badgeText}</span>
                  </div>
                );
              })}
            </Link>
          )}
          {dueFlashcardsCount > 0 && (
            <Link
              href="/career"
              className="glass-card"
              style={{ borderLeft: '3px solid var(--accent-color)', padding: '14px 16px', display: 'block' }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-color)', marginBottom: '6px' }}>
                Ôn tập
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {dueFlashcardsCount} thẻ cần ôn hôm nay
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Primary goal + KPIs (4 equal columns) */}
      <div className="dashboard-kpi-grid">
        <div className="glass-card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mục tiêu chính</span>
            {primarySmartGoal && (
              <a
                href="#edit-primary-goal"
                style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--accent-color)', textDecoration: 'none' }}
              >
                Chỉnh sửa
              </a>
            )}
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', lineHeight: 1.25 }}>{goalTitle}</div>
          {primarySmartGoal && (
            <>
              <div style={{ height: '6px', background: 'var(--surface-3)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${goalProgress}%`, height: '100%', background: 'var(--accent-color)' }} />
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                {primarySmartGoal.currentValue} / {primarySmartGoal.targetValue} {primarySmartGoal.unit} · {goalProgress}%
              </div>
            </>
          )}
        </div>
        <Stat label="Calo hôm nay" value={`${calConsumed}`} sub={`Mục tiêu ${calGoal} kcal · ${Math.round(calPercent)}%`} />
        <Stat label="Chi tiêu tuần" value={`${(spent / 1000).toFixed(0)}k`} sub={`Ngân sách ${(budget / 1000).toFixed(0)}k · ${Math.round(budgetPercent)}%`} color={budgetColor} />
        <Stat label="Tập trung hôm nay" value={`${totalDeepWorkMinutesToday} phút`} sub={`Nước uống: ${waterDrops} ly`} />
      </div>

      <SmartGoalBoard goals={smartGoals} />

      <DashboardScheduleHub tasks={tasks} sprints={sprints} />

      {/* 3 balanced equal-height cards: Việc cần làm | Tập trung | Ghi nhanh chỉ số */}
      <div className="dashboard-trio-grid">
        <Section
          title="Việc cần làm"
          action={
            <Link href="/tasks" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Xem tất cả
            </Link>
          }
        >
          {closestTask && closestStatus && (
            <div
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderLeft: `3px solid ${closestStatus.color}`,
                borderRadius: '10px',
                padding: '12px 14px',
              }}
            >
              <div style={{ fontSize: '0.74rem', color: closestStatus.color, fontWeight: 600, marginBottom: '4px' }}>
                {closestStatus.isOverdue ? 'Trễ hạn' : closestStatus.isWarning ? 'Sắp đến hạn' : 'Việc gần nhất'}
              </div>
              <div style={{ fontWeight: 600 }}>{closestTask.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {formatDateTimeRange(closestTask.startTime, closestTask.deadline)} · {closestStatus.badgeText}
              </div>
            </div>
          )}

          <InteractiveTasks tasks={coreTasks} />

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: 'auto' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Thói quen cần tránh hôm nay</div>
            <div style={{ fontSize: '0.9rem' }}>{antiHabit}</div>
          </div>

          <InfoDietLog />
        </Section>

        <Section title="Tập trung">
          <DashboardDeepWorkTimer totalMinutesToday={totalDeepWorkMinutesToday} />
        </Section>

        <Section title="Ghi nhanh chỉ số">
          <QuickStatsForms />
          <HydrationTracker initialWaterDrops={waterDrops} />
          <FastingWidget fastingStartStr={fastingStartStr} />
        </Section>
      </div>

      <QuickActionForms />

      <ExcelImportHub />
    </div>
  );
}
