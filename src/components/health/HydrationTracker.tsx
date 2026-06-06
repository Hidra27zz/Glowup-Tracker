'use client';

import { useState } from 'react';
import { Droplet } from 'lucide-react';
import { updateHydration, updateUserSettings } from '@/lib/actions/health.actions';

interface Props {
  initialHydration: number;
  goal: number;
}

export default function HydrationTracker({ initialHydration, goal }: Props) {
  const [hydration, setHydration] = useState(initialHydration);
  const [loading, setLoading] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const handleUpdateGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const newGoal = Number(formData.get('hydrationGoal'));
    if (newGoal > 0) {
      await updateUserSettings({ hydrationGoal: newGoal });
    }
    setIsEditingGoal(false);
    setLoading(false);
  };

  const handleAddWater = async () => {
    // Optimistic update
    setHydration(prev => prev + 1);
    await updateHydration(1);
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplet size={20} color="var(--accent-color)" /> Hydration Tracker
          </h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Tiến độ: {hydration}/{goal} ly (250ml/ly)
          </p>
        </div>
        <button 
          onClick={() => setIsEditingGoal(!isEditingGoal)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
        >
          {isEditingGoal ? 'Hủy' : 'Sửa mục tiêu'}
        </button>
      </div>

      {isEditingGoal && (
        <form onSubmit={handleUpdateGoal} style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
          <input 
            name="hydrationGoal" 
            type="number" 
            defaultValue={goal}
            style={{ flex: 1, padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'transparent', color: '#fff', outline: 'none', fontSize: '0.8rem' }}
          />
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.8rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? '...' : 'Lưu'}
          </button>
        </form>
      )}

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {Array.from({ length: Math.max(goal, hydration) }).map((_, i) => {
          const isFilled = i < hydration;
          return (
            <button
              key={i}
              onClick={handleAddWater}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                transform: isFilled ? 'scale(1.1)' : 'scale(1)',
                outline: 'none'
              }}
              title="Uống thêm nước"
            >
              <Droplet 
                size={32} 
                color={isFilled ? 'var(--accent-color)' : 'var(--glass-border)'}
                fill={isFilled ? 'var(--accent-color)' : 'transparent'}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
