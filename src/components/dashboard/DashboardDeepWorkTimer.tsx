'use client';

import { useState, useEffect, useTransition } from 'react';
import { Play, Square, CheckCircle } from 'lucide-react';
import { quickAddDeepWork } from '@/app/dashboard-actions';

export default function DashboardDeepWorkTimer() {
  const [mode, setMode] = useState<'pomodoro' | 'deepwork' | 'hyperfocus'>('pomodoro');
  const [deepWorkEnd, setDeepWorkEnd] = useState<number | null>(null);
  const [deepWorkMins, setDeepWorkMins] = useState<number>(25);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [isPending, startTransition] = useTransition();

  const durationMap = {
    pomodoro: 25,
    deepwork: 60,
    hyperfocus: 90,
  };

  useEffect(() => {
    const storedEnd = localStorage.getItem('dash_dw_end');
    const storedMins = localStorage.getItem('dash_dw_mins');
    const storedMode = localStorage.getItem('dash_dw_mode') as 'pomodoro' | 'deepwork' | 'hyperfocus';
    
    if (storedMode) setMode(storedMode);
    
    if (storedEnd) {
      const end = parseInt(storedEnd);
      if (end > Date.now()) {
        setDeepWorkEnd(end);
        setDeepWorkMins(storedMins ? parseInt(storedMins) : 25);
      } else {
        // Countdown finished while away
        setDeepWorkEnd(null);
        setDeepWorkMins(storedMins ? parseInt(storedMins) : 25);
        setTimeLeft(0);
        setIsFinished(true);
        localStorage.removeItem('dash_dw_end');
      }
    } else {
      setTimeLeft(durationMap[storedMode || 'pomodoro'] * 60);
    }
  }, []);

  useEffect(() => {
    if (!deepWorkEnd) return;
    
    const tick = () => {
      const remaining = Math.max(0, Math.floor((deepWorkEnd - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        setDeepWorkEnd(null);
        setIsFinished(true);
        localStorage.removeItem('dash_dw_end');
      }
    };
    
    tick(); // immediate tick
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deepWorkEnd]);

  const handleModeChange = (newMode: 'pomodoro' | 'deepwork' | 'hyperfocus') => {
    if (deepWorkEnd) return; // Cannot change while running
    setMode(newMode);
    setTimeLeft(durationMap[newMode] * 60);
    setIsFinished(false);
    localStorage.setItem('dash_dw_mode', newMode);
  };

  const startTimer = () => {
    const mins = durationMap[mode];
    const end = Date.now() + mins * 60 * 1000;
    setDeepWorkEnd(end);
    setDeepWorkMins(mins);
    setIsFinished(false);
    localStorage.setItem('dash_dw_end', end.toString());
    localStorage.setItem('dash_dw_mins', mins.toString());
  };

  const stopTimer = () => {
    setDeepWorkEnd(null);
    setIsFinished(false);
    setTimeLeft(durationMap[mode] * 60);
    localStorage.removeItem('dash_dw_end');
    localStorage.removeItem('dash_dw_mins');
  };

  const submitSession = () => {
    startTransition(async () => {
      await quickAddDeepWork(deepWorkMins);
      setIsFinished(false);
      setTimeLeft(durationMap[mode] * 60);
      localStorage.removeItem('dash_dw_end');
      localStorage.removeItem('dash_dw_mins');
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const totalDuration = (deepWorkEnd ? deepWorkMins : durationMap[mode]) * 60;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  const isActive = deepWorkEnd !== null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
      
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '12px', gap: '6px', width: '100%' }}>
        {(['pomodoro', 'deepwork', 'hyperfocus'] as const).map(m => (
          <button 
            key={m}
            onClick={() => handleModeChange(m)} 
            disabled={isActive}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: mode === m ? 'rgba(16,185,129,0.2)' : 'transparent', color: mode === m ? '#34d399' : '#64748b', cursor: isActive ? 'not-allowed' : 'pointer', fontWeight: mode === m ? 700 : 500, fontSize: '0.85rem', textTransform: 'capitalize', transition: 'all 0.2s', opacity: isActive && mode !== m ? 0.5 : 1 }}
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

      <div style={{ display: 'flex', gap: '16px', minHeight: '64px' }}>
        {!isFinished ? (
          <>
            {!isActive ? (
              <button 
                onClick={startTimer} 
                style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: `2px solid #10b981`, color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <Play size={28} style={{ marginLeft: '4px' }} />
              </button>
            ) : (
              <button 
                onClick={stopTimer} 
                style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Square size={24} />
              </button>
            )}
          </>
        ) : (
          <button onClick={submitSession} disabled={isPending} style={{ background: '#10b981', color: '#0f172a', fontWeight: 700, padding: '12px 24px', borderRadius: '12px', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            {isPending ? 'Đang lưu...' : <><CheckCircle size={20} /> Lưu (+{deepWorkMins}m)</>}
          </button>
        )}
      </div>

    </div>
  );
}
