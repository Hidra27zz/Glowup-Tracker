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
  const [smartFields, setSmartFields] = useState({
    specific: 'Giảm mỡ tăng cơ săn chắc',
    currentKg: metrics[metrics.length - 1]?.weight ? String(metrics[metrics.length - 1].weight) : '55',
    targetKg: '48',
    actionPlan: 'Tập 4 buổi/tuần + Thâm hụt 300 kcal/ngày',
    deadline: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
  });

  const saveSmartBodyGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = `[SMART] ${smartFields.specific}: ${smartFields.currentKg}kg → ${smartFields.targetKg}kg | Kế hoạch: ${smartFields.actionPlan} | Hạn: ${new Date(smartFields.deadline).toLocaleDateString('vi-VN')}`;
    setGoalText(formatted);
    setIsEditingGoal(false);
    await updateUserSettings({ bodyRecompGoal: formatted });
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
            <form onSubmit={saveSmartBodyGoal} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.4)', marginTop: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 700 }}>Đặt mục tiêu SMART (Specific - Measurable - Achievable - Time-bound)</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input value={smartFields.specific} onChange={e => setSmartFields({...smartFields, specific: e.target.value})} placeholder="[S] Cụ thể (VD: Giảm mỡ bụng)" required style={{ flex: '2 1 160px', padding: '6px 10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem' }} />
                <input type="number" step="0.1" value={smartFields.currentKg} onChange={e => setSmartFields({...smartFields, currentKg: e.target.value})} placeholder="Hiện tại (kg)" required style={{ width: '90px', padding: '6px 10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem' }} />
                <input type="number" step="0.1" value={smartFields.targetKg} onChange={e => setSmartFields({...smartFields, targetKg: e.target.value})} placeholder="[M] Đích (kg)" required style={{ width: '90px', padding: '6px 10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input value={smartFields.actionPlan} onChange={e => setSmartFields({...smartFields, actionPlan: e.target.value})} placeholder="[A/R] Hành động khả thi" required style={{ flex: '2 1 180px', padding: '6px 10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem' }} />
                <input type="date" value={smartFields.deadline} onChange={e => setSmartFields({...smartFields, deadline: e.target.value})} required style={{ padding: '6px 10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', colorScheme: 'dark' }} />
                <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}>Lưu SMART</button>
                <button type="button" onClick={() => setIsEditingGoal(false)} style={{ background: 'transparent', color: '#94a3b8', border: 'none', padding: '6px 10px', cursor: 'pointer', fontSize: '0.82rem' }}>Hủy</button>
              </div>
            </form>
          ) : (
            <p onClick={() => setIsEditingGoal(true)} style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', cursor: 'pointer', borderBottom: '1px dashed rgba(148,163,184,0.5)', display: 'inline-block' }} title="Nhấn để thiết lập theo chuẩn SMART">
              Mục tiêu SMART: {goalText} ✎
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
