'use client';

import { useState } from 'react';
import { Activity, HeartPulse, Moon, Apple, ChevronRight } from 'lucide-react';
import BodyRecompositionChart from '@/components/health/BodyRecompositionChart';
import NutritionVault from '@/components/health/NutritionVault';
import HydrationTracker from '@/components/health/HydrationTracker';
import WorkoutLogger from '@/components/health/WorkoutLogger';
import { SleepArchitecture, BioCycleMap } from '@/components/health/SleepAndCycle';
import WorkoutRecommendations from '@/components/health/WorkoutRecommendations';
import FastingTimer from '@/components/health/FastingTimer';
import FitnessBlueprint from '@/components/health/FitnessBlueprint';
import ErgonomicsGuard from '@/components/health/ErgonomicsGuard';
import ActivityTracker from '@/components/health/ActivityTracker';

interface Props {
  data: any;
  settings: any;
}

const TABS = [
  {
    id: 'fitness',
    label: 'Fitness & Workout',
    sublabel: 'Blueprint & Tập luyện',
    icon: Activity,
    accent: '#ef4444',
  },
  {
    id: 'metrics',
    label: 'Body Metrics',
    sublabel: 'Cân nặng & Chỉ số',
    icon: HeartPulse,
    accent: '#3b82f6',
  },
  {
    id: 'nutrition',
    label: 'Nutrition & Fasting',
    sublabel: 'Dinh dưỡng & Nước',
    icon: Apple,
    accent: '#10b981',
  },
  {
    id: 'recovery',
    label: 'Sleep & Recovery',
    sublabel: 'Phục hồi & Nhịp sinh học',
    icon: Moon,
    accent: '#a855f7',
  },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function HealthHub({ data, settings }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('fitness');
  const currentTab = TABS.find(t => t.id === activeTab)!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', minHeight: '80vh' }}>
      
      {/* ── Top navigation bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: '4px',
          background: 'rgba(15,23,42,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '20px 20px 0 0',
          overflow: 'hidden',
          padding: '6px',
        }}
      >
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '14px 8px',
                borderRadius: '14px',
                border: 'none',
                background: active
                  ? `linear-gradient(135deg, ${tab.accent}22, ${tab.accent}10)`
                  : 'transparent',
                borderBottom: active ? `2px solid ${tab.accent}` : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none',
              }}
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <Icon
                size={18}
                color={active ? tab.accent : '#64748b'}
                strokeWidth={active ? 2.5 : 1.5}
              />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: active ? 700 : 400,
                  color: active ? tab.accent : '#64748b',
                  letterSpacing: '0.3px',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Breadcrumb strip ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 24px',
          background: 'rgba(15,23,42,0.5)',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span style={{ fontSize: '0.78rem', color: '#475569', letterSpacing: '0.3px' }}>
          Health Hub
        </span>
        <ChevronRight size={12} color="#334155" />
        <span
          style={{
            fontSize: '0.78rem',
            color: currentTab.accent,
            fontWeight: 600,
            letterSpacing: '0.3px',
          }}
        >
          {currentTab.label}
        </span>
        <span style={{ fontSize: '0.78rem', color: '#334155', marginLeft: '4px' }}>
          — {currentTab.sublabel}
        </span>
      </div>

      {/* ── Content panel ── */}
      <div
        style={{
          flex: 1,
          background: 'rgba(15,23,42,0.4)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderTop: 'none',
          borderRadius: '0 0 20px 20px',
          padding: '24px',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        {/* ── Always Visible Widgets ── */}
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <ErgonomicsGuard />
        </div>

        {activeTab === 'fitness' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ActivityTracker />
            <FitnessBlueprint initialBlueprint={settings.activeBlueprint} />
            <WorkoutLogger workouts={data.recentWorkouts} />
            <WorkoutRecommendations cycle={data.latestBioCycle} sleepLog={data.latestSleepLog} workouts={data.recentWorkouts} />
          </div>
        )}

        {activeTab === 'metrics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <BodyRecompositionChart metrics={data.weightLogs} goal={settings.bodyRecompGoal} />
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1.5fr 1fr', alignItems: 'start' }}>
            <NutritionVault nutrition={data.todayNutrition} goalCal={settings.goalCal} budgetGoal={settings.budgetGoal} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <FastingTimer fastingStart={settings.fastingStart} />
              <HydrationTracker initialHydration={data.todayHydration} goal={settings.hydrationGoal} />
            </div>
          </div>
        )}

        {activeTab === 'recovery' && (
          <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
            <SleepArchitecture sleepLog={data.latestSleepLog} />
            <BioCycleMap cycle={data.latestBioCycle} />
          </div>
        )}
      </div>
    </div>
  );
}
