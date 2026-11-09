'use client';

import React, { useState } from 'react';
import { smartAutoLogAction } from '@/app/dashboard-actions';

const QUICK_PRESETS = [
  { label: 'Phở bò 45k', command: 'Ăn sáng phở bò 45k, uống 1 ly nước' },
  { label: 'Cơm trưa 50k', command: 'Ăn cơm trưa văn phòng 50k, uống 1 ly nước' },
  { label: 'Ức gà + trứng', command: 'Ăn ức gà và trứng luộc' },
  { label: 'Cà phê 30k', command: 'Uống cà phê sữa 30k' },
  { label: '2 ly nước', command: 'Uống 2 ly nước' },
  { label: 'Tập gym 45 phút', command: 'Tập gym 45 phút, uống 2 ly nước' },
];

export default function SmartAICommandBar() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const run = async (text: string) => {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const res = await smartAutoLogAction(text);
      if (res.success) {
        setResults(res.summary);
        setInput('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Ghi nhanh</h3>
        <p style={{ margin: '2px 0 0', fontSize: '0.84rem' }}>
          Gõ một câu, hệ thống tự tính calo, chi tiêu, nước uống, tập luyện hoặc lịch hẹn.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(input);
        }}
        style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ví dụ: ăn phở bò 45k, uống 2 ly nước, họp nhóm lúc 15h"
          style={{ flex: 1, minWidth: '240px', padding: '11px 14px', fontSize: '0.92rem' }}
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn btn-primary">
          {loading ? 'Đang lưu...' : 'Lưu'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginRight: '4px' }}>Gợi ý</span>
        {QUICK_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            disabled={loading}
            onClick={() => run(p.command)}
            className="btn"
            style={{ padding: '5px 12px', fontSize: '0.8rem', borderRadius: '999px' }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {results.length > 0 && (
        <div
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderLeft: '3px solid var(--success-color)',
            borderRadius: '10px',
            padding: '12px 14px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--success-color)' }}>Đã cập nhật</span>
            <button
              onClick={() => setResults([])}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.78rem' }}
            >
              Ẩn
            </button>
          </div>
          {results.map((line, i) => (
            <div key={i} style={{ fontSize: '0.84rem', color: 'var(--text-primary)', padding: '2px 0' }}>
              {line}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
