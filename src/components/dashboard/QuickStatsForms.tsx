'use client';

import { useState, useTransition } from 'react';
import { quickAddCalories, quickAddExpense, quickAddWeight, quickAddDeepWork } from '@/app/dashboard-actions';
import { Plus, Check, Timer, Scale } from 'lucide-react';

export default function QuickStatsForms() {
  const [isPending, startTransition] = useTransition();
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
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

  const handleDeepWork = (minutes: number) => {
    startTransition(async () => {
      await quickAddDeepWork(minutes);
      showToast(`+ ${minutes} phút Deep Work!`);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
      {toastMsg && (
        <div style={{ position: 'absolute', top: '-40px', right: 0, background: 'rgba(16,185,129,0.95)', color: '#fff', padding: '6px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', zIndex: 10 }}>
          <Check size={14} /> {toastMsg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Add Calories */}
        <form onSubmit={handleAddCalo} style={{ display: 'flex', gap: '8px' }}>
          <input name="amount" type="number" placeholder="Nhập Calo (vd: 300)" required disabled={isPending} style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
          <button type="submit" disabled={isPending} style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '0 20px', borderRadius: '12px', cursor: isPending ? 'wait' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
            <Plus size={18} /> Calo
          </button>
        </form>

        {/* Add Weight */}
        <form onSubmit={handleAddWeight} style={{ display: 'flex', gap: '8px' }}>
          <input name="weight" type="number" step="0.1" placeholder="Cân nặng hôm nay (kg)" required disabled={isPending} style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
          <button type="submit" disabled={isPending} style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', padding: '0 20px', borderRadius: '12px', cursor: isPending ? 'wait' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
            <Scale size={18} /> Kg
          </button>
        </form>
      </div>

      {/* Add Expense */}
      <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input name="amount" type="number" placeholder="Tiền (VND)" required disabled={isPending} style={{ flex: 1, minWidth: 0, width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} />
          <input name="notes" placeholder="Mua gì?" required disabled={isPending} style={{ flex: 1, minWidth: 0, width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <button type="submit" disabled={isPending} style={{ width: '100%', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', padding: '12px', borderRadius: '12px', cursor: isPending ? 'wait' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}>
          <Plus size={18} /> Lưu Chi Tiêu
        </button>
      </form>

      {/* Deep Work */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <Timer size={18} color="#a78bfa" />
        <span style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 600, flex: 1 }}>Deep Work Sprint</span>
        <button onClick={() => handleDeepWork(25)} disabled={isPending} style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)', padding: '6px 12px', borderRadius: '8px', cursor: isPending ? 'wait' : 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>+ 25m</button>
        <button onClick={() => handleDeepWork(50)} disabled={isPending} style={{ background: 'rgba(167,139,250,0.2)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.4)', padding: '6px 12px', borderRadius: '8px', cursor: isPending ? 'wait' : 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>+ 50m</button>
      </div>
    </div>
  );
}
