import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Flame, ShieldAlert, Zap, Clock, BrainCircuit, AlertTriangle, FileWarning } from 'lucide-react';
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
import { getTaskTimeStatus, formatDateTimeRange } from '@/lib/utils/timeFormat';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const now2 = new Date();
  const startOfWeek = new Date(now2);
  startOfWeek.setDate(now2.getDate() - now2.getDay());

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
    prisma.moodLog.findFirst({
      where: { date: { gte: startOfDay } },
    }),
    prisma.task.findMany({
      orderBy: { deadline: 'asc' },
      take: 30,
    }),
    prisma.financialTransaction.aggregate({
      where: {
        createdAt: { gte: startOfWeek },
        type: 'expense',
      },
      _sum: { amount: true },
    }),
    prisma.nutritionLog.findFirst({
      where: { date: { gte: startOfDay } },
    }),
    prisma.userSettings.findUnique({ where: { id: 'default' } }),
    prisma.detoxSession.findFirst({
      where: { endDate: null },
      orderBy: { startDate: 'desc' },
    }),
    prisma.flashcard.count({
      where: { nextReview: { lte: new Date() } },
    }),
    prisma.smartGoal.findMany({
      orderBy: { deadline: 'asc' },
    }),
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
  const targetGoal = primarySmartGoal
    ? `[SMART] ${primarySmartGoal.title} (${primarySmartGoal.currentValue}/${primarySmartGoal.targetValue} ${primarySmartGoal.unit})`
    : settings?.bodyRecompGoal || 'Thiết lập Mục Tiêu SMART của bạn bên dưới';
  const antiHabit = activeDetox?.notes || 'Không lướt TikTok / Short Video sau 23:00';
  const fastingStartStr = settings?.fastingStart ? settings.fastingStart.toISOString() : null;

  const waterDrops = todayMoodLog?.hydration || 0;

  const todoTasks = tasks.filter((t) => t.status !== 'DONE');
  const coreTasks = todoTasks.slice(0, 4);
  const closestDeadlineTask = coreTasks.length > 0 ? coreTasks[0] : null;
  const closestTimeStatus = closestDeadlineTask
    ? getTaskTimeStatus(closestDeadlineTask.startTime, closestDeadlineTask.deadline, closestDeadlineTask.status)
    : null;

  const overdueTasks = todoTasks.filter((t) => getTaskTimeStatus(t.startTime, t.deadline, t.status).isOverdue);
  const warningTasks = todoTasks.filter((t) => getTaskTimeStatus(t.startTime, t.deadline, t.status).isWarning);

  const spent = weeklyExpenses._sum.amount || 0;
  const budget = settings?.budgetGoal || 400000;
  const budgetPercent = Math.min((spent / budget) * 100, 100);
  const budgetColor = spent > budget * 0.8 ? '#ef4444' : spent > budget * 0.6 ? '#f59e0b' : '#10b981';

  const calConsumed = todayNutrition?.calories || 0;
  const calGoal = settings?.goalCal || 1500;
  const donutDasharray = `${Math.min((calConsumed / calGoal) * 100, 100)} 100`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>
      {/* TRỢ LÝ AI TỰ ĐỘNG TÍNH TOÁN & GHI NHẬN 1-CHẠM (KHÔNG CẦN NHẬP LIỆU RỜI RẠC) */}
      <SmartAICommandBar />

      {/* FLASHCARD ALERT */}
      {dueFlashcardsCount > 0 && (
        <Link href="/career" style={{ textDecoration: 'none' }}>
          <div
            style={{
              background: 'linear-gradient(90deg, #ef4444, #f43f5e)',
              padding: '14px 22px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 10px 30px rgba(239,68,68,0.3)',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BrainCircuit color="#fff" size={22} />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>Cảnh báo Spaced Repetition!</span>
            </div>
            <span
              style={{
                color: '#fff',
                fontWeight: 600,
                background: 'rgba(0,0,0,0.2)',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.88rem',
              }}
            >
              Bạn có {dueFlashcardsCount} thẻ cần ôn tập ngay →
            </span>
          </div>
        </Link>
      )}

      {/* BÁO CÁO TRỄ HẠN & CẢNH BÁO SẮP TỚI TRÊN DASHBOARD */}
      {(overdueTasks.length > 0 || warningTasks.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {overdueTasks.length > 0 && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.18), rgba(15,23,42,0.92))',
                border: '1px solid rgba(239,68,68,0.45)',
                borderRadius: '20px',
                padding: '18px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: 800, fontSize: '1rem' }}>
                  <FileWarning size={20} /> BÁO CÁO TRỄ HẠN ({overdueTasks.length} mục)
                </div>
                <Link href="/tasks" style={{ fontSize: '0.78rem', color: '#fca5a5', fontWeight: 700, textDecoration: 'underline' }}>
                  Giải trình & Xử lý →
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {overdueTasks.slice(0, 3).map((t) => {
                  const st = getTaskTimeStatus(t.startTime, t.deadline, t.status);
                  return (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(0,0,0,0.3)',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                      }}
                    >
                      <span style={{ color: '#fff', fontWeight: 600 }}>{t.title}</span>
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>Quá hạn {st.overdueDurationText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {warningTasks.length > 0 && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(15,23,42,0.92))',
                border: '1px solid rgba(245,158,11,0.45)',
                borderRadius: '20px',
                padding: '18px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontWeight: 800, fontSize: '1rem' }}>
                  <AlertTriangle size={20} /> CẢNH BÁO SẮP TỚI ({warningTasks.length} mục)
                </div>
                <Link href="/tasks" style={{ fontSize: '0.78rem', color: '#fde68a', fontWeight: 700, textDecoration: 'underline' }}>
                  Xem lịch →
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {warningTasks.slice(0, 3).map((t) => {
                  const st = getTaskTimeStatus(t.startTime, t.deadline, t.status);
                  return (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(0,0,0,0.3)',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                      }}
                    >
                      <span style={{ color: '#fff', fontWeight: 600 }}>{t.title}</span>
                      <span style={{ color: '#fbbf24', fontWeight: 700 }}>{st.badgeText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* KHU VỰC 1: VIBE & ĐỘNG LỰC */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        <div
          style={{
            background: 'rgba(15,23,42,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '22px',
            overflow: 'hidden',
            position: 'relative',
            minHeight: '150px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 16px 36px rgba(0,0,0,0.35)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at top right, rgba(59,130,246,0.15), transparent 60%)',
            }}
          />
          <img
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=80"
            alt="Motivation"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25, position: 'absolute', mixBlendMode: 'overlay' }}
          />
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              textAlign: 'center',
              padding: '22px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <h2
              style={{
                fontSize: '1.65rem',
                margin: '0 0 6px 0',
                color: '#fff',
                fontWeight: 800,
                letterSpacing: '0.3px',
                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              {targetGoal}
            </h2>
            <p style={{ margin: 0, fontStyle: 'italic', color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500 }}>
              &ldquo;Specific • Measurable • Achievable • Relevant • Time-bound&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* KHU VỰC MỤC TIÊU SMART */}
      <SmartGoalBoard goals={smartGoals} />

      {/* KHU VỰC LỊCH TRÌNH TỔNG HỢP: THỜI KHÓA BIỂU, LỊCH LÀM VIỆC, LỊCH HẸN, SPRINTS */}
      <DashboardScheduleHub tasks={tasks} sprints={sprints} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* KHU VỰC 2: TRUNG TÂM TÁC CHIẾN */}
        <section
          style={{
            background: 'rgba(15,23,42,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          }}
        >
          <h3
            style={{
              margin: 0,
              color: '#fff',
              fontSize: '1.15rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            <Zap size={20} color="#3b82f6" /> Trung Tâm Tác Chiến
          </h3>

          {closestDeadlineTask && closestTimeStatus && (
            <div
              style={{
                background: `linear-gradient(135deg, ${closestTimeStatus.bgColor}, rgba(15,23,42,0.6))`,
                border: `1px solid ${closestTimeStatus.borderColor}`,
                padding: '16px',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div style={{ background: closestTimeStatus.bgColor, padding: '10px', borderRadius: '50%' }}>
                <Clock size={24} color={closestTimeStatus.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '0.76rem',
                    color: closestTimeStatus.color,
                    textTransform: 'uppercase',
                    fontWeight: 800,
                    letterSpacing: '0.8px',
                    marginBottom: '4px',
                  }}
                >
                  {closestTimeStatus.isOverdue
                    ? '🚨 Báo Cáo Trễ Hạn Ưu Tiên'
                    : closestTimeStatus.isWarning
                    ? '⚠️ Cảnh Báo Sắp Đến Hạn'
                    : 'Tiến Độ Gần Nhất'}
                </div>
                <div style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 700, lineHeight: 1.3 }}>
                  {closestDeadlineTask.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px' }}>
                  Khung giờ: {formatDateTimeRange(closestDeadlineTask.startTime, closestDeadlineTask.deadline)}
                </div>
                <div style={{ fontSize: '0.84rem', color: closestTimeStatus.color, marginTop: '4px', fontWeight: 700 }}>
                  {closestTimeStatus.badgeText}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ margin: '0 0 2px 0', fontSize: '0.9rem', color: '#94a3b8' }}>Danh sách tác chiến nhanh</h4>
            <InteractiveTasks tasks={coreTasks} />

            <div
              style={{
                marginTop: '6px',
                padding: '14px',
                background: 'linear-gradient(135deg, rgba(239,68,68,0.1), transparent)',
                borderRadius: '14px',
                border: '1px solid rgba(239,68,68,0.3)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              <ShieldAlert size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.82rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase' }}>
                  Anti-Habit Today
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#fca5a5', lineHeight: 1.4, fontWeight: 500 }}>{antiHabit}</p>
              </div>
            </div>

            <InfoDietLog />
          </div>
        </section>

        {/* KHU VỰC 3: CHỈ SỐ SINH TỒN & DEEP WORK ĐỒNG BỘ */}
        <section
          style={{
            background: 'rgba(15,23,42,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          }}
        >
          <h3
            style={{
              margin: 0,
              color: '#fff',
              fontSize: '1.15rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            <Flame size={20} color="#10b981" /> Chỉ Số Sinh Tồn & Deep Work
          </h3>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ width: '100px', height: '100px', position: 'relative', flexShrink: 0 }}>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 36 36"
                style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.4))' }}
              >
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray={donutDasharray}
                  strokeLinecap="round"
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>{calConsumed}</span>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>/ {calGoal}</span>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#e2e8f0',
                }}
              >
                <span>Ngân Sách Tuần</span>
                <span style={{ color: budgetColor, fontWeight: 700 }}>
                  {(spent / 1000).toFixed(0)}k / {(budget / 1000).toFixed(0)}k
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${budgetPercent}%`,
                    height: '100%',
                    background: budgetColor,
                    transition: 'width 0.5s ease',
                    boxShadow: '0 0 10px ' + budgetColor,
                  }}
                />
              </div>
            </div>
          </div>

          <QuickStatsForms />
          <DashboardDeepWorkTimer totalMinutesToday={totalDeepWorkMinutesToday} />
          <FastingWidget fastingStartStr={fastingStartStr} />
          <HydrationTracker initialWaterDrops={waterDrops} />
        </section>
      </div>

      {/* KHU VỰC 4: LOG NHANH */}
      <section style={{ display: 'flex' }}>
        <QuickActionForms />
      </section>
    </div>
  );
}
