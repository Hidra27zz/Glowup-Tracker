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
  const [menuOpen, setMenuOpen] = useState(false);

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

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!timer?.isRunning || !timer.endTime) return;
    const id = setInterval(() => setTimer(getTimerState()), 1000);
    return () => clearInterval(id);
  }, [timer?.isRunning, timer?.endTime]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const current = NAV_ITEMS.find((i) => isActive(i.href));

  return (
    <nav className="glass-nav" aria-label="Điều hướng chính">
      <div className="nav-inner">
        <Link href="/" className="nav-brand">
          GlowUp<span style={{ color: 'var(--accent-color)' }}>.</span>
        </Link>

        <div className={`nav-links${menuOpen ? ' open' : ''}`}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`nav-link${active ? ' active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="nav-actions">
          {timer && (timer.isRunning || timer.remainingSeconds < timer.durationMinutes * 60) && (
            <button
              onClick={() => setTimerState({ showMiniPopup: !timer.showMiniPopup })}
              title="Bật/tắt đồng hồ thu nhỏ"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
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
              <span style={{ fontFamily: 'ui-monospace, monospace' }}>{formatTimerMMSS(timer.remainingSeconds)}</span>
            </button>
          )}

          <Link
            href="/login"
            className="nav-user-name"
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.825rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              background: currentUser ? 'var(--surface-2)' : 'var(--accent-color)',
              border: `1px solid ${currentUser ? 'var(--border)' : 'var(--accent-color)'}`,
              color: currentUser ? 'var(--text-primary)' : '#0a0c11',
            }}
          >
            {currentUser ? currentUser.name : 'Đăng nhập'}
          </Link>

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={menuOpen}
            aria-label="Mở menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="nav-toggle-bars" aria-hidden="true" />
            <span className="nav-toggle-label">{current ? current.label : 'Menu'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
