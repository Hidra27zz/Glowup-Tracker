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

const ghostBtn: React.CSSProperties = {
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  padding: '4px 9px',
  borderRadius: '6px',
  fontSize: '0.72rem',
  fontWeight: 500,
  cursor: 'pointer',
};

export default function GlobalTimerPopup() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<UnifiedTimerState>(getTimerState());
  const [collapsed, setCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setState(getTimerState());
    return subscribeTimerSync((next) => setState(next));
  }, []);

  useEffect(() => {
    if (!mounted || !state.isRunning || !state.endTime) return;
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.round((state.endTime! - Date.now()) / 1000));
      if (diff <= 0) {
        clearInterval(interval);
        const finished = setTimerState({ remainingSeconds: 0, isRunning: false, endTime: null });
        setState(finished);
        handleSave(
          finished.durationMinutes,
          finished.taskName || `Hoàn thành ${TIMER_MODE_CONFIG[finished.mode].label}`
        );
      } else {
        setState((prev) => ({ ...prev, remainingSeconds: diff }));
      }
    }, 500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, state.isRunning, state.endTime]);

  const handleSave = async (minutes: number, label: string) => {
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.set('duration', String(minutes));
      fd.set('taskName', label || 'Phiên tập trung');
      await logDeepWorkAction(fd);
      setToastMsg(`Đã lưu ${minutes} phút tập trung`);
      setTimeout(() => setToastMsg(null), 4000);
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted || !state.showMiniPopup) return null;

  const total = state.durationMinutes * 60;
  const elapsed = Math.max(0, total - state.remainingSeconds);
  const pct = total > 0 ? Math.min(100, (elapsed / total) * 100) : 0;
  const cfg = TIMER_MODE_CONFIG[state.mode];

  const shell: React.CSSProperties = {
    position: 'fixed',
    bottom: '24px',
    left: '24px',
    zIndex: 9998,
    background: 'var(--surface)',
    border: `1px solid ${state.isRunning ? cfg.color : 'var(--border-strong)'}`,
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
    userSelect: 'none',
  };

  /* ---- Collapsed: compact pill with text ---- */
  if (collapsed) {
    return (
      <div
        style={{
          ...shell,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 10px 8px 14px',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
            }}
          >
            {formatTimerMMSS(state.remainingSeconds)}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{cfg.label}</div>
        </div>
        <button
          onClick={() => (state.isRunning ? pauseUnifiedTimer() : startUnifiedTimer())}
          style={{ ...ghostBtn, color: 'var(--text-primary)' }}
        >
          {state.isRunning ? 'Tạm dừng' : 'Chạy'}
        </button>
        <button onClick={() => setCollapsed(false)} style={ghostBtn}>
          Mở rộng
        </button>
      </div>
    );
  }

  /* ---- Expanded ---- */
  return (
    <div style={{ ...shell, width: '236px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{cfg.label}</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => setCollapsed(true)} style={ghostBtn}>
            Thu nhỏ
          </button>
          <button onClick={() => setTimerState({ showMiniPopup: false })} style={ghostBtn}>
            Đóng
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '4px',
          background: 'var(--surface-2)',
          padding: '3px',
          borderRadius: '8px',
        }}
      >
        {(['pomodoro', 'deepwork', 'hyperfocus'] as TimerMode[]).map((m) => {
          const active = state.mode === m;
          return (
            <button
              key={m}
              onClick={() => resetUnifiedTimer(m)}
              style={{
                padding: '5px 2px',
                fontSize: '0.72rem',
                fontWeight: active ? 600 : 500,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: active ? 'var(--surface-3)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              {TIMER_MODE_CONFIG[m].minutes} phút
            </button>
          );
        })}
      </div>

      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: '2.4rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: state.isRunning ? cfg.color : 'var(--text-primary)',
            lineHeight: 1.1,
          }}
        >
          {formatTimerMMSS(state.remainingSeconds)}
        </div>
        <div style={{ height: '3px', background: 'var(--surface-3)', borderRadius: '2px', margin: '10px 0 6px' }}>
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              background: cfg.color,
              borderRadius: '2px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {state.isRunning ? 'Đang chạy' : 'Sẵn sàng'}
        </div>
      </div>

      <input
        type="text"
        value={state.taskName}
        onChange={(e) => setTimerState({ taskName: e.target.value })}
        placeholder="Đang tập trung vào việc gì?"
        style={{ width: '100%', padding: '7px 10px', fontSize: '0.78rem' }}
      />

      {toastMsg && (
        <div style={{ fontSize: '0.74rem', color: 'var(--success-color)', textAlign: 'center' }}>{toastMsg}</div>
      )}

      <div style={{ display: 'flex', gap: '6px' }}>
        {!state.isRunning ? (
          <button
            onClick={() => startUnifiedTimer()}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--accent-color)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Bắt đầu
          </button>
        ) : (
          <button
            onClick={() => pauseUnifiedTimer()}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid var(--border-strong)',
              background: 'var(--surface-2)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Tạm dừng
          </button>
        )}
        <button onClick={() => resetUnifiedTimer()} style={{ ...ghostBtn, padding: '8px 12px', fontSize: '0.78rem' }}>
          Đặt lại
        </button>
      </div>

      {elapsed >= 60 && (
        <button
          disabled={isSaving}
          onClick={async () => {
            const mins = Math.max(1, Math.round(elapsed / 60));
            pauseUnifiedTimer();
            await handleSave(mins, state.taskName || `Phiên ${cfg.label}`);
            resetUnifiedTimer();
          }}
          style={{ ...ghostBtn, padding: '7px', fontSize: '0.76rem', color: 'var(--success-color)' }}
        >
          Lưu {Math.max(1, Math.round(elapsed / 60))} phút đã tập trung
        </button>
      )}
    </div>
  );
}
