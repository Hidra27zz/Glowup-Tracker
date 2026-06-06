'use client';

import { useState } from 'react';
import { Moon, CalendarHeart, Plus } from 'lucide-react';
import { SleepLog, BioCycle } from '@prisma/client';
import { logSleep, updateBioCycle } from '@/lib/actions/health.actions';

interface SleepProps {
  sleepLog?: SleepLog | null;
}

export function SleepArchitecture({ sleepLog }: SleepProps) {
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    const formData = new FormData(form);
    const dateStr = new Date().toISOString().split('T')[0];
    const sleepTime = `${dateStr}T${formData.get('sleepTime')}:00`;
    const wakeTime = `${dateStr}T${formData.get('wakeTime')}:00`;
    
    await logSleep(sleepTime, wakeTime);
    form.reset();
    setShowInput(false);
    setLoading(false);
  };

  const calculateDuration = () => {
    if (!sleepLog || !sleepLog.wakeTime) return null;
    const diff = new Date(sleepLog.wakeTime).getTime() - new Date(sleepLog.sleepTime).getTime();
    if (diff <= 0) return '0h';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const getQualityText = (score: number) => {
    if (score >= 8) return 'Tối ưu';
    if (score >= 5) return 'Bình thường';
    return 'Kém';
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Moon size={20} color="#3b82f6" /> Sleep Architecture
          </h3>
          {sleepLog && (
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Chất lượng: {sleepLog.qualityScore}/10 ({getQualityText(sleepLog.qualityScore || 0)})
            </p>
          )}
        </div>
        <button 
          onClick={() => setShowInput(!showInput)}
          className="btn btn-primary" 
          style={{ padding: '4px 8px', fontSize: '0.8rem', display: 'flex', gap: '4px', background: '#3b82f6' }}
        >
          <Plus size={14} /> Log
        </button>
      </div>

      {showInput && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input name="sleepTime" type="time" required style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: '#fff', outline: 'none' }} />
            <input name="wakeTime" type="time" required style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: '#fff', outline: 'none' }} />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ background: '#3b82f6', opacity: loading ? 0.7 : 1 }}>
            {loading ? '...' : 'Lưu'}
          </button>
        </form>
      )}
      
      {sleepLog && sleepLog.wakeTime ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Đi ngủ</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
              {new Date(sleepLog.sleepTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div style={{ height: '2px', background: 'var(--glass-border)', flex: 1, margin: '0 12px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', color: '#3b82f6', whiteSpace: 'nowrap' }}>
              {calculateDuration()}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Thức dậy</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
              {new Date(sleepLog.wakeTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      ) : (
        !showInput && <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '10px 0' }}>Chưa có dữ liệu giấc ngủ hôm nay.</div>
      )}
    </div>
  );
}

interface BioProps {
  cycle?: BioCycle | null;
}

export function BioCycleMap({ cycle }: BioProps) {
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    const formData = new FormData(form);
    const startDate = formData.get('startDate') as string;
    const cycleLength = Number(formData.get('cycleLength'));
    
    await updateBioCycle(startDate, cycleLength);
    form.reset();
    setShowInput(false);
    setLoading(false);
  };

  const getCyclePhase = () => {
    if (!cycle) return { phase: 'Chưa xác định', lowEnergyDays: 0, waterRetention: 'Chưa rõ' };
    const daysSinceStart = Math.floor((new Date().getTime() - new Date(cycle.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const cycleLen = cycle.cycleLength || 28;
    const currentDay = (daysSinceStart % cycleLen) + 1;
    
    let phase = '';
    let waterRetention = '';
    if (currentDay <= 5) {
      phase = 'Menstrual (Năng lượng thấp)';
      waterRetention = 'Thấp';
    } else if (currentDay <= 14) {
      phase = 'Follicular (Năng lượng cao)';
      waterRetention = 'Thấp';
    } else if (currentDay <= 21) {
      phase = 'Ovulation (Cao nhất)';
      waterRetention = 'Trung bình';
    } else {
      phase = 'Luteal (Năng lượng giảm)';
      waterRetention = 'Cao';
    }

    const nextLowEnergy = cycleLen - currentDay + 1; // Until next Menstrual phase
    return { phase, lowEnergyDays: nextLowEnergy, waterRetention };
  };

  const cycleData = getCyclePhase();

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarHeart size={20} color="#ec4899" /> Women's Bio-Cycle
          </h3>
          {cycle && (
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Pha hiện tại: {cycleData.phase}</p>
          )}
        </div>
        <button 
          onClick={() => setShowInput(!showInput)}
          className="btn btn-primary" 
          style={{ padding: '4px 8px', fontSize: '0.8rem', display: 'flex', gap: '4px', background: '#ec4899' }}
        >
          <Plus size={14} /> Log
        </button>
      </div>
      
      {showInput && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Ngày bắt đầu kỳ kinh gần nhất:</label>
            <input name="startDate" type="date" required style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: '#fff', outline: 'none', colorScheme: 'dark' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Độ dài chu kỳ trung bình (ngày):</label>
            <input name="cycleLength" type="number" defaultValue="28" required placeholder="VD: 28" style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: '#fff', outline: 'none' }} />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ background: '#ec4899', opacity: loading ? 0.7 : 1, marginTop: '4px' }}>
            {loading ? 'Đang lưu...' : 'Lưu thông tin chu kỳ'}
          </button>
        </form>
      )}

      {cycle ? (
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Kỳ kinh tiếp theo (năng lượng tụt):</span>
            <span style={{ color: 'var(--warning-color)', fontWeight: 500 }}>Sau {cycleData.lowEnergyDays} ngày</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Nguy cơ tích nước cơ thể:</span>
            <span style={{ color: cycleData.waterRetention === 'Cao' ? 'var(--warning-color)' : 'var(--success-color)' }}>{cycleData.waterRetention}</span>
          </div>
        </div>
      ) : (
         !showInput && <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '10px 0' }}>Chưa có dữ liệu chu kỳ. Hãy nhấn nút Log để bắt đầu.</div>
      )}
    </div>
  );
}
