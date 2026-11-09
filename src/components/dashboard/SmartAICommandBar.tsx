'use client';

import React, { useState } from 'react';
import { smartAutoLogAction } from '@/app/dashboard-actions';

const ONE_TAP_PRESETS = [
  {
    label: '🍜 Phở bò sáng (45k)',
    command: 'Ăn sáng phở bò 45k, uống 1 ly nước',
    hint: '+480 kcal, 26g P, -45k, +1 ly nước',
  },
  {
    label: '🍱 Cơm trưa văn phòng (50k)',
    command: 'Ăn cơm trưa văn phòng 50k, uống 1 ly nước',
    hint: '+580 kcal, 28g P, -50k, +1 ly nước',
  },
  {
    label: '🥗 Eat Clean (Ức gà + Trứng)',
    command: 'Ăn ức gà và trứng luộc',
    hint: '+485 kcal, 75g Protein tự động tính',
  },
  {
    label: '☕ Cà phê sữa (30k)',
    command: 'Uống cà phê sữa 30k',
    hint: '+160 kcal, -30k chi tiêu',
  },
  {
    label: '💧 +2 Ly nước lọc',
    command: 'Uống 2 ly nước',
    hint: 'Cập nhật ngay chỉ số Hydration',
  },
  {
    label: '🏋️ Tập luyện 45 phút',
    command: 'Tập gym 45 phút, uống 2 ly nước',
    hint: '+45p tập luyện (~270 kcal), +2 ly nước',
  },
];

export default function SmartAICommandBar() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const handleExecute = async (textToRun: string) => {
    if (!textToRun.trim() || loading) return;
    setLoading(true);
    try {
      const res = await smartAutoLogAction(textToRun);
      if (res.success) {
        setResults(res.summary);
        setInput('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.14), rgba(59, 130, 246, 0.08), rgba(16, 185, 129, 0.06))',
        border: '1px solid rgba(139, 92, 246, 0.35)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.28)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
            }}
          >
            ✨
          </span>
          <div>
            <h2 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0, color: '#fff' }}>
              Trợ Lý AI Tự Động Ghi Nhận & Tính Toán (1-Chạm)
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
              Không cần tự tính Calo, Macro hay nhập nhiều biểu mẫu — chỉ cần gõ 1 câu tự nhiên hoặc bấm nút 1-chạm bên dưới.
            </p>
          </div>
        </div>
      </div>

      {/* Natural Language AI Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleExecute(input);
        }}
        style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='VD: "Sáng ăn phở bò 45k, uống 2 ly nước, chiều họp nhóm lúc 15h" hoặc "Ăn ức gà + 2 trứng, tập gym 30 phút"...'
          style={{
            flex: 1,
            minWidth: '260px',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            background: 'rgba(10, 11, 18, 0.75)',
            color: '#fff',
            fontSize: '0.92rem',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '12px 22px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: loading ? 'wait' : 'pointer',
            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.35)',
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? '⏳ Đang tự tính & lưu...' : '⚡ AI Tự Tính & Lưu Ngay'}
        </button>
      </form>

      {/* 1-Tap Quick Routine Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          ⚡ Ghi nhanh 1-chạm:
        </span>
        {ONE_TAP_PRESETS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            disabled={loading}
            onClick={() => handleExecute(preset.command)}
            title={preset.hint}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#e2e8f0',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Feedback Banner */}
      {results.length > 0 && (
        <div
          style={{
            marginTop: '14px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>
              ✅ Đã tự động tính toán và cập nhật vào hệ thống:
            </span>
            <button
              onClick={() => setResults([])}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              Đóng ✕
            </button>
          </div>
          {results.map((line, i) => (
            <div key={i} style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>
              • {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
