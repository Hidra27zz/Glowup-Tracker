'use client';

import { useState } from 'react';
import {
  Map,
  Timer,
  Network,
  BookOpen,
  Mic,
  ChevronRight,
  Briefcase,
  Code,
  Library,
} from 'lucide-react';
import { DeepWorkSession, Skill, FlashcardDeck } from '@prisma/client';

import CareerBlueprint from './CareerBlueprint';
import MockInterviewRoom from './MockInterviewRoom';
import DeepWorkTimer from './DeepWorkTimer';
import SkillTree from './SkillTree';
import FlashcardVault from './FlashcardVault';
import InternshipPipeline from './InternshipPipeline';
import SnippetLibrary from './SnippetLibrary';
import CurriculumVault from './CurriculumVault';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────
interface Props {
  skills: Skill[];
  recentSessions: DeepWorkSession[];
  flashcardDecks: (FlashcardDeck & { cards: any[] })[];
  jobApplications: any[];
  codeSnippets: any[];
}

// ────────────────────────────────────────────────────────────────────────────
// Tab config
// ────────────────────────────────────────────────────────────────────────────
const TABS = [
  {
    id: 'curriculum',
    label: 'University Review',
    sublabel: 'Giáo trình & Mock Test',
    icon: Library,
    accent: '#3b82f6',
  },
  {
    id: 'blueprint',
    label: 'Career Mentor',
    sublabel: 'AI Lộ trình & Quiz',
    icon: Map,
    accent: '#a855f7',
  },
  {
    id: 'interview',
    label: 'Mock Interview',
    sublabel: 'Phòng phỏng vấn AI',
    icon: Mic,
    accent: '#ec4899',
  },
  {
    id: 'skills',
    label: 'Skill Tree',
    sublabel: 'Bản đồ kỹ năng',
    icon: Network,
    accent: '#38bdf8',
  },
  {
    id: 'deepwork',
    label: 'Deep Work',
    sublabel: 'Timer & Flow State',
    icon: Timer,
    accent: '#10b981',
  },
  {
    id: 'flashcards',
    label: 'Flashcards',
    sublabel: 'Kho thẻ ghi nhớ',
    icon: BookOpen,
    accent: '#f59e0b',
  },
  {
    id: 'pipeline',
    label: 'Job Pipeline',
    sublabel: 'Internship Kanban',
    icon: Briefcase,
    accent: '#f43f5e',
  },
  {
    id: 'snippets',
    label: 'Snippets',
    sublabel: 'Thư viện thuật toán',
    icon: Code,
    accent: '#8b5cf6',
  },
] as const;

type TabId = (typeof TABS)[number]['id'];

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────
export default function CareerHub({ skills, recentSessions, flashcardDecks, jobApplications, codeSnippets }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('curriculum');

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
          Career Hub
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
        }}
      >
        {activeTab === 'curriculum' && <CurriculumVault />}
        {activeTab === 'blueprint' && <CareerBlueprint />}
        {activeTab === 'interview' && <MockInterviewRoom />}
        {activeTab === 'skills' && <SkillTree skills={skills} />}
        {activeTab === 'deepwork' && <DeepWorkTimer recentSessions={recentSessions} />}
        {activeTab === 'flashcards' && <FlashcardVault decks={flashcardDecks} />}
        {activeTab === 'pipeline' && <InternshipPipeline applications={jobApplications} />}
        {activeTab === 'snippets' && <SnippetLibrary snippets={codeSnippets} />}
      </div>
    </div>
  );
}
