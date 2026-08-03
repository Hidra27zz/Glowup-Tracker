'use client';

import { useState, useEffect, useTransition } from 'react';
import { toggleFasting } from '@/app/dashboard-actions';
import { UtensilsCrossed, Check } from 'lucide-react';

export default function FastingWidget({ fastingStartStr }: { fastingStartStr: string | null }) {
  const [isPending, startTransition] = useTransition();
  const [elapsedString, setElapsedString] = useState('00:00:00');
  const [progressPercent, setProgressPercent] = useState(0);
  const [toastMsg, setToastMsg] = useState('');

  const FASTING_GOAL_MS = 16 * 60 * 60 * 1000;

  useEffect(() => {
    if (!fastingStartStr) return;

    const start = new Date(fastingStartStr).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = now - start;
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      setElapsedString(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      
      let percent = (diff / FASTING_GOAL_MS) * 100;
      if (percent > 100) percent = 100;
      setProgressPercent(percent);

    }, 1000);

    return () => clearInterval(interval);
  }, [fastingStartStr]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleToggle = () => {
    startTransition(async () => {
      await toggleFasting();
      showToast(fastingStartStr ? 'Đã kết thúc nhịn ăn!' : 'Bắt đầu nhịn ăn 16:8!');
    });
  };

  return (
    <div style={{ position: 'relative', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {toastMsg && (
        <div style={{ position: 'absolute', top: '-40px', right: 0, background: 'rgba(16,185,129,0.95)', color: '#fff', padding: '6px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', zIndex: 10 }}>
          <Check size={14} /> {toastMsg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UtensilsCrossed size={18} color="#f43f5e" /> Fasting 16:8
        </h4>
        <button 
          onClick={handleToggle} 
          disabled={isPending}
          style={{ 
            background: fastingStartStr ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', 
            color: fastingStartStr ? '#ef4444' : '#10b981', 
            border: `1px solid ${fastingStartStr ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
            padding: '6px 16px', 
            borderRadius: '12px', 
            cursor: isPending ? 'wait' : 'pointer', 
            fontWeight: 600, 
            fontSize: '0.85rem',
            transition: 'all 0.2s'
          }}>
          {fastingStartStr ? 'Kết thúc' : 'Bắt đầu'}
        </button>
      </div>

      {fastingStartStr ? (
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: '12px', fontVariantNumeric: 'tabular-nums' }}>
            {elapsedString}
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #f43f5e, #fb923c)', transition: 'width 1s linear' }}></div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', padding: '12px 0' }}>
          Bạn chưa bắt đầu chu kỳ nhịn ăn. Bấm "Bắt đầu" để đếm ngược 16 tiếng.
        </div>
      )}
    </div>
  );
}
