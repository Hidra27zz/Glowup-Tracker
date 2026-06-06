'use client';

import { useState, useEffect } from 'react';
import { Shield, Play, Square, CheckCircle, XCircle } from 'lucide-react';
import { DetoxSession } from '@prisma/client';
import { startDetoxSession, endDetoxSession } from '@/app/mental/actions';

interface Props {
  activeSession: DetoxSession | null;
  history: DetoxSession[];
}

export default function DopamineDetox({ activeSession, history }: Props) {
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState<string>('00:00:00');

  useEffect(() => {
    if (!activeSession) return;
    const start = new Date(activeSession.startDate).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = now - start;
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setElapsed(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const handleStart = async () => {
    setLoading(true);
    await startDetoxSession();
    setLoading(false);
  };

  const handleEnd = async (success: boolean) => {
    const notes = prompt(success ? 'Chúc mừng! Cảm giác của bạn lúc này thế nào?' : 'Điều gì đã làm bạn bỏ cuộc? Ghi lại để khắc phục nhé:');
    setLoading(true);
    await endDetoxSession(activeSession!.id, success, notes || undefined);
    setLoading(false);
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', color: '#fff' }}>
        <div style={{ background: 'rgba(245,158,11,0.15)', padding: '8px', borderRadius: '10px' }}>
          <Shield size={22} color="#f59e0b" />
        </div>
        Dopamine Detox Mode
      </h3>
      <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>
        Cách ly khỏi mạng xã hội, giải trí ngắn hạn và thức ăn nhanh để "reset" hệ thống phần thưởng của não bộ.
      </p>

      {activeSession ? (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', animation: 'pulse 2s infinite' }}>
          <div style={{ fontSize: '0.9rem', color: '#fcd34d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Đang trong quá trình Detox</div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'monospace' }}>
            {elapsed}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => handleEnd(true)} disabled={loading} style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '10px 20px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} /> Hoàn thành tốt
            </button>
            <button onClick={() => handleEnd(false)} disabled={loading} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '10px 20px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XCircle size={18} /> Bỏ cuộc sớm
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <button onClick={handleStart} disabled={loading} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: '100px', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px rgba(245,158,11,0.3)', transition: 'transform 0.2s' }}>
            <Play size={20} fill="currentColor" /> Bắt đầu Detox ngay
          </button>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#cbd5e1', fontSize: '0.9rem' }}>Lịch sử Detox gần đây</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.slice(0, 3).map(h => {
              const diffHours = h.endDate ? (new Date(h.endDate).getTime() - new Date(h.startDate).getTime()) / (1000 * 60 * 60) : 0;
              return (
                <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '10px', borderLeft: `3px solid ${h.success ? '#10b981' : '#ef4444'}` }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{new Date(h.startDate).toLocaleDateString()}</div>
                    {h.notes && <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>{h.notes}</div>}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: h.success ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                    {diffHours.toFixed(1)}h {h.success ? 'Thành công' : 'Thất bại'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
