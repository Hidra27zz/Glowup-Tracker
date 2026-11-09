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

export default function DashboardDeepWorkTimer({ totalMinutesToday = 0 }: { totalMinutesToday?: number }) {
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

  const handleSaveSession = async (minutesToSave: number, label: string) => {
    if (minutesToSave <= 0) return;
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.set('duration', String(minutesToSave));
      fd.set('taskName', label || 'Phiên Tập Trung');
      await logDeepWorkAction(fd);
    } finally {
      setIsSaving(false);
    }
  };

  const activeConfig = TIMER_MODE_CONFIG[state.mode];
  const totalSeconds = state.durationMinutes * 60;
  const elapsedMinutes = Math.max(1, Math.round((totalSeconds - state.remainingSeconds) / 60));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⏱️ Deep Work Protocol
          </h3>
          <button
            onClick={() => setTimerState({ showMiniPopup: true })}
            title="Bật đồng hồ vuông nhỏ nổi khi chuyển tab"
            style={{
              background: 'rgba(139, 92, 246, 0.14)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              color: 'var(--accent-primary)',
              borderRadius: '8px',
              padding: '4px 8px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ❐ Mini Pop-up
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {totalMinutesToday} <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)' }}>phút hôm nay</span>
          </div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '5px', borderRadius: '12px' }}>
        {(['pomodoro', 'deepwork', 'hyperfocus'] as TimerMode[]).map((m) => {
          const active = state.mode === m;
          return (
            <button
              key={m}
              onClick={() => resetUnifiedTimer(m)}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: '8px',
                border: 'none',
                background: active ? TIMER_MODE_CONFIG[m].color : 'transparent',
                color: active ? '#fff' : 'var(--text-secondary)',
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.78rem',
                transition: 'all 0.2s',
              }}
            >
              {TIMER_MODE_CONFIG[m].label} ({TIMER_MODE_CONFIG[m].minutes}p)
            </button>
          );
        })}
      </div>

      {/* Main Countdown Display */}
      <div
        style={{
          padding: '16px',
          background: 'rgba(0,0,0,0.28)',
          borderRadius: '14px',
          border: `1px solid ${state.isRunning ? activeConfig.color : 'var(--glass-border)'}`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '2.75rem',
            fontWeight: 800,
            fontFamily: 'monospace',
            color: state.isRunning ? activeConfig.color : 'var(--text-primary)',
            letterSpacing: '2px',
            marginBottom: '6px',
          }}
        >
          {mounted ? formatTimerMMSS(state.remainingSeconds) : '25:00'}
        </div>
        <div style={{ fontSize: '0.78rem', color: state.isRunning ? '#10b981' : 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600 }}>
          {state.isRunning ? '🔥 Đang đồng bộ trên toàn hệ thống...' : 'Sẵn sàng vào trạng thái dòng chảy'}
        </div>

        <input
          type="text"
          value={state.taskName}
          onChange={(e) => setTimerState({ taskName: e.target.value })}
          placeholder="Tên việc đang tập trung..."
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)',
            color: '#fff',
            fontSize: '0.85rem',
            marginBottom: '12px',
            outline: 'none',
          }}
        />

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {!state.isRunning ? (
            <button
              onClick={() => startUnifiedTimer()}
              className="glass-button"
              style={{ flex: 1, justifyContent: 'center', background: activeConfig.color, color: '#fff', border: 'none', fontWeight: 700 }}
            >
              ▶ Bắt đầu
            </button>
          ) : (
            <button
              onClick={() => pauseUnifiedTimer()}
              className="glass-button"
              style={{ flex: 1, justifyContent: 'center', background: 'rgba(245, 158, 11, 0.2)', borderColor: '#f59e0b', color: '#fbbf24', fontWeight: 700 }}
            >
              ⏸ Tạm dừng
            </button>
          )}
          <button
            onClick={() => resetUnifiedTimer()}
            className="glass-button"
            style={{ padding: '8px 12px', fontSize: '0.82rem' }}
          >
            ↺ Reset
          </button>
          {state.remainingSeconds < totalSeconds && (
            <button
              disabled={isSaving}
              onClick={async () => {
                pauseUnifiedTimer();
                await handleSaveSession(elapsedMinutes, state.taskName || `Phiên ${activeConfig.label}`);
                resetUnifiedTimer();
              }}
              className="glass-button"
              style={{ background: 'rgba(16, 185, 129, 0.2)', borderColor: '#10b981', color: '#10b981', fontSize: '0.82rem', fontWeight: 700 }}
            >
              ✓ Lưu ({elapsedMinutes}p)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
