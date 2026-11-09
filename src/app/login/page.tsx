'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  loginUserAction,
  registerUserAction,
  getSessionUserAction,
  updateProfileAction,
  logoutUserAction,
  SessionUser,
} from '@/app/auth/actions';

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: 500,
  color: 'var(--text-secondary)',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 13px',
  fontSize: '0.92rem',
  borderRadius: '10px',
  border: '1px solid var(--border)',
  background: 'var(--bg-color)',
  color: 'var(--text-primary)',
};

export default function LoginRegisterPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);

  const refresh = async () => {
    const res = await getSessionUserAction();
    setCurrentUser(res.currentUser);
  };

  useEffect(() => {
    refresh();
  }, []);

  const notify = () => window.dispatchEvent(new CustomEvent('glowup-auth-changed'));

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await loginUserAction(new FormData(e.currentTarget));
      if (!res.success) {
        setError(res.error || 'Đăng nhập thất bại.');
      } else {
        await refresh();
        notify();
        router.push('/');
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const fd = new FormData(e.currentTarget);
    const pass = String(fd.get('password') || '');
    const confirmPass = String(fd.get('confirmPassword') || '');
    if (confirmPass && pass !== confirmPass) {
      setError('Mật khẩu xác nhận không khớp.');
      setLoading(false);
      return;
    }

    try {
      const res = await registerUserAction(fd);
      if (!res.success) {
        setError(res.error || 'Đăng ký thất bại.');
      } else {
        await refresh();
        notify();
        router.push('/');
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await updateProfileAction(new FormData(e.currentTarget));
      if (!res.success) {
        setError(res.error || 'Cập nhật thất bại.');
      } else {
        setSuccess('Đã lưu thông tin tài khoản.');
        await refresh();
        notify();
      }
    } finally {
      setLoading(false);
    }
  };

  // Nếu người dùng đã đăng nhập -> Hiển thị thẻ Tài khoản cá nhân gọn gàng
  if (currentUser) {
    return (
      <div style={{ maxWidth: '420px', margin: '36px auto', width: '100%' }}>
        <section
          className="glass-card"
          style={{
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'var(--accent-soft)',
                border: '1px solid var(--accent-border)',
                color: 'var(--accent-color)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '10px',
              }}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{currentUser.name}</h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              {currentUser.email}
            </p>
          </div>

          {error && (
            <div
              style={{
                borderLeft: '3px solid var(--danger-color)',
                background: 'var(--surface-2)',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '0.84rem',
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                borderLeft: '3px solid var(--success-color)',
                background: 'var(--surface-2)',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '0.84rem',
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Họ và tên</label>
              <input name="name" type="text" defaultValue={currentUser.name} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Đổi mật khẩu mới (để trống nếu giữ nguyên)</label>
              <input
                name="newPassword"
                type="password"
                placeholder="Nhập mật khẩu mới..."
                style={inputStyle}
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '11px', width: '100%' }}>
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border)',
              paddingTop: '14px',
            }}
          >
            <Link href="/" style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              ← Quay về trang chủ
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logoutUserAction();
                setCurrentUser(null);
                notify();
                router.refresh();
              }}
              style={{
                background: 'rgba(244, 109, 117, 0.1)',
                border: '1px solid rgba(244, 109, 117, 0.3)',
                color: '#f46d75',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Đăng xuất
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Giao diện Đăng nhập / Đăng ký chuẩn như các trang web thông thường
  return (
    <div style={{ maxWidth: '420px', margin: '36px auto', width: '100%' }}>
      <section
        className="glass-card"
        style={{
          padding: '30px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '6px' }}>
            GlowUp<span style={{ color: 'var(--accent-color)' }}>.</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
            {mode === 'login' ? 'Đăng nhập tài khoản' : 'Tạo tài khoản mới'}
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {mode === 'login'
              ? 'Nhập email và mật khẩu của bạn để tiếp tục'
              : 'Điền thông tin bên dưới để đăng ký tài khoản'}
          </p>
        </div>

        {error && (
          <div
            style={{
              borderLeft: '3px solid var(--danger-color)',
              background: 'var(--surface-2)',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              color: '#f9a3a8',
            }}
          >
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                style={inputStyle}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Mật khẩu</label>
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '0.76rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {showPass ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
              <input
                name="password"
                type={showPass ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '11px', width: '100%', fontSize: '0.92rem', marginTop: '4px' }}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Họ và tên</label>
              <input
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Nguyễn Văn A"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Mật khẩu</label>
              <input
                name="password"
                type={showPass ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Tối thiểu 4 ký tự"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Xác nhận mật khẩu</label>
              <input
                name="confirmPassword"
                type={showPass ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '11px', width: '100%', fontSize: '0.92rem', marginTop: '4px' }}
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
            </button>
          </form>
        )}

        <div
          style={{
            textAlign: 'center',
            borderTop: '1px solid var(--border)',
            paddingTop: '16px',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}
        >
          {mode === 'login' ? (
            <>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--accent-color)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Đăng ký ngay
              </button>
            </>
          ) : (
            <>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--accent-color)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Đăng nhập
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
