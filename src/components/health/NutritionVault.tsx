'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Apple, Plus } from 'lucide-react';
import { NutritionLog } from '@prisma/client';
import { logNutrition, updateUserSettings } from '@/lib/actions/health.actions';

interface Props {
  nutrition?: NutritionLog | null;
  goalCal: number;
  budgetGoal: number;
}

export default function NutritionVault({ nutrition, goalCal, budgetGoal }: Props) {
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const [isEditingGoals, setIsEditingGoals] = useState(false);

  const handleUpdateGoals = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const newCal = Number(formData.get('goalCal'));
    const newBudget = Number(formData.get('budgetGoal'));
    
    const updates: any = {};
    if (newCal > 0) updates.goalCal = newCal;
    if (newBudget > 0) updates.budgetGoal = newBudget;
    
    if (Object.keys(updates).length > 0) {
      await updateUserSettings(updates);
    }
    
    setIsEditingGoals(false);
    setLoading(false);
  };

  const currentCal = nutrition?.calories || 0;
  const remainingCal = Math.max(0, goalCal - currentCal);

  const data = [
    { name: 'Đã nạp', value: currentCal, color: 'var(--accent-color)' },
    { name: 'Còn lại', value: remainingCal, color: 'rgba(255,255,255,0.1)' }
  ];

  const budgetUsed = nutrition?.budgetUsed || 0;
  const budgetPercent = Math.min(100, (budgetUsed / budgetGoal) * 100);
  const isBudgetWarning = budgetPercent > 80;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const calories = Number(formData.get('calories'));
    const budget = Number(formData.get('budget')) || 0;
    const protein = Number(formData.get('protein')) || 0;
    const carbs = Number(formData.get('carbs')) || 0;
    const fat = Number(formData.get('fat')) || 0;
    
    await logNutrition(calories, budget, protein, carbs, fat);
    form.reset();
    setShowInput(false);
    setLoading(false);
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Apple size={20} color="var(--success-color)" /> Nutrition & Grocery Vault
        </h3>
        <button 
          onClick={() => setShowInput(!showInput)}
          className="btn btn-primary" 
          style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', gap: '4px', background: 'var(--success-color)' }}
        >
          <Plus size={14} /> Thêm Bữa Ăn
        </button>
      </div>

      {showInput && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              name="calories" 
              type="number" 
              placeholder="Calories" 
              required 
              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: '#fff', outline: 'none' }}
            />
            <input 
              name="budget" 
              type="number" 
              placeholder="Chi phí (VND)" 
              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: '#fff', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              name="protein" 
              type="number" 
              placeholder="Protein (g)" 
              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: '#fff', outline: 'none' }}
            />
            <input 
              name="carbs" 
              type="number" 
              placeholder="Carbs (g)" 
              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: '#fff', outline: 'none' }}
            />
            <input 
              name="fat" 
              type="number" 
              placeholder="Fat (g)" 
              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: '#fff', outline: 'none' }}
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ background: 'var(--success-color)', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Đang lưu...' : 'Lưu Bữa Ăn'}
          </button>
        </form>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: '120px', height: '120px', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={60}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{currentCal}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>/ {goalCal} kcal</span>
          </div>
        </div>

        <div style={{ flex: 1, marginLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Macro Bars */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
              <span style={{ color: '#60a5fa' }}>Protein</span>
              <span>{nutrition?.protein || 0}g</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, ((nutrition?.protein || 0) / 150) * 100)}%`, backgroundColor: '#60a5fa' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
              <span style={{ color: '#fb923c' }}>Carbs</span>
              <span>{nutrition?.carbs || 0}g</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, ((nutrition?.carbs || 0) / 250) * 100)}%`, backgroundColor: '#fb923c' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
              <span style={{ color: '#f43f5e' }}>Fat</span>
              <span>{nutrition?.fat || 0}g</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, ((nutrition?.fat || 0) / 65) * 100)}%`, backgroundColor: '#f43f5e' }} />
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Quỹ Đi Chợ Tuần</h4>
            <button 
              onClick={() => setIsEditingGoals(!isEditingGoals)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline', padding: 0 }}
            >
              {isEditingGoals ? 'Hủy' : 'Sửa mục tiêu'}
            </button>
          </div>
          
          {isEditingGoals && (
            <form onSubmit={handleUpdateGoals} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
              <input name="goalCal" type="number" defaultValue={goalCal} placeholder="Mục tiêu Calo/ngày" style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'transparent', color: '#fff', outline: 'none', fontSize: '0.8rem' }} />
              <input name="budgetGoal" type="number" defaultValue={budgetGoal} placeholder="Quỹ đi chợ (VND)" style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'transparent', color: '#fff', outline: 'none', fontSize: '0.8rem' }} />
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ background: 'var(--success-color)', opacity: loading ? 0.7 : 1, padding: '4px 8px', fontSize: '0.8rem' }}>
                {loading ? '...' : 'Lưu Mục Tiêu'}
              </button>
            </form>
          )}

          <div style={{ background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{ 
              height: '100%', 
              width: `${budgetPercent}%`, 
              backgroundColor: isBudgetWarning ? 'var(--warning-color)' : 'var(--success-color)',
              transition: 'width 0.3s ease, background-color 0.3s ease'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span>{budgetUsed.toLocaleString('vi-VN')}đ</span>
            <span style={{ color: 'var(--text-secondary)' }}>{budgetGoal.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
    </div>
  );
}
