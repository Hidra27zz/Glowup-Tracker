'use client';

import React, { useState, useEffect } from 'react';
import { logDeepWorkAction } from '@/app/career/actions';
import {
  getTimerState,
  setTimerState,
  startUnifiedTimer,
  pauseUnifiedTimer,
  resetUnifiedTimer,
  subscribeTimerSync,
  formatTimerMMSS,
  TIMER_MODE_CONFIG,
  TimerMode,
  UnifiedTimerState,
} from '@/lib/utils/timerStore';

export default function DeepWorkTimer({ recentSessions }: { recentSessions: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<UnifiedTimerState>(getTimerState());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    setState(getTimerState());
    return subscribeTimerSync((nextState) => {
      setState(nextState);
    });
  }, []);

  useEffect(() => {
    if (!mounted || !state.isRunning || !state.endTime) return;

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.round((state.endTime! - Date.now()) / 1000));
      if (diff <= 0) {
        clearInterval(interval);
      } else {
        setState((prev) => ({ ...prev, remainingSeconds: diff }));
      }
    }, 500);

    return () => clearInterval(interval);
  }, [mounted, state.isRunning, state.endTime]);

  const activeConfig = TIMER_MODE_CONFIG[state.mode];
  const totalSeconds = state.durationMinutes * 60;
  const elapsedMinutes = Math.max(1, Math.round((totalSeconds - state.remainingSeconds) / 60));

  const handleCompleteAndSave = async () => {
    setIsSaving(true);
    try {
      pauseUnifiedTimer();
      const formData = new FormData();
      formData.append('duration', String(elapsedMinutes));
      formData.append('taskName', state.taskName || `Phiên ${activeConfig.label}`);
      await logDeepWorkAction(formData);
      resetUnifiedTimer();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
      <div className="glass-card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: state.isRunning ? activeConfig.color : 'rgba(255,255,255,0.1)',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>⏱️ Deep Work Protocol (Đồng bộ)</h3>
          <button
            onClick={() => setTimerState({ showMiniPopup: !state.showMiniPopup })}
            style={{
              background: state.showMiniPopup ? 'rgba(244, 109, 117, 0.16)' : 'rgba(123, 140, 255, 0.14)',
              border: `1px solid ${state.showMiniPopup ? 'rgba(244, 109, 117, 0.4)' : 'rgba(123, 140, 255, 0.35)'}`,
              color: state.showMiniPopup ? '#f9a3a8' : 'var(--accent-primary)',
              borderRadius: '8px',
              padding: '5px 10px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {state.showMiniPopup ? 'Tắt Pop-up thu nhỏ' : 'Thu nhỏ thành Pop-up'}
          </button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
          Đồng bộ trực tiếp với Dashboard và cửa sổ Pop-up vuông khi bạn chuyển sang trang khác.
        </p>

        {/* Mode Selector */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '28px' }}>
          {(['pomodoro', 'deepwork', 'hyperfocus'] as TimerMode[]).map((m) => {
            const active = state.mode === m;
            return (
              <button
                key={m}
                onClick={() => resetUnifiedTimer(m)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  background: active ? TIMER_MODE_CONFIG[m].color : 'rgba(255,255,255,0.05)',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                }}
              >
                {TIMER_MODE_CONFIG[m].label} ({TIMER_MODE_CONFIG[m].minutes}p)
              </button>
            );
          })}
        </div>

        {/* Big Clock */}
        <div
          style={{
            fontSize: '4.5rem',
            fontWeight: 800,
            fontFamily: 'monospace',
            letterSpacing: '4px',
            margin: '16px 0',
            color: state.isRunning ? activeConfig.color : 'var(--text-primary)',
          }}
        >
          {mounted ? formatTimerMMSS(state.remainingSeconds) : '25:00'}
        </div>
        <div style={{ fontSize: '0.9rem', color: state.isRunning ? '#3dd68c' : 'var(--text-secondary)', marginBottom: '20px', fontWeight: 600 }}>
          {state.isRunning ? 'Đang tập trung cao độ (Đã bật Pop-up khi chuyển tab)' : 'Sẵn sàng'}
        </div>

        {/* Task Input */}
        <div style={{ maxWidth: '420px', margin: '0 auto 24px auto' }}>
          <input
            value={state.taskName}
            onChange={(e) => setTimerState({ taskName: e.target.value })}
            placeholder="Bạn đang làm việc gì trong phiên này? (VD: Ôn phỏng vấn, Giải thuật...)"
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--glass-border)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '10px',
              textAlign: 'center',
              fontSize: '0.95rem',
            }}
          />
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => (state.isRunning ? pauseUnifiedTimer() : startUnifiedTimer())}
            className="glass-button"
            style={{
              padding: '12px 28px',
              fontSize: '1rem',
              background: state.isRunning ? 'rgba(245, 185, 74, 0.2)' : activeConfig.color,
              borderColor: state.isRunning ? '#f5b94a' : 'transparent',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            {state.isRunning ? 'Tạm dừng' : 'Bắt đầu'}
          </button>

          <button onClick={() => resetUnifiedTimer()} className="glass-button" style={{ padding: '12px 20px' }}>
            Đặt lại
          </button>

          {state.remainingSeconds < totalSeconds && (
            <button
              disabled={isSaving}
              onClick={handleCompleteAndSave}
              className="glass-button"
              style={{
                padding: '12px 20px',
                background: 'rgba(61, 214, 140, 0.2)',
                borderColor: '#3dd68c',
                color: '#3dd68c',
                fontWeight: 700,
              }}
            >
              Hoàn thành & Lưu ({elapsedMinutes}p)
            </button>
          )}
        </div>
      </div>

      {/* History Log */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Lịch sử Tập trung Gần đây</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto' }}>
          {recentSessions.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Chưa có phiên làm việc sâu nào được ghi nhận.</p>
          ) : (
            recentSessions.map((s) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '10px',
                  borderLeft: '3px solid var(--accent-primary)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{s.taskName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(s.date || s.completedAt || s.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    color: 'var(--accent-primary)',
                    background: 'rgba(123, 140, 255, 0.1)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                  }}
                >
                  {s.duration} phút
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
