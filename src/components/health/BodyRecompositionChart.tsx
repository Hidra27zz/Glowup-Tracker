'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Plus } from 'lucide-react';
import { BodyMetric } from '@prisma/client';
import { addWeightLog, updateUserSettings } from '@/lib/actions/health.actions';

interface Props {
  metrics: BodyMetric[];
  goal: string;
}

export default function BodyRecompositionChart({ metrics, goal }: Props) {
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  
  const [goalText, setGoalText] = useState(goal);
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const saveGoal = async (newGoal: string) => {
    if (!newGoal) return;
    setGoalText(newGoal);
    setIsEditingGoal(false);
    await updateUserSettings({ bodyRecompGoal: newGoal });
  };

  const data = metrics.map(m => ({
    name: new Date(m.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
    weight: m.weight,
    bodyFat: m.bodyFat
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    const formData = new FormData(form);
    const weight = Number(formData.get('weight'));
    const bodyFat = formData.get('bodyFat') ? Number(formData.get('bodyFat')) : undefined;
    const chest = formData.get('chest') ? Number(formData.get('chest')) : undefined;
    const waist = formData.get('waist') ? Number(formData.get('waist')) : undefined;
    const hips = formData.get('hips') ? Number(formData.get('hips')) : undefined;
    
    await addWeightLog(weight, bodyFat, chest, waist, hips);
    form.reset();
    setShowInput(false);
    setLoading(false);
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontSize: '1.2rem' }}>
            <div style={{ background: 'rgba(59,130,246,0.15)', padding: '8px', borderRadius: '10px' }}>
              <Activity size={22} color="#3b82f6" />
            </div>
            Body Recomposition
          </h3>
          {isEditingGoal ? (
            <input 
              defaultValue={goalText === 'Cài đặt mục tiêu cân nặng' ? '' : goalText} 
              onBlur={(e) => saveGoal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveGoal(e.currentTarget.value)}
              autoFocus
              placeholder="VD: 60kg -> 48kg"
              style={{ fontSize: '0.9rem', padding: '6px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(59,130,246,0.4)', outline: 'none' }}
            />
          ) : (
            <p onClick={() => setIsEditingGoal(true)} style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', cursor: 'pointer', borderBottom: '1px dashed rgba(148,163,184,0.5)', display: 'inline-block' }} title="Nhấn để sửa">
              Mục tiêu: {goalText}
            </p>
          )}
        </div>
        <button 
          onClick={() => setShowInput(!showInput)}
          style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', padding: '8px 14px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <Plus size={16} /> Ghi Log
        </button>
      </div>

      {showInput && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', animation: 'fadeIn 0.2s' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input name="weight" type="number" step="0.1" placeholder="Cân nặng (kg)" required style={{ flex: '1 1 120px', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', fontSize: '0.9rem' }} />
            <input name="bodyFat" type="number" step="0.1" placeholder="Mỡ (%)" style={{ flex: '1 1 120px', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', fontSize: '0.9rem' }} />
            <input name="chest" type="number" step="0.1" placeholder="Ngực (cm)" style={{ flex: '1 1 100px', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', fontSize: '0.9rem' }} />
            <input name="waist" type="number" step="0.1" placeholder="Eo (cm)" style={{ flex: '1 1 100px', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', fontSize: '0.9rem' }} />
            <input name="hips" type="number" step="0.1" placeholder="Hông (cm)" style={{ flex: '1 1 100px', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', fontSize: '0.9rem' }} />
          </div>
          <button type="submit" disabled={loading} style={{ background: '#3b82f6', color: '#fff', fontWeight: 700, border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', alignSelf: 'flex-start', marginTop: '4px' }}>
            {loading ? 'Đang lưu...' : 'Lưu chỉ số đo'}
          </button>
        </form>
      )}
      
      <div style={{ width: '100%', height: '350px' }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} dx={-10} />
              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} dx={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#fff', fontSize: '0.9rem' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontSize: '0.85rem' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="weight" name="Cân nặng (kg)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              <Line yAxisId="right" type="monotone" dataKey="bodyFat" name="Mỡ (%)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '0.9rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
            Chưa có dữ liệu. Hãy ghi log cân nặng đầu tiên!
          </div>
        )}
      </div>
    </div>
  );
}
