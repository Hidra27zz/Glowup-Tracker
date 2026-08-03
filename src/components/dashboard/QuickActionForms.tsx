'use client';

import { useState, useTransition } from 'react';
import { quickLog, triggerSOS } from '@/app/dashboard-actions';
import { ArrowRight, ShieldAlert, Check } from 'lucide-react';

export default function QuickActionForms() {
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleQuickLog = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    startTransition(async () => {
      await quickLog(formData);
      form.reset();
      showToast('Đã lưu vào bộ nhớ!');
    });
  };

  const handleSOS = () => {
    startTransition(async () => {
      await triggerSOS();
      showToast('Đã kích hoạt hệ thống SOS!');
    });
  };

  return (
    <div style={{ flex: 1, background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '16px', display: 'flex', alignItems: 'center', position: 'relative', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(16, 185, 129, 0.95)', color: '#fff', padding: '10px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(16,185,129,0.3)', animation: 'slideDown 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', zIndex: 10, fontWeight: 600, fontSize: '0.95rem' }}>
          <Check size={18} /> {toastMessage}
        </div>
      )}

      <form onSubmit={handleQuickLog} style={{ display: 'flex', width: '100%', gap: '12px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input name="content" placeholder="Gõ / để dùng lệnh hoặc nhập nhật ký nhanh (Brain Dump)..." required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }} disabled={isPending} />
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '8px', pointerEvents: 'none' }}>↵ Enter</div>
        </div>
        
        <button type="submit" disabled={isPending} style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', border: '1px solid rgba(59,130,246,0.5)', padding: '0 24px', borderRadius: '16px', fontWeight: 600, cursor: isPending ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', opacity: isPending ? 0.7 : 1, boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
          <ArrowRight size={20} /> {isPending ? 'Đang gửi...' : 'Log'}
        </button>
      </form>
      
      <button onClick={handleSOS} disabled={isPending} style={{ marginLeft: '12px', background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.05))', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '16px 24px', borderRadius: '16px', cursor: isPending ? 'wait' : 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', opacity: isPending ? 0.7 : 1, boxShadow: 'inset 0 2px 10px rgba(239,68,68,0.1)' }}>
        <ShieldAlert size={20} /> SOS
      </button>

      <style>{`
        @keyframes slideDown {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
