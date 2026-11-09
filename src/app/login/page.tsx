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
  'Kinh tế và Quản trị kinh doanh',
  'Marketing và Truyền thông',
  'Tài chính, Ngân hàng, Kế toán',
  'Công nghệ thông tin và Kỹ thuật',
  'Ngoại ngữ và Quan hệ quốc tế',
  'Thiết kế, Sáng tạo, Nghệ thuật',
  'Y Dược và Chăm sóc sức khỏe',
];

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 500,
  color: 'var(--text-secondary)',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '0.92rem',
};

export default function LoginRegisterPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [accounts, setAccounts] = useState<SessionUser[]>([]);

  const refresh = async () => {
    const res = await getSessionUserAction();
    setCurrentUser(res.currentUser);
    setAccounts(res.accounts);
  };

  useEffect(() => {
    refresh();
  }, []);

  const notify = () => window.dispatchEvent(new CustomEvent('glowup-auth-changed'));

  const finish = async (msg: string) => {
    setSuccess(msg);
    await refresh();
    notify();
    setTimeout(() => router.push('/'), 600);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await loginUserAction(new FormData(e.currentTarget));
      if (!res.success) setError(res.error || 'Đăng nhập thất bại.');
      else await finish(`Chào mừng trở lại, ${res.user?.name}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await registerUserAction(new FormData(e.currentTarget));
      if (!res.success) setError(res.error || 'Đăng ký thất bại.');
      else await finish(`Đã tạo tài khoản cho ${res.user?.name}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    try {
      const res = await quickDemoLoginAction();
      if (res.success) {
        await refresh();
        notify();
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = async (id: string) => {
    setLoading(true);
    try {
      const res = await switchAccountByIdAction(id);
      if (res.success) {
        await refresh();
        notify();
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
      {/* Form */}
      <section className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.86rem' }}>
            {mode === 'login' ? 'Dùng email và mật khẩu đã đăng ký.' : 'Mỗi tài khoản có không gian làm việc riêng.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '3px', borderRadius: '10px' }}>
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              style={{
                padding: '8px',
                borderRadius: '7px',
                border: 'none',
                background: mode === m ? 'var(--surface-3)' : 'transparent',
                color: mode === m ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: mode === m ? 600 : 500,
                fontSize: '0.86rem',
                cursor: 'pointer',
              }}
            >
              {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ borderLeft: '3px solid var(--danger-color)', background: 'var(--surface-2)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.84rem' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ borderLeft: '3px solid var(--success-color)', background: 'var(--surface-2)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.84rem' }}>
            {success}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input name="email" type="email" required placeholder="ban@email.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Mật khẩu</label>
              <input name="password" type="password" required style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '11px' }}>
              {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Họ và tên</label>
              <input name="name" type="text" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input name="email" type="email" required placeholder="ban@email.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Mật khẩu (tối thiểu 4 ký tự)</label>
              <input name="password" type="password" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Lĩnh vực quan tâm</label>
              <select name="majorOrField" style={inputStyle}>
                {MAJOR_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '11px' }}>
              {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </form>
        )}

        <button type="button" disabled={loading} onClick={handleDemo} className="btn" style={{ width: '100%' }}>
          Vào nhanh bằng tài khoản mặc định
        </button>
      </section>

      {/* Accounts */}
      <section className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Tài khoản trên thiết bị</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.84rem' }}>Chuyển nhanh giữa các tài khoản đã tạo.</p>
        </div>

        {currentUser ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--success-color)', borderRadius: '10px', padding: '12px 14px' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--success-color)', fontWeight: 600 }}>Đang đăng nhập</div>
              <div style={{ fontWeight: 600 }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{currentUser.email}</div>
            </div>
            <button
              type="button"
              className="btn"
              onClick={async () => {
                await logoutUserAction();
                await refresh();
                notify();
              }}
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Chưa đăng nhập.</div>
        )}

        <div>
          <div className="section-title">Tất cả tài khoản ({accounts.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto' }}>
            {accounts.length === 0 && (
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Chưa có tài khoản nào.</div>
            )}
            {accounts.map((acc) => {
              const isCurrent = currentUser?.id === acc.id;
              return (
                <div
                  key={acc.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: `1px solid ${isCurrent ? 'var(--accent-color)' : 'var(--border)'}`,
                    background: isCurrent ? 'var(--accent-soft)' : 'transparent',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{acc.name}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{acc.email}</div>
                  </div>
                  {isCurrent ? (
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Đang dùng</span>
                  ) : (
                    <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.8rem' }} onClick={() => handleSwitch(acc.id)}>
                      Chuyển sang
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '12px', fontSize: '0.82rem' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)' }}>
            Quay về tổng quan
          </Link>
          <a href="/api/excel/template" download style={{ color: 'var(--text-secondary)' }}>
            Tải file Excel mẫu
          </a>
        </div>
      </section>
    </div>
  );
}
