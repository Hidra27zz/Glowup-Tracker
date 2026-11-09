'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  loginUserAction,
  registerUserAction,
  quickDemoLoginAction,
  getSessionUserAction,
  switchAccountByIdAction,
  logoutUserAction,
  SessionUser,
} from '@/app/auth/actions';

const MAJOR_OPTIONS = [
  'Đa ngành / Tự chọn',
  'Kinh tế & Quản trị kinh doanh',
  'Marketing & Truyền thông',
  'Tài chính - Ngân hàng & Kế toán',
  'Công nghệ thông tin & Kỹ thuật',
  'Ngoại ngữ & Quan hệ quốc tế',
  'Thiết kế, Sáng tạo & Nghệ thuật',
  'Y Dược & Chăm sóc sức khỏe',
];

export default function LoginRegisterPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [accounts, setAccounts] = useState<SessionUser[]>([]);

  const refreshSession = async () => {
    const res = await getSessionUserAction();
    setCurrentUser(res.currentUser);
    setAccounts(res.accounts);
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const notifyAuthChanged = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('glowup-auth-changed'));
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await loginUserAction(fd);
      if (!res.success) {
        setError(res.error || 'Đăng nhập thất bại.');
      } else {
        setSuccessMsg(`Chào mừng trở lại, ${res.user?.name}! Đang chuyển hướng...`);
        await refreshSession();
        notifyAuthChanged();
        setTimeout(() => router.push('/'), 600);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await registerUserAction(fd);
      if (!res.success) {
        setError(res.error || 'Đăng ký thất bại.');
      } else {
        setSuccessMsg(`Đã tạo tài khoản thành công cho ${res.user?.name}! Đang vào hệ thống...`);
        await refreshSession();
        notifyAuthChanged();
        setTimeout(() => router.push('/'), 700);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await quickDemoLoginAction();
      if (res.success) {
        await refreshSession();
        notifyAuthChanged();
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = async (userId: string) => {
    setLoading(true);
    try {
      const res = await switchAccountByIdAction(userId);
      if (res.success) {
        await refreshSession();
        notifyAuthChanged();
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 110px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '940px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
          alignItems: 'stretch',
        }}
      >
        {/* Left Card: Login / Register Form */}
        <div
          className="glass-card"
          style={{
            padding: '32px',
            borderRadius: '24px',
            background: 'rgba(15, 20, 32, 0.92)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                boxShadow: '0 6px 18px rgba(139, 92, 246, 0.4)',
              }}
            >
              ✨
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                {mode === 'login' ? 'Đăng Nhập Hệ Thống' : 'Đăng Ký Tài Khoản Mới'}
              </h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Quản lý tài khoản cá nhân trên GlowUp OS
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
              background: 'rgba(255,255,255,0.04)',
              padding: '5px',
              borderRadius: '12px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              style={{
                padding: '10px',
                borderRadius: '9px',
                border: 'none',
                background:
                  mode === 'login'
                    ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)'
                    : 'transparent',
                color: mode === 'login' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
              }}
            >
              🔐 Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              style={{
                padding: '10px',
                borderRadius: '9px',
                border: 'none',
                background:
                  mode === 'register'
                    ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)'
                    : 'transparent',
                color: mode === 'register' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
              }}
            >
              ➕ Thêm Tài Khoản Mới
            </button>
          </div>

          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#6ee7b7',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              ✅ {successMsg}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Email tài khoản</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="vd: ban@gmail.com hoặc member@glowup.os"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Mật khẩu</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Nhập mật khẩu..."
                  style={inputStyle}
                />
              </div>
              <button type="submit" disabled={loading} style={primaryBtnStyle}>
                {loading ? '⏳ Đang kiểm tra...' : '🚀 Đăng Nhập Vào Hệ Thống'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Họ và tên hiển thị</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="VD: Nguyễn Văn A"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email đăng nhập</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="VD: nguyenvana@gmail.com"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Mật khẩu (tối thiểu 4 ký tự)</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Nhập mật khẩu bảo mật..."
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Lĩnh vực / Chuyên ngành quan tâm</label>
                <select name="majorOrField" style={inputStyle}>
                  {MAJOR_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} style={{ background: '#0f172a', color: '#fff' }}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={loading} style={primaryBtnStyle}>
                {loading ? '⏳ Đang tạo tài khoản...' : '✨ Tạo Tài Khoản & Đăng Nhập Ngay'}
              </button>
            </form>
          )}

          {/* 1-Tap Quick Demo Access */}
          <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              type="button"
              disabled={loading}
              onClick={handleQuickDemo}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              ⚡ Đăng nhập nhanh 1-chạm (Tài khoản Mặc định: GlowUp Creator)
            </button>
          </div>
        </div>

        {/* Right Card: Active Session & Fast Multi-Account Switcher */}
        <div
          className="glass-card"
          style={{
            padding: '28px',
            borderRadius: '24px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                👤 Quản Lý Tài Khoản Trên Thiết Bị
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Bạn có thể tạo nhiều tài khoản (cá nhân, học tập, công việc) và chuyển đổi nhanh tại đây.
              </p>
            </div>

            {/* Current Active User Card */}
            {currentUser ? (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(59, 130, 246, 0.12))',
                  border: '1px solid rgba(16, 185, 129, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                    ● Đang đăng nhập
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                    {currentUser.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                    {currentUser.email} • {currentUser.majorOrField}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await logoutUserAction();
                    await refreshSession();
                    notifyAuthChanged();
                  }}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#fca5a5',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px dashed rgba(255,255,255,0.12)',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                }}
              >
                Chưa có tài khoản nào đang đăng nhập trong phiên hiện tại.
              </div>
            )}

            {/* Existing Accounts List */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '10px' }}>
                Danh sách tài khoản đã đăng ký ({accounts.length}):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                {accounts.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Chưa có tài khoản nào. Hãy bấm &ldquo;Thêm Tài Khoản Mới&rdquo; hoặc &ldquo;Đăng nhập nhanh 1-chạm&rdquo;.
                  </div>
                ) : (
                  accounts.map((acc) => {
                    const isCurrent = currentUser?.id === acc.id;
                    return (
                      <div
                        key={acc.id}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '12px',
                          background: isCurrent ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                          border: isCurrent
                            ? '1px solid rgba(139, 92, 246, 0.45)'
                            : '1px solid rgba(255,255,255,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>{acc.name}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                            {acc.email} · {acc.majorOrField}
                          </div>
                        </div>
                        {!isCurrent ? (
                          <button
                            type="button"
                            onClick={() => handleSwitchAccount(acc.id)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1px solid rgba(139, 92, 246, 0.4)',
                              background: 'rgba(139, 92, 246, 0.16)',
                              color: '#c4b5fd',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Chọn dùng →
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>Đang dùng</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Link
              href="/"
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                textDecoration: 'none',
              }}
            >
              ← Quay về Dashboard
            </Link>
            <a
              href="/api/excel/template"
              download="GlowUp_OS_Mau_Nhap_Lieu_7_Sheets.xlsx"
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#10b981',
                textDecoration: 'none',
              }}
            >
              📥 Tải File Excel Mẫu (7 Sheets)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#cbd5e1',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(0,0,0,0.35)',
  color: '#fff',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const primaryBtnStyle: React.CSSProperties = {
  marginTop: '4px',
  width: '100%',
  padding: '12px 18px',
  borderRadius: '12px',
  border: 'none',
  background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.92rem',
  cursor: 'pointer',
  boxShadow: '0 6px 20px rgba(139, 92, 246, 0.35)',
};
