'use client';

import { useState, useEffect } from 'react';
import { Armchair, Play, Square, RotateCcw, X, ShieldAlert } from 'lucide-react';

export default function ErgonomicsGuard() {
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      setShowPopup(true);
      if (interval) clearInterval(interval);
      // Play a sound if possible
      try {
        const audio = new Audio('/alarm.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (e) {}
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(90 * 60);
    setShowPopup(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(56,189,248,0.2)', padding: '12px', borderRadius: '50%' }}>
            <Armchair size={24} color="#38bdf8" />
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px 0', color: '#38bdf8', fontSize: '1.1rem' }}>Ergonomics Guard</h3>
            <p style={{ margin: 0, color: '#bae6fd', fontSize: '0.9rem' }}>Bảo vệ cột sống. Đứng dậy, vươn vai sau mỗi 90 phút làm việc.</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '16px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: timeLeft === 0 ? '#ef4444' : '#fff', fontFamily: 'monospace' }}>
            {formatTime(timeLeft)}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={toggleTimer} style={{ background: isActive ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)', border: `1px solid ${isActive ? '#ef4444' : '#10b981'}`, color: isActive ? '#fca5a5' : '#6ee7b7', padding: '10px', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}>
              {isActive ? <Square size={20} /> : <Play size={20} />}
            </button>
            <button onClick={resetTimer} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '10px', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}>
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </div>

      {showPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95))', border: '1px solid rgba(239,68,68,0.5)', padding: '40px', borderRadius: '24px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 20px 40px rgba(239,68,68,0.2)', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <ShieldAlert size={64} color="#ef4444" style={{ animation: 'bounce 2s infinite' }} />
            <h2 style={{ margin: 0, color: '#fff', fontSize: '1.8rem', fontWeight: 800 }}>Đứng dậy ngay!</h2>
            <p style={{ margin: 0, color: '#fca5a5', fontSize: '1.1rem', lineHeight: 1.5 }}>
              Bạn đã ngồi quá 90 phút. Hãy đứng dậy, uống nước, vươn vai và nhìn ra xa 20 giây để bảo vệ cột sống và mắt.
            </p>
            <button onClick={resetTimer} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', marginTop: '12px', width: '100%', transition: 'all 0.2s' }}>
              Đã hiểu & Bắt đầu lại
            </button>
          </div>
        </div>
      )}
    </>
  );
}
