'use client';

import { useState, useEffect } from 'react';
import { Timer, Utensils, Play, Square } from 'lucide-react';
import { updateUserSettings } from '@/lib/actions/health.actions';

interface Props {
  fastingStart?: Date | null;
}

export default function FastingTimer({ fastingStart }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const FASTING_GOAL_HOURS = 16;
  const goalMs = FASTING_GOAL_HOURS * 60 * 60 * 1000;

  useEffect(() => {
    if (!fastingStart) {
      setElapsed(0);
      return;
    }
    
    const start = new Date(fastingStart).getTime();
    
    const interval = setInterval(() => {
      setElapsed(new Date().getTime() - start);
    }, 1000);
    
    // Initial calc
    setElapsed(new Date().getTime() - start);
    
    return () => clearInterval(interval);
  }, [fastingStart]);

  const toggleFasting = async () => {
    setLoading(true);
    if (fastingStart) {
      await updateUserSettings({ fastingStart: null });
    } else {
      await updateUserSettings({ fastingStart: new Date() });
    }
    setLoading(false);
  };

  const progress = Math.min(100, (elapsed / goalMs) * 100);
  
  const formatTime = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const remaining = Math.max(0, goalMs - elapsed);
  const isFasting = !!fastingStart;

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Timer size={20} color="#8b5cf6" /> Intermittent Fasting
        </h3>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>16:8 Protocol</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '10px 0' }}>
        {/* Simple SVG Circular Progress */}
        <div style={{ position: 'relative', width: '150px', height: '150px' }}>
          <svg width="150" height="150" viewBox="0 0 150 150">
            {/* Background circle */}
            <circle 
              cx="75" cy="75" r="65" 
              fill="none" 
              stroke="rgba(255,255,255,0.1)" 
              strokeWidth="10" 
            />
            {/* Progress circle */}
            <circle 
              cx="75" cy="75" r="65" 
              fill="none" 
              stroke={progress >= 100 ? "var(--success-color)" : "#8b5cf6"} 
              strokeWidth="10" 
              strokeDasharray={408.4} // 2 * pi * r
              strokeDashoffset={408.4 - (408.4 * progress) / 100}
              strokeLinecap="round"
              transform="rotate(-90 75 75)"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {isFasting ? (
              <>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'monospace' }}>
                  {formatTime(elapsed)}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {progress >= 100 ? 'Mục tiêu đạt!' : `Còn lại ${formatTime(remaining)}`}
                </span>
              </>
            ) : (
              <>
                <Utensils size={24} color="var(--text-secondary)" style={{ marginBottom: '4px' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Đang ăn</span>
              </>
            )}
          </div>
        </div>
      </div>

      <button 
        onClick={toggleFasting}
        disabled={loading}
        className="btn"
        style={{ 
          background: isFasting ? 'transparent' : '#8b5cf6', 
          border: isFasting ? '1px solid #8b5cf6' : 'none',
          color: isFasting ? '#8b5cf6' : '#fff',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Đang xử lý...' : isFasting ? <><Square size={16} /> Kết thúc Fasting</> : <><Play size={16} /> Bắt đầu Fasting</>}
      </button>
    </div>
  );
}
