import { prisma } from '@/lib/prisma';
import { Flame, ShieldAlert, Zap, Clock, BrainCircuit } from 'lucide-react';
import QuickActionForms from '@/components/dashboard/QuickActionForms';
import HydrationTracker from '@/components/dashboard/HydrationTracker';
import InteractiveTasks from '@/components/dashboard/InteractiveTasks';
import QuickStatsForms from '@/components/dashboard/QuickStatsForms';
import FastingWidget from '@/components/dashboard/FastingWidget';
import InfoDietLog from '@/components/dashboard/InfoDietLog';
import DashboardDeepWorkTimer from '@/components/dashboard/DashboardDeepWorkTimer';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));

  const now2 = new Date(); // Using a separate date instance for startOfWeek
  const startOfWeek = new Date(now2);
  startOfWeek.setDate(now2.getDate() - now2.getDay()); // Sunday

  // Optimize using Promise.all
  const [todayMoodLog, tasks, weeklyExpenses, todayNutrition, settings, activeDetox, dueFlashcardsCount] = await Promise.all([
    // 1. Lấy dữ liệu Nước uống (Hydration)
    prisma.moodLog.findFirst({
      where: { date: { gte: startOfDay } }
    }),
    // 2. Lấy dữ liệu Deadline Countdown & Daily Draft
    prisma.task.findMany({ 
      orderBy: { deadline: 'asc' },
      take: 10 // Fetch a bit more so we can filter DONE/TODO properly in Client
    }),
    // 3. Lấy dữ liệu Quỹ đi chợ tuần
    prisma.financialTransaction.aggregate({
      where: { 
        createdAt: { gte: startOfWeek },
        type: 'expense'
      },
      _sum: { amount: true }
    }),
    // 4. Lấy dữ liệu Macro & Calo
    prisma.nutritionLog.findFirst({
      where: { date: { gte: startOfDay } }
    }),
    // 5. Settings
    prisma.userSettings.findUnique({ where: { id: 'default' } }),
    // 6. Active Detox Session
    prisma.detoxSession.findFirst({
      where: { endDate: null }, // Đang active
      orderBy: { startDate: 'desc' }
    }),
    // 7. Flashcards due for review
    prisma.flashcard.count({
      where: { nextReview: { lte: new Date() } }
    })
  ]);

  const targetGoal = settings?.bodyRecompGoal || "Target: 48kg (Skinny Fat -> Fit)";
  const antiHabit = activeDetox?.notes || "Không lướt TikTok / Short Video sau 23:00";
  const fastingStartStr = settings?.fastingStart ? settings.fastingStart.toISOString() : null;

  const waterDrops = todayMoodLog?.hydration || 0;

  // Filter tasks: show up to 3 TODO tasks, and any recently DONE tasks
  const coreTasks = tasks.filter(t => t.status !== 'DONE').slice(0, 3); 
  const closestDeadlineTask = coreTasks.length > 0 ? coreTasks[0] : null;
  
  const spent = weeklyExpenses._sum.amount || 0;
  const budget = settings?.budgetGoal || 400000;
  const budgetPercent = Math.min((spent / budget) * 100, 100);
  const budgetColor = spent > (budget * 0.8) ? '#ef4444' : spent > (budget * 0.6) ? '#f59e0b' : '#10b981';

  const calConsumed = todayNutrition?.calories || 0;
  const calGoal = settings?.goalCal || 1500;
  const donutDasharray = `${(calConsumed / calGoal) * 100} 100`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '32px' }}>
      
      {/* FLASHCARD ALERT */}
      {dueFlashcardsCount > 0 && (
        <a href="/career" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(90deg, #ef4444, #f43f5e)', padding: '16px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(239,68,68,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BrainCircuit color="#fff" size={24} />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>Cảnh báo Spaced Repetition!</span>
            </div>
            <span style={{ color: '#fff', fontWeight: 600, background: 'rgba(0,0,0,0.2)', padding: '6px 16px', borderRadius: '20px' }}>
              Bạn có {dueFlashcardsCount} thẻ cần ôn tập ngay. Bấm vào đây!
            </span>
          </div>
        </a>
      )}

      {/* KHU VỰC 1: VIBE & ĐỘNG LỰC */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', overflow: 'hidden', position: 'relative', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at top right, rgba(59,130,246,0.15), transparent 60%)' }}></div>
          <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=80" alt="Motivation" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35, position: 'absolute', mixBlendMode: 'overlay' }} />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '32px', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', margin: '0 0 12px 0', color: '#fff', fontWeight: 800, letterSpacing: '1px', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{targetGoal}</h2>
            <p style={{ margin: 0, fontStyle: 'italic', color: '#94a3b8', fontSize: '1.2rem', fontWeight: 500 }}>"Discipline equals freedom."</p>
          </div>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
        
        {/* KHU VỰC 2: TRUNG TÂM TÁC CHIẾN */}
        <section style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <Zap size={22} color="#3b82f6" /> Trung Tâm Tác Chiến
          </h3>
          
          {closestDeadlineTask && (
            <div style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(245,158,11,0.05))', border: '1px solid rgba(239,68,68,0.3)', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: 'inset 0 2px 20px rgba(239,68,68,0.05)' }}>
              <div style={{ background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '50%' }}>
                <Clock size={28} color="#ef4444" />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#fca5a5', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>Deadline Countdown</div>
                <div style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 700, lineHeight: 1.3 }}>{closestDeadlineTask.title}</div>
                <div style={{ fontSize: '0.9rem', color: '#ef4444', marginTop: '6px', fontWeight: 600 }}>
                  Còn {Math.ceil((new Date(closestDeadlineTask.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} ngày
                </div>
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Daily Draft (Top 3)
            </h4>
            
            {/* INTERACTIVE TASKS COMPONENT */}
            <InteractiveTasks tasks={coreTasks} />
            
            <div style={{ marginTop: '8px', padding: '20px', background: 'linear-gradient(135deg, rgba(239,68,68,0.1), transparent)', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <ShieldAlert size={24} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Anti-Habit Today</h4>
                <p style={{ margin: 0, fontSize: '1rem', color: '#fca5a5', lineHeight: 1.4, fontWeight: 500 }}>{antiHabit}</p>
              </div>
            </div>

            {/* INFO DIET LOG */}
            <InfoDietLog />
          </div>
        </section>

        {/* KHU VỰC 3: CHỈ SỐ SINH TỒN */}
        <section style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <Flame size={22} color="#10b981" /> Chỉ Số Sinh Tồn
          </h3>
          
          {/* Calo Donut & Budget */}
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <div style={{ width: '110px', height: '110px', position: 'relative', flexShrink: 0 }}>
              <svg width="100%" height="100%" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.4))' }}>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={donutDasharray} strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{calConsumed}</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>/ {calGoal}</span>
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '1rem', fontWeight: 600, color: '#e2e8f0' }}>
                <span>Quỹ Đi Chợ (Tuần)</span>
                <span style={{ color: budgetColor, fontWeight: 700 }}>{(spent / 1000).toFixed(0)}k / {(budget / 1000).toFixed(0)}k</span>
              </div>
              <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}>
                <div style={{ width: `${budgetPercent}%`, height: '100%', background: budgetColor, transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 0 10px ' + budgetColor }}></div>
              </div>
            </div>
          </div>

          {/* INTERACTIVE QUICK FORMS (Calo & Budget) */}
          <QuickStatsForms />

          {/* DEEP WORK TIMER */}
          <DashboardDeepWorkTimer />

          {/* FASTING WIDGET */}
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
