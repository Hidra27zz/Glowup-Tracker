'use client';

import React, { useEffect, useState } from 'react';
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
import { logDeepWorkAction } from '@/app/career/actions';

export default function GlobalTimerPopup() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<UnifiedTimerState>(getTimerState());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pos, setPos] = useState({ x: 24, y: 24 }); // bottom-left offset
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setState(getTimerState());
    const unsub = subscribeTimerSync((nextState) => {
      setState(nextState);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!mounted || !state.isRunning || !state.endTime) return;

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.round((state.endTime! - Date.now()) / 1000));
      if (diff <= 0) {
        clearInterval(interval);
        const finished = setTimerState({
          remainingSeconds: 0,
          isRunning: false,
          endTime: null,
        });
        setState(finished);
        handleAutoSave(finished.durationMinutes, finished.taskName || `Hoàn thành ${TIMER_MODE_CONFIG[finished.mode].label}`);
      } else {
        setState((prev) => ({ ...prev, remainingSeconds: diff }));
      }
    }, 500);

    return () => clearInterval(interval);
  }, [mounted, state.isRunning, state.endTime]);

  const handleAutoSave = async (minutes: number, taskLabel: string) => {
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.set('duration', String(minutes));
      fd.set('taskName', taskLabel || 'Phiên Tập Trung');
      await logDeepWorkAction(fd);
      setToastMsg(`🎉 Đã lưu ${minutes}p Deep Work!`);
      setTimeout(() => setToastMsg(null), 4000);
    } catch {
      // ignore error
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;

  const totalSecs = state.durationMinutes * 60;
  const elapsedSecs = Math.max(0, totalSecs - state.remainingSeconds);
  const progressPct = totalSecs > 0 ? Math.min(100, Math.round((elapsedSecs / totalSecs) * 100)) : 0;
  const activeConfig = TIMER_MODE_CONFIG[state.mode];
  const isModifiedOrRunning = state.isRunning || state.remainingSeconds < totalSecs;

  // Collapsed pill button in bottom-left when timer is idle & user collapsed it
  if (!state.showMiniPopup || (isCollapsed && !state.isRunning)) {
    return (
      <button
        onClick={() => {
          setIsCollapsed(false);
          setTimerState({ showMiniPopup: true });
        }}
        title="Mở đồng hồ bấm giờ nổi (Mini Timer)"
        style={{
          position: 'fixed',
          bottom: `${pos.y}px`,
          left: `${pos.x}px`,
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          borderRadius: '14px',
          background: 'rgba(18, 18, 24, 0.92)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${state.isRunning ? activeConfig.color : 'rgba(255,255,255,0.12)'}`,
          color: '#fff',
          cursor: 'pointer',
          boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
          fontSize: '0.85rem',
          fontWeight: 700,
        }}
      >
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: state.isRunning ? '#10b981' : activeConfig.color,
          boxShadow: state.isRunning ? '0 0 8px #10b981' : 'none',
        }} />
        <span style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>
          {formatTimerMMSS(state.remainingSeconds)}
        </span>
      </button>
    );
  }

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: `${pos.y}px`,
        left: `${pos.x}px`,
        zIndex: 9998,
        width: '210px',
        borderRadius: '20px',
        background: 'rgba(15, 16, 22, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${state.isRunning ? activeConfig.color : 'rgba(255,255,255,0.12)'}`,
        boxShadow: state.isRunning
          ? `0 12px 36px rgba(0,0,0,0.6), 0 0 20px ${activeConfig.color}33`
          : '0 12px 32px rgba(0,0,0,0.5)',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
        userSelect: 'none',
      }}
    >
      {/* Top Header of Square Widget */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: state.isRunning ? '#10b981' : activeConfig.color,
              boxShadow: state.isRunning ? '0 0 8px #10b981' : 'none',
            }}
          />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
            {activeConfig.label}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => {
              setIsCollapsed(true);
              if (!state.isRunning) setTimerState({ showMiniPopup: false });
            }}
            title="Thu gọn thành nút nhỏ"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              color: 'var(--text-secondary)',
              width: '22px',
              height: '22px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            —
          </button>
        </div>
      </div>

      {/* Mode Quick Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '3px', borderRadius: '10px' }}>
        {(['pomodoro', 'deepwork', 'hyperfocus'] as TimerMode[]).map((m) => {
          const active = state.mode === m;
          return (
            <button
              key={m}
              onClick={() => resetUnifiedTimer(m)}
              style={{
                padding: '4px 2px',
                fontSize: '0.65rem',
                fontWeight: active ? 700 : 500,
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                background: active ? TIMER_MODE_CONFIG[m].color : 'transparent',
                color: active ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              {TIMER_MODE_CONFIG[m].minutes}p
            </button>
          );
        })}
      </div>

      {/* Center Circular Countdown */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '4px 0' }}>
        <svg width="84" height="84" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="42"
            cy="42"
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="5"
          />
          <circle
            cx="42"
            cy="42"
            r={radius}
            fill="transparent"
            stroke={activeConfig.color}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'monospace', color: '#fff', letterSpacing: '-0.5px' }}>
            {formatTimerMMSS(state.remainingSeconds)}
          </div>
          <div style={{ fontSize: '0.62rem', color: state.isRunning ? '#10b981' : 'var(--text-secondary)' }}>
            {state.isRunning ? 'Đang chạy' : 'Sẵn sàng'}
          </div>
        </div>
      </div>

      {/* Task Name Input */}
      <input
        type="text"
        value={state.taskName}
        onChange={(e) => setTimerState({ taskName: e.target.value })}
        placeholder="Đang tập trung việc gì?..."
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          padding: '5px 8px',
          fontSize: '0.73rem',
          color: '#fff',
          outline: 'none',
        }}
      />

      {toastMsg && (
        <div style={{ fontSize: '0.7rem', color: '#10b981', textAlign: 'center', fontWeight: 600 }}>
          {toastMsg}
        </div>
      )}

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {!state.isRunning ? (
          <button
            onClick={() => startUnifiedTimer()}
            style={{
              flex: 1,
              padding: '7px 10px',
              borderRadius: '9px',
              border: 'none',
              background: activeConfig.color,
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
            }}
          >
            ▶ Chạy
          </button>
        ) : (
          <button
            onClick={() => pauseUnifiedTimer()}
            style={{
              flex: 1,
              padding: '7px 10px',
              borderRadius: '9px',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
            }}
          >
            ⏸ Tạm dừng
          </button>
        )}

        <button
          onClick={() => resetUnifiedTimer()}
          title="Đặt lại đồng hồ"
          style={{
            padding: '7px 9px',
            borderRadius: '9px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: 'var(--text-secondary)',
            fontSize: '0.78rem',
            cursor: 'pointer',
          }}
        >
          ↺
        </button>

        {isModifiedOrRunning && elapsedSecs >= 60 && (
          <button
            disabled={isSaving}
            onClick={async () => {
              const mins = Math.max(1, Math.round(elapsedSecs / 60));
              pauseUnifiedTimer();
              await handleAutoSave(mins, state.taskName || `Phiên ${activeConfig.label}`);
              resetUnifiedTimer();
            }}
            title="Lưu thời gian đã tập trung"
            style={{
              padding: '7px 9px',
              borderRadius: '9px',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ✓
          </button>
        )}
      </div>
    </div>
  );
}
