'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  getTimerState,
  subscribeTimerSync,
  formatTimerMMSS,
  UnifiedTimerState,
  setTimerState,
} from '@/lib/utils/timerStore';
import { getSessionUserAction, SessionUser } from '@/app/auth/actions';

const NAV_ITEMS = [
  { href: '/', label: 'Tổng quan' },
  { href: '/tasks', label: 'Công việc' },
  { href: '/career', label: 'Học tập' },
  { href: '/health', label: 'Sức khỏe' },
  { href: '/nutrition', label: 'Dinh dưỡng' },
  { href: '/finance', label: 'Tài chính' },
  { href: '/mental', label: 'Tinh thần' },
  { href: '/crm', label: 'Quan hệ' },
  { href: '/memory', label: 'Ghi chú' },
];

export default function TopNav() {
  const pathname = usePathname();
  const [timer, setTimer] = useState<UnifiedTimerState | null>(null);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setTimer(getTimerState());
    return subscribeTimerSync((st) => setTimer(st));
  }, []);

  useEffect(() => {
    const fetchUser = () => {
      getSessionUserAction()
        .then((res) => setCurrentUser(res.currentUser))
        .catch(() => {});
    };
    fetchUser();
    window.addEventListener('glowup-auth-changed', fetchUser);
    return () => window.removeEventListener('glowup-auth-changed', fetchUser);
  }, [pathname]);

  useEffect(() => {
    if (!timer?.isRunning || !timer.endTime) return;
    const id = setInterval(() => setTimer(getTimerState()), 1000);
    return () => clearInterval(id);
  }, [timer?.isRunning, timer?.endTime]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <nav className="glass-nav">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          gap: '28px',
          height: 'var(--nav-height)',
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
          }}
        >
          GlowUp<span style={{ color: 'var(--accent-color)' }}>.</span>
        </Link>

        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: '2px',
            height: '100%',
            flex: 1,
            overflowX: 'auto',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  borderBottom: `2px solid ${active ? 'var(--accent-color)' : 'transparent'}`,
                  marginBottom: '-1px',
                  transition: 'color 0.15s ease',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {timer && (timer.isRunning || timer.remainingSeconds < timer.durationMinutes * 60) && (
            <button
              onClick={() => setTimerState({ showMiniPopup: !timer.showMiniPopup })}
              title="Bật/tắt đồng hồ thu nhỏ"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'var(--surface-2)',
                border: `1px solid ${timer.isRunning ? 'var(--success-color)' : 'var(--border)'}`,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontFamily: 'ui-monospace, monospace' }}>
                {formatTimerMMSS(timer.remainingSeconds)}
              </span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                {timer.isRunning ? 'Đang chạy' : 'Tạm dừng'}
              </span>
            </button>
          )}

          <Link
            href="/login"
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.825rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              background: currentUser ? 'var(--surface-2)' : 'var(--accent-color)',
              border: `1px solid ${currentUser ? 'var(--border)' : 'var(--accent-color)'}`,
              color: currentUser ? 'var(--text-primary)' : '#fff',
            }}
          >
            {currentUser ? currentUser.name : 'Đăng nhập'}
          </Link>
        </div>
      </div>
    </nav>
  );
}
