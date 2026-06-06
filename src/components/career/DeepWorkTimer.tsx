'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Square, CheckCircle, BrainCircuit, History, Zap, Timer, Focus } from 'lucide-react';
import { logDeepWork } from '@/app/career/actions';
import { DeepWorkSession } from '@prisma/client';

interface Props {
  recentSessions: DeepWorkSession[];
}

export default function DeepWorkTimer({ recentSessions }: Props) {
  const [mode, setMode] = useState<'pomodoro' | 'deepwork' | 'hyperfocus'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [taskName, setTaskName] = useState('');
  
  const [isFinished, setIsFinished] = useState(false);
  const [flowState, setFlowState] = useState(3);
  const [loading, setLoading] = useState(false);

  const durationMap = {
    pomodoro: 25 * 60,
    deepwork: 60 * 60,
    hyperfocus: 90 * 60,
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((time) => time - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      setIsFinished(true);
      if (interval) clearInterval(interval);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, timeLeft]);

  const handleModeChange = (newMode: 'pomodoro' | 'deepwork' | 'hyperfocus') => {
    setMode(newMode);
    setTimeLeft(durationMap[newMode]);
    setIsActive(false);
    setIsFinished(false);
  };

  const submitSession = async () => {
    setLoading(true);
    const durationMins = durationMap[mode] / 60;
    await logDeepWork(durationMins, taskName || 'Focused Work', flowState);
    
    setIsFinished(false);
    setTaskName('');
    setTimeLeft(durationMap[mode]);
    setFlowState(3);
    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = ((durationMap[mode] - timeLeft) / durationMap[mode]) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(52,211,153,0.15))', padding: '14px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)' }}>
          <BrainCircuit size={26} color="#10b981" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Deep Work Protocol</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Vào trạng thái dòng chảy, tối đa hóa hiệu suất</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Left: Timer Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
          
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '12px', gap: '6px', width: '100%' }}>
            {(['pomodoro', 'deepwork', 'hyperfocus'] as const).map(m => (
              <button 
                key={m}
                onClick={() => handleModeChange(m)} 
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: mode === m ? 'rgba(16,185,129,0.2)' : 'transparent', color: mode === m ? '#34d399' : '#64748b', cursor: 'pointer', fontWeight: mode === m ? 700 : 500, fontSize: '0.85rem', textTransform: 'capitalize', transition: 'all 0.2s' }}
              >
                {m}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '240px', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="240" height="240" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
              <circle cx="120" cy="120" r={radius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
              <circle
                cx="120" cy="120" r={radius} fill="transparent" stroke={isFinished ? '#10b981' : '#34d399'} strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div style={{ textAlign: 'center', zIndex: 1 }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, color: isFinished ? '#10b981' : '#fff', letterSpacing: '2px', fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(timeLeft)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginTop: '4px' }}>
                {isFinished ? 'Hoàn thành' : isActive ? 'Đang tập trung' : 'Sẵn sàng'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            {!isFinished && (
              <>
                <button 
                  onClick={() => setIsActive(!isActive)} 
                  style={{ width: '64px', height: '64px', borderRadius: '50%', background: isActive ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `2px solid ${isActive ? '#ef4444' : '#10b981'}`, color: isActive ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {isActive ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: '4px' }} />}
                </button>
                <button 
                  onClick={() => { setIsActive(false); setTimeLeft(durationMap[mode]); }} 
                  disabled={timeLeft === durationMap[mode]}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: timeLeft === durationMap[mode] ? 'not-allowed' : 'pointer', opacity: timeLeft === durationMap[mode] ? 0.5 : 1 }}
                >
                  <Square size={24} />
                </button>
              </>
            )}
          </div>

          {isFinished && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.5s ease-out', background: 'rgba(16,185,129,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, fontSize: '0.9rem', justifyContent: 'center' }}>
                <CheckCircle size={18} /> Phiên làm việc hoàn tất!
              </div>
              <input 
                value={taskName}
                onChange={e => setTaskName(e.target.value)}
                placeholder="Bạn vừa hoàn thành việc gì?" 
                style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', fontSize: '0.9rem' }} 
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Mức độ Flow State</span>
                  <span style={{ color: '#10b981' }}>{flowState} / 5</span>
                </label>
                <input type="range" min="1" max="5" value={flowState} onChange={e => setFlowState(parseInt(e.target.value))} style={{ accentColor: '#10b981' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>Phân tâm</span>
                  <span>Flow hoàn hảo</span>
                </div>
              </div>
              <button onClick={submitSession} disabled={loading} style={{ background: '#10b981', color: '#0f172a', fontWeight: 700, padding: '12px', borderRadius: '10px', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                {loading ? 'Đang lưu...' : 'Lưu Nhật ký'}
              </button>
            </div>
          )}
        </div>

        {/* Right: History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="#10b981" /> Lịch sử Tập trung
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentSessions.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '40px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                Chưa có phiên làm việc nào. Bắt đầu ngay!
              </div>
            ) : (
              recentSessions.map(session => (
                <div key={session.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', borderLeft: `4px solid ${session.flowState && session.flowState >= 4 ? '#10b981' : '#38bdf8'}` }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>{session.taskName || 'Focused Work'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Timer size={12} /> {session.duration} phút</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Focus size={12} /> Flow: {session.flowState}/5</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    {new Date(session.date).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
