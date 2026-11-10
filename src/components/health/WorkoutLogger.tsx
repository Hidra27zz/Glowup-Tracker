'use client';

import { useState } from 'react';
import { Dumbbell, Send, Clock, Activity, Pencil, Trash2 } from 'lucide-react';
import { logWorkout, updateWorkout, deleteWorkout } from '@/lib/actions/health.actions';
import { Workout } from '@prisma/client';

interface Props {
  workouts?: Workout[];
}

export default function WorkoutLogger({ workouts = [] }: Props) {
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', type: 'Gym', duration: '30', notes: '' });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    const formData = new FormData(form);
    const title = formData.get('title') as string;
    const type = formData.get('type') as string;
    const duration = Number(formData.get('duration'));
    const rpe = formData.get('rpe') as string;
    
    await logWorkout(title, type, duration, `RPE: ${rpe}`);
    form.reset();
    setLoading(false);
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h3 style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Dumbbell size={20} color="#7b8cff" /> Combat & Workout Logger
        </h3>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>Ghi nhận cường độ tập luyện (RPE)</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input 
          name="title" 
          placeholder="Tên bài tập (VD: Boxing, LISS Cardio)" 
          required 
          style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: '#fff', outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            name="type" 
            style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: '#fff', outline: 'none' }}
          >
            <option value="Boxing" style={{ color: '#000' }}>Boxing</option>
            <option value="LISS Cardio" style={{ color: '#000' }}>LISS Cardio</option>
            <option value="HIIT" style={{ color: '#000' }}>HIIT</option>
            <option value="Chạy bộ" style={{ color: '#000' }}>Chạy bộ</option>
            <option value="Đạp xe" style={{ color: '#000' }}>Đạp xe</option>
            <option value="Kéo xà" style={{ color: '#000' }}>Kéo xà (Pull-ups)</option>
            <option value="Gym" style={{ color: '#000' }}>Tập Gym</option>
            <option value="Stretching" style={{ color: '#000' }}>Giãn Cơ</option>
            <option value="Yoga" style={{ color: '#000' }}>Yoga</option>
          </select>
          <input 
            name="duration" 
            type="number" 
            placeholder="Phút" 
            required 
            style={{ width: '80px', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: '#fff', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.9rem' }}>RPE (1-10):</span>
          <input 
            name="rpe" 
            type="range" 
            min="1" 
            max="10" 
            defaultValue="5"
            style={{ flex: 1, accentColor: '#7b8cff' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary" 
          style={{ width: '100%', display: 'flex', gap: '8px', background: '#7b8cff', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Đang lưu...' : 'Ghi Log'} <Send size={16} />
        </button>
      </form>

      {workouts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Lịch sử tập luyện</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
            {workouts.map((w) => (
              <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '8px' }}>
                {editingId === w.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} placeholder="Bài tập" style={{ flex: 2, padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: '0.82rem' }} />
                      <input type="number" value={editForm.duration} onChange={e => setEditForm({ ...editForm, duration: e.target.value })} placeholder="Phút" style={{ width: '64px', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: '0.82rem' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button type="button" onClick={async () => { await updateWorkout(w.id, { title: editForm.title, type: editForm.type, duration: Number(editForm.duration), notes: editForm.notes }); setEditingId(null); }} style={{ background: '#3dd68c', color: '#0f172a', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}>Lưu</button>
                      <button type="button" onClick={() => setEditingId(null)} style={{ background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.76rem', cursor: 'pointer' }}>Hủy</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Activity size={14} color="#7b8cff" /> {w.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {w.type} • {new Date(w.date).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                          <Clock size={12} /> {w.duration}p
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--warning-color)' }}>
                          {w.notes}
                        </div>
                      </div>
                      <button type="button" onClick={() => { setEditingId(w.id); setEditForm({ title: w.title, type: w.type, duration: String(w.duration), notes: w.notes || '' }); }} title="Sửa" style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}><Pencil size={13} /></button>
                      <button type="button" onClick={() => deleteWorkout(w.id)} title="Xóa" style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}><Trash2 size={13} /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
