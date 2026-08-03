import { prisma } from '@/lib/prisma';
import { hydrate, quickLog, triggerSOS } from './dashboard-actions';
import { CheckCircle, Circle, Droplet, Flame, ArrowRight, ShieldAlert, Zap, Clock, PieChart as PieChartIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));

  const now2 = new Date(); // Using a separate date instance for startOfWeek
  const startOfWeek = new Date(now2);
  startOfWeek.setDate(now2.getDate() - now2.getDay()); // Sunday

  // Optimize using Promise.all
  const [todayMoodLog, tasks, weeklyExpenses, todayNutrition] = await Promise.all([
    // 1. Lấy dữ liệu Nước uống (Hydration)
    prisma.moodLog.findFirst({
      where: { date: { gte: startOfDay } }
    }),
    // 2. Lấy dữ liệu Deadline Countdown & Daily Draft
    prisma.task.findMany({ 
      where: { status: { not: 'DONE' } },
      orderBy: { deadline: 'asc' },
      take: 3
    }),
    // 3. Lấy dữ liệu Quỹ đi chợ tuần (Từ FinancialTransaction)
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
    })
  ]);

  const waterDrops = todayMoodLog?.hydration || 0;

  const coreTasks = tasks.slice(0, 3); // Lấy 3 task quan trọng nhất
  const closestDeadlineTask = tasks.length > 0 ? tasks[0] : null;
  
  const spent = weeklyExpenses._sum.amount || 0;
  const budget = 400000; // 400k VNĐ
  const budgetPercent = Math.min((spent / budget) * 100, 100);
  const budgetColor = spent > 350000 ? '#ef4444' : spent > 250000 ? '#f59e0b' : '#10b981';

  const calConsumed = todayNutrition?.calories || 0;
  const calGoal = 1500;
  const donutDasharray = `${(calConsumed / calGoal) * 100} 100`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* KHU VỰC 1: VIBE & ĐỘNG LỰC */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', overflow: 'hidden', position: 'relative', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
          <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80" alt="Motivation" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, position: 'absolute' }} />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '24px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', margin: '0 0 8px 0', color: '#fff', fontWeight: 800, letterSpacing: '1px' }}>Target: 48kg</h2>
            <p style={{ margin: 0, fontStyle: 'italic', color: '#cbd5e1', fontSize: '1rem' }}>"Discipline equals freedom."</p>
          </div>
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '0', overflow: 'hidden', height: '220px' }}>
          <iframe style={{ width: '100%', height: '100%', border: 'none' }} src="https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4Zsnsnj?utm_source=generator&theme=0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* KHU VỰC 2: TRUNG TÂM TÁC CHIẾN */}
        <section style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} color="#3b82f6" /> Trung Tâm Tác Chiến
          </h3>
          
          {closestDeadlineTask && (
            <div style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(245,158,11,0.05))', border: '1px solid rgba(239,68,68,0.2)', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Clock size={32} color="#ef4444" />
              <div>
                <div style={{ fontSize: '0.85rem', color: '#fca5a5', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px' }}>Deadline Countdown</div>
                <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>{closestDeadlineTask.title}</div>
                <div style={{ fontSize: '0.85rem', color: '#ef4444', marginTop: '4px' }}>
                  Còn {Math.ceil((new Date(closestDeadlineTask.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} ngày
                </div>
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Daily Draft (Top {coreTasks.length})
            </h4>
            
            {coreTasks.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '0.9rem', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>Chưa có task nào cho hôm nay!</div>
            ) : (
              coreTasks.map(task => {
                const daysLeft = Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysLeft <= 2;
                return (
                  <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', borderLeft: `4px solid ${isUrgent ? '#ef4444' : '#3b82f6'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Circle size={16} color={isUrgent ? '#ef4444' : '#3b82f6'} />
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{task.title}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: isUrgent ? '#ef4444' : '#64748b', background: isUrgent ? 'rgba(239,68,68,0.1)' : 'transparent', padding: '2px 8px', borderRadius: '8px' }}>
                      {daysLeft} days left
                    </span>
                  </div>
                );
              })
            )}
            
            <div style={{ marginTop: '8px', padding: '16px', background: 'rgba(239,68,68,0.05)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <ShieldAlert size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#ef4444', fontWeight: 600 }}>Anti-Habit Today</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#fca5a5' }}>Không lướt TikTok sau 23:00.</p>
              </div>
            </div>
          </div>
        </section>

        {/* KHU VỰC 3: CHỈ SỐ SINH TỒN */}
        <section style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={20} color="#10b981" /> Chỉ Số Sinh Tồn
          </h3>
          
          {/* Calo Donut & Budget */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ width: '90px', height: '90px', position: 'relative', flexShrink: 0 }}>
              <svg width="100%" height="100%" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray={donutDasharray} strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{calConsumed}</span>
                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>/ {calGoal} kcal</span>
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                <span>Quỹ Đi Chợ (Tuần)</span>
                <span style={{ color: budgetColor }}>{(spent / 1000).toFixed(0)}k / {(budget / 1000).toFixed(0)}k</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${budgetPercent}%`, height: '100%', background: budgetColor, transition: 'width 0.3s ease-in-out' }}></div>
              </div>
            </div>
          </div>

          {/* Water Drops */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Droplet size={16} color="#38bdf8" /> Hydration Tracker
            </h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ width: '28px', height: '36px', borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: i < waterDrops ? 'linear-gradient(180deg, #38bdf8, #2563eb)' : 'rgba(255,255,255,0.05)', border: i >= waterDrops ? '1px dashed rgba(255,255,255,0.1)' : 'none', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                </div>
              ))}
              <form action={async () => { 'use server'; await hydrate(new Date().toISOString()); }}>
                <button type="submit" style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '8px', transition: 'all 0.2s' }}>+</button>
              </form>
            </div>
          </div>
        </section>
      </div>

      {/* KHU VỰC 4: LOG NHANH */}
      <section style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center' }}>
          <form action={quickLog} style={{ display: 'flex', width: '100%', gap: '12px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input name="content" placeholder="Gõ / để dùng lệnh hoặc nhập nhật ký nhanh (Brain Dump)..." required style={{ width: '100%', padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '1rem', outline: 'none' }} />
              <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px' }}>↵ Enter</div>
            </div>
            
            <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
              <ArrowRight size={20} /> Log
            </button>
          </form>
          
          <form action={triggerSOS} style={{ marginLeft: '12px' }}>
             <button type="submit" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '16px 24px', borderRadius: '14px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
               <ShieldAlert size={20} /> SOS
             </button>
          </form>
        </div>
      </section>

    </div>
  );
}
