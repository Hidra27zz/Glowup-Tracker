'use client';

import { useState, useTransition } from 'react';
import { hydrate } from '@/app/dashboard-actions';
import { Droplet } from 'lucide-react';

export default function HydrationTracker({ initialWaterDrops }: { initialWaterDrops: number }) {
  const [isPending, startTransition] = useTransition();
  const [drops, setDrops] = useState(initialWaterDrops);

  const handleHydrate = () => {
    setDrops(prev => prev + 1); // Optimistic update
    startTransition(async () => {
      await hydrate();
    });
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.3s', boxShadow: 'inset 0 2px 20px rgba(255,255,255,0.02)' }}>
      <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Droplet size={18} color="#38bdf8" /> Hydration Tracker
      </h4>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        {[...Array(8)].map((_, i) => {
          const isActive = i < drops;
          return (
            <div key={i} style={{ 
              width: '32px', height: '42px', 
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', 
              background: isActive ? 'linear-gradient(180deg, #38bdf8, #2563eb)' : 'rgba(255,255,255,0.05)', 
              border: isActive ? 'none' : '1px dashed rgba(255,255,255,0.1)', 
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)', 
              transform: isActive && !isPending && i === drops - 1 ? 'scale(1.1)' : 'scale(1)',
              boxShadow: isActive ? '0 4px 12px rgba(56,189,248,0.4)' : 'none',
              opacity: isActive ? 1 : 0.5
            }}>
            </div>
          );
        })}
        <button onClick={handleHydrate} disabled={isPending} style={{ 
          background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(37,99,235,0.1))', 
          border: '1px solid rgba(56,189,248,0.4)', 
          color: '#38bdf8', 
          borderRadius: '50%', width: '42px', height: '42px', cursor: 'pointer', fontSize: '1.4rem', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '8px', 
          transition: 'all 0.2s',
          transform: isPending ? 'scale(0.95)' : 'scale(1)',
          opacity: isPending ? 0.7 : 1,
          boxShadow: '0 4px 12px rgba(56,189,248,0.2)'
        }}>
          +
        </button>
      </div>
    </div>
  );
}
