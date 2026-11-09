'use client';

import { useState, useTransition } from 'react';
import { quickAddCalories, quickAddExpense, quickAddWeight } from '@/app/dashboard-actions';
import { Plus, Check, Scale, ChevronDown, ChevronUp } from 'lucide-react';

export default function QuickStatsForms() {
  const [isPending, startTransition] = useTransition();
  const [toastMsg, setToastMsg] = useState('');
  const [showManualInputs, setShowManualInputs] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const quickCalo = (amount: number, label: string) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set('amount', String(amount));
      await quickAddCalories(fd);
      showToast(`+${amount} kcal (${label})`);
    });
  };

  const quickSpend = (amount: number, notes: string) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set('amount', String(amount));
      fd.set('notes', notes);
      await quickAddExpense(fd);
      showToast(`Đã ghi -${(amount / 1000).toFixed(0)}k (${notes})`);
    });
  };

  const handleAddCalo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    startTransition(async () => {
      await quickAddCalories(new FormData(form));
      form.reset();
      showToast('+ Calo thành công!');
    });
  };

  const handleAddExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    startTransition(async () => {
      await quickAddExpense(new FormData(form));
      form.reset();
      showToast('+ Chi tiêu thành công!');
    });
  };

  const handleAddWeight = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    startTransition(async () => {
      await quickAddWeight(new FormData(form));
      form.reset();
      showToast('Đã lưu Cân nặng hôm nay!');
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            top: '-38px',
            right: 0,
            background: 'rgba(61, 214, 140,0.95)',
            color: '#fff',
            padding: '5px 14px',
            borderRadius: '10px',
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 10,
          }}
        >
          <Check size={14} /> {toastMsg}
        </div>
      )}

      {/* 1-Tap Quick Chips for Calories & Expense */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        <button
          type="button"
          disabled={isPending}
          onClick={() => quickCalo(450, 'Bữa nhẹ / Sáng')}
          style={chipStyle('#3dd68c')}
        >
          +450 kcal (Bữa sáng)
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => quickCalo(600, 'Bữa chính')}
          style={chipStyle('#3dd68c')}
        >
          +600 kcal (Bữa chính)
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => quickSpend(30000, 'Cà phê / Nước')}
          style={chipStyle('#f5b94a')}
        >
          -30k Cà phê
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => quickSpend(50000, 'Ăn uống')}
          style={chipStyle('#f5b94a')}
        >
          -50k Ăn trưa
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowManualInputs((v) => !v)}
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'var(--text-secondary)',
          borderRadius: '10px',
          padding: '7px 12px',
          fontSize: '0.78rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>Nhập số tùy chỉnh (Calo / Cân nặng / Chi tiêu)</span>
        {showManualInputs ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {showManualInputs && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
          <form onSubmit={handleAddCalo} style={{ display: 'flex', gap: '8px' }}>
            <input
              name="amount"
              type="number"
              placeholder="Nhập Calo (vd: 300)"
              required
              disabled={isPending}
              style={inputStyle}
            />
            <button type="submit" disabled={isPending} style={btnStyle('#3dd68c')}>
              <Plus size={16} /> Calo
            </button>
          </form>

          <form onSubmit={handleAddWeight} style={{ display: 'flex', gap: '8px' }}>
            <input
              name="weight"
              type="number"
              step="0.1"
              placeholder="Cân nặng hôm nay (kg)"
              required
              disabled={isPending}
              style={inputStyle}
            />
            <button type="submit" disabled={isPending} style={btnStyle('#6cc4ff')}>
              <Scale size={16} /> Kg
            </button>
          </form>

          <form onSubmit={handleAddExpense} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              name="amount"
              type="number"
              placeholder="Tiền (VND)"
              required
              disabled={isPending}
              style={{ ...inputStyle, flex: 1, minWidth: '110px' }}
            />
            <input
              name="notes"
              placeholder="Mua gì?"
              required
              disabled={isPending}
              style={{ ...inputStyle, flex: 1, minWidth: '110px' }}
            />
            <button type="submit" disabled={isPending} style={btnStyle('#f5b94a')}>
              <Plus size={16} /> Lưu
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const chipStyle = (color: string): React.CSSProperties => ({
  padding: '6px 10px',
  borderRadius: '10px',
  border: `1px solid ${color}40`,
  background: `${color}15`,
  color: '#e2e8f0',
  fontSize: '0.76rem',
  fontWeight: 600,
  cursor: 'pointer',
});

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '9px 12px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(0,0,0,0.3)',
  color: '#fff',
  fontSize: '0.85rem',
  outline: 'none',
};

const btnStyle = (color: string): React.CSSProperties => ({
  background: `${color}22`,
  color,
  border: `1px solid ${color}44`,
  padding: '0 14px',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.82rem',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});
