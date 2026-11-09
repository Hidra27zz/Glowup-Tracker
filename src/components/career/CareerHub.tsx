'use client';

import React, { useState } from 'react';
import SkillTree from './SkillTree';
import DeepWorkTimer from './DeepWorkTimer';
import FlashcardVault from './FlashcardVault';
import InternshipPipeline from './InternshipPipeline';
import SnippetLibrary from './SnippetLibrary';
import CurriculumVault from './CurriculumVault';
import CareerBlueprint from './CareerBlueprint';
import MockInterviewRoom from './MockInterviewRoom';

type Workspace = 'learning' | 'ai_coach' | 'focus' | 'portfolio';

interface CareerHubProps {
  skills: any[];
  recentSessions: any[];
  flashcardDecks: any[];
  jobApplications: any[];
  codeSnippets: any[];
}

function SubTabs<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { id: T; label: string }[];
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        gap: '2px',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '3px',
        flexWrap: 'wrap',
      }}
    >
      {items.map((it) => {
        const active = value === it.id;
        return (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              background: active ? 'var(--surface-3)' : 'transparent',
              color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: active ? 600 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

export default function CareerHub({
  skills,
  recentSessions,
  flashcardDecks,
  jobApplications,
  codeSnippets,
}: CareerHubProps) {
  const [workspace, setWorkspace] = useState<Workspace>('learning');
  const [learningTab, setLearningTab] = useState<'curriculum' | 'flashcards'>('curriculum');
  const [aiTab, setAiTab] = useState<'mentor' | 'interview'>('mentor');
  const [portfolioTab, setPortfolioTab] = useState<'jobs' | 'skills' | 'notes'>('jobs');

  const tabs: { id: Workspace; label: string }[] = [
    { id: 'learning', label: 'Học tập' },
    { id: 'ai_coach', label: 'Cố vấn AI' },
    { id: 'focus', label: 'Tập trung' },
    { id: 'portfolio', label: 'Hồ sơ và kỹ năng' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Primary tabs: underline style */}
      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
        {tabs.map((t) => {
          const active = workspace === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setWorkspace(t.id)}
              style={{
                padding: '10px 0',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${active ? 'var(--accent-color)' : 'transparent'}`,
                marginBottom: '-1px',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: active ? 600 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {workspace === 'learning' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SubTabs
            value={learningTab}
            onChange={setLearningTab}
            items={[
              { id: 'curriculum', label: 'Học liệu và bài tập' },
              { id: 'flashcards', label: `Flashcards (${flashcardDecks?.length || 0} bộ)` },
            ]}
          />
          {learningTab === 'curriculum' ? <CurriculumVault /> : <FlashcardVault decks={flashcardDecks} />}
        </div>
      )}

      {workspace === 'ai_coach' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SubTabs
            value={aiTab}
            onChange={setAiTab}
            items={[
              { id: 'mentor', label: 'Lộ trình nghề nghiệp' },
              { id: 'interview', label: 'Phỏng vấn thử' },
            ]}
          />
          {aiTab === 'mentor' ? <CareerBlueprint /> : <MockInterviewRoom />}
        </div>
      )}

      {workspace === 'focus' && <DeepWorkTimer recentSessions={recentSessions} />}

      {workspace === 'portfolio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SubTabs
            value={portfolioTab}
            onChange={setPortfolioTab}
            items={[
              { id: 'jobs', label: `Ứng tuyển (${jobApplications?.length || 0})` },
              { id: 'skills', label: `Kỹ năng (${skills?.length || 0})` },
              { id: 'notes', label: `Ghi chú code (${codeSnippets?.length || 0})` },
            ]}
          />
          {portfolioTab === 'jobs' && <InternshipPipeline applications={jobApplications} />}
          {portfolioTab === 'skills' && <SkillTree skills={skills} />}
          {portfolioTab === 'notes' && <SnippetLibrary snippets={codeSnippets} />}
        </div>
      )}
    </div>
  );
}
