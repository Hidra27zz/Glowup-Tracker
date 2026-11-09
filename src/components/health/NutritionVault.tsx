'use client';

import React, { useState } from 'react';
import { logNutrition } from '@/lib/actions/health.actions';
import { smartAutoLogAction } from '@/app/dashboard-actions';

const QUICK_MEAL_TEMPLATES = [
  { label: 'Phở bò', calories: 480, protein: 26, carbs: 62, fat: 12 },
  { label: 'Cơm tấm sườn', calories: 650, protein: 32, carbs: 75, fat: 22 },
  { label: '200g Ức gà áp chảo', calories: 330, protein: 62, carbs: 0, fat: 7 },
  { label: '2 Quả trứng luộc', calories: 155, protein: 13, carbs: 1, fat: 11 },
  { label: 'Bánh mì thịt', calories: 380, protein: 16, carbs: 46, fat: 14 },
  { label: 'Salad Eat Clean', calories: 320, protein: 24, carbs: 22, fat: 14 },
  { label: '1 Muỗng Whey', calories: 120, protein: 25, carbs: 3, fat: 2 },
];

export default function NutritionVault({
  nutrition,
  todayNutrition,
  goalCal = 2200,
}: {
  nutrition?: any;
  todayNutrition?: any;
  goalCal?: number;
  budgetGoal?: number;
}) {
  const [showManual, setShowManual] = useState(false);
  const [aiFoodInput, setAiFoodInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const activeNutri = nutrition || todayNutrition;
  const cals = activeNutri?.calories || 0;
  const targetCals = goalCal || 2200;
  const calProgress = Math.min((cals / targetCals) * 100, 100);

  const p = activeNutri?.protein || 0;
  const c = activeNutri?.carbs || 0;
  const f = activeNutri?.fat || 0;

  const handleQuickTemplate = async (tpl: typeof QUICK_MEAL_TEMPLATES[0]) => {
    setIsLoading(true);
    try {
      await logNutrition(tpl.calories, 0, tpl.protein, tpl.carbs, tpl.fat);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiFoodInput.trim()) return;
    setIsLoading(true);
    try {
      await smartAutoLogAction(aiFoodInput);
      setAiFoodInput('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const cal = parseInt((fd.get('calories') as string) || '0', 10);
    const pro = parseFloat((fd.get('protein') as string) || '0');
    const carb = parseFloat((fd.get('carbs') as string) || '0');
    const fatVal = parseFloat((fd.get('fat') as string) || '0');
    setIsLoading(true);
    try {
      await logNutrition(cal, 0, pro, carb, fatVal);
      e.currentTarget.reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Dinh Dưỡng & Macro Tự Động</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
            Chọn món ăn 1-chạm hoặc nhập tên món để AI tự tính Calo & Protein
          </p>
        </div>
        <button
          onClick={() => setShowManual((m) => !m)}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-secondary)',
            padding: '5px 10px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
        >
          {showManual ? 'Ẩn nhập thủ công' : 'Tự nhập số'}
        </button>
      </div>

      {/* Calorie Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: 600 }}>Năng lượng hôm nay</span>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
            {cals} / {targetCals} kcal
          </span>
        </div>
        <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${calProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981, #3b82f6)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Macros Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 600 }}>PROTEIN</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '4px 0' }}>{Math.round(p)}g</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Mục tiêu: 150g</div>
        </div>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600 }}>CARBS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '4px 0' }}>{Math.round(c)}g</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Mục tiêu: 200g</div>
        </div>
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 130, 11, 0.2)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>FAT</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '4px 0' }}>{Math.round(f)}g</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Mục tiêu: 70g</div>
        </div>
      </div>

      {/* 1-Tap Food Chips (No Manual Calculation!) */}
      <div>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Bấm 1 chạm để cộng món ăn (Đã tính sẵn Calo & Protein):
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {QUICK_MEAL_TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickTemplate(tpl)}
              style={{
                padding: '6px 10px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
                color: '#e2e8f0',
                fontSize: '0.76rem',
                cursor: 'pointer',
              }}
            >
              {tpl.label} <span style={{ color: '#10b981', fontWeight: 700 }}>+{tpl.calories}cal / {tpl.protein}g P</span>
            </button>
          ))}
        </div>
      </div>

      {/* Natural Food Input */}
      <form onSubmit={handleAiEstimate} style={{ display: 'flex', gap: '8px' }}>
        <input
          value={aiFoodInput}
          onChange={(e) => setAiFoodInput(e.target.value)}
          placeholder='Nhập tên món vừa ăn (VD: "bún bò + sữa chua")...'
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--glass-border)',
            color: 'white',
            padding: '9px 12px',
            borderRadius: '8px',
            fontSize: '0.84rem',
          }}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="glass-button"
          style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
        >
          AI Tự Tính
        </button>
      </form>

      {/* Optional Manual Form */}
      {showManual && (
        <form
          onSubmit={handleManualSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            paddingTop: '12px',
            borderTop: '1px solid var(--glass-border)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input name="calories" type="number" placeholder="+ Calo (kcal)" required style={inputStyle} />
            <input name="protein" type="number" step="0.1" placeholder="+ Protein (g)" style={inputStyle} />
            <input name="carbs" type="number" step="0.1" placeholder="+ Carbs (g)" style={inputStyle} />
            <input name="fat" type="number" step="0.1" placeholder="+ Fat (g)" style={inputStyle} />
          </div>
          <button type="submit" disabled={isLoading} className="glass-button" style={{ justifyContent: 'center' }}>
            + Cộng Thủ Công
          </button>
        </form>
      )}
    </div>
  );
}

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--glass-border)',
  color: 'white',
  padding: '8px 12px',
  borderRadius: '6px',
  width: '100%',
};
