'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  getTimerState,
  subscribeTimerSync,
  formatTimerMMSS,
  TIMER_MODE_CONFIG,
  UnifiedTimerState,
  setTimerState,
} from '@/lib/utils/timerStore';

interface NavItem {
  href: string;
  label: string;
  viLabel: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', viLabel: 'Tổng quan', icon: '⚡' },
  { href: '/tasks', label: 'Tasks & Sprints', viLabel: 'Công việc & Lịch', icon: '🎯' },
  { href: '/career', label: 'Career & Study', viLabel: 'Học tập & Sự nghiệp', icon: '🚀' },
  { href: '/health', label: 'Health', viLabel: 'Sức khỏe', icon: '💪' },
  { href: '/nutrition', label: 'Nutrition & Fridge', viLabel: 'Dinh dưỡng & Tủ lạnh', icon: '🥗' },
  { href: '/finance', label: 'Finance', viLabel: 'Tài chính', icon: '💳' },
  { href: '/mental', label: 'Mental', viLabel: 'Tinh thần', icon: '🧘' },
  { href: '/crm', label: 'CRM', viLabel: 'Mối quan hệ', icon: '🤝' },
  { href: '/memory', label: 'Memory', viLabel: 'Ký ức', icon: '🧠' },
];

export default function TopNav() {
  const pathname = usePathname();
  const [timer, setTimer] = useState<UnifiedTimerState | null>(null);

  useEffect(() => {
    setTimer(getTimerState());
    return subscribeTimerSync((st) => setTimer(st));
  }, []);

  useEffect(() => {
    if (!timer?.isRunning || !timer.endTime) return;
    const id = setInterval(() => {
      setTimer(getTimerState());
    }, 1000);
    return () => clearInterval(id);
  }, [timer?.isRunning, timer?.endTime]);

  const activeItem =
    NAV_ITEMS.find((item) => (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href))) ||
    NAV_ITEMS[0];

  return (
    <nav
      className="glass-nav"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: '10px 24px',
        background: 'rgba(10, 11, 16, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '1600px',
          margin: '0 auto',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* Brand + Current Active Location Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
              }}
            >
              ✨
            </div>
            <div>
              <div
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '-0.3px',
                  lineHeight: 1.1,
                }}
              >
                GlowUp OS
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--accent-primary)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Đang ở:</span>
                <span style={{ color: '#e2e8f0' }}>
                  {activeItem.icon} {activeItem.viLabel}
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '5px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            overflowX: 'auto',
            maxWidth: '100%',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 13px',
                  borderRadius: '10px',
                  fontSize: '0.83rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.28), rgba(59, 130, 246, 0.22))'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(139, 92, 246, 0.5)'
                    : '1px solid transparent',
                  boxShadow: isActive ? '0 4px 12px rgba(139, 92, 246, 0.2)' : 'none',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '0.95rem' }}>{item.icon}</span>
                <span>{item.viLabel}</span>
                {isActive && (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#a855f7',
                      boxShadow: '0 0 8px #a855f7',
                      marginLeft: '2px',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Live Timer Status Pill on Right */}
        {timer && (
          <button
            onClick={() => setTimerState({ showMiniPopup: true })}
            title="Nhấn để bật/hiện đồng hồ vuông Mini Pop-up"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 12px',
              borderRadius: '12px',
              background: timer.isRunning
                ? 'rgba(16, 185, 129, 0.14)'
                : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${
                timer.isRunning ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.08)'
              }`,
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: timer.isRunning
                  ? '#10b981'
                  : TIMER_MODE_CONFIG[timer.mode].color,
                boxShadow: timer.isRunning ? '0 0 8px #10b981' : 'none',
              }}
            />
            <span style={{ fontFamily: 'monospace', fontSize: '0.88rem' }}>
              {formatTimerMMSS(timer.remainingSeconds)}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {timer.isRunning ? 'Đang chạy' : 'Timer'}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}
