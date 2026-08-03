'use client';

import { useState, useTransition } from 'react';
import { logInfoDiet } from '@/app/dashboard-actions';
import { Smartphone, BookOpen, Check } from 'lucide-react';

export default function InfoDietLog() {
  const [isPending, startTransition] = useTransition();
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleLog = (type: 'junk' | 'valuable', minutes: number) => {
    startTransition(async () => {
      await logInfoDiet(type, minutes);
      showToast(type === 'junk' ? `Đã log ${minutes}m Junk Time` : `Tuyệt! +${minutes}m Giá trị`);
    });
  };

  return (
    <div style={{ position: 'relative', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {toastMsg && (
        <div style={{ position: 'absolute', top: '-40px', right: 0, background: 'rgba(16,185,129,0.95)', color: '#fff', padding: '6px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', zIndex: 10 }}>
          <Check size={14} /> {toastMsg}
        </div>
      )}

      <h4 style={{ margin: 0, fontSize: '1rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Smartphone size={18} color="#8b5cf6" /> Information Diet
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Junk Time (TikTok, Reels)</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => handleLog('junk', 15)} disabled={isPending} style={{ flex: 1, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '8px', borderRadius: '12px', cursor: isPending ? 'wait' : 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}>+15m</button>
            <button onClick={() => handleLog('junk', 30)} disabled={isPending} style={{ flex: 1, background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '8px', borderRadius: '12px', cursor: isPending ? 'wait' : 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}>+30m</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Valuable Time (Sách, Docs)</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => handleLog('valuable', 15)} disabled={isPending} style={{ flex: 1, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', padding: '8px', borderRadius: '12px', cursor: isPending ? 'wait' : 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}>+15m</button>
            <button onClick={() => handleLog('valuable', 30)} disabled={isPending} style={{ flex: 1, background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '8px', borderRadius: '12px', cursor: isPending ? 'wait' : 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}>+30m</button>
          </div>
        </div>
      </div>
    </div>
  );
}
