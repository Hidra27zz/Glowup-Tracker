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

type PrimaryWorkspace = 'learning' | 'ai_coach' | 'focus' | 'portfolio';

interface CareerHubProps {
  skills: any[];
  recentSessions: any[];
  flashcardDecks: any[];
  jobApplications: any[];
  codeSnippets: any[];
}

export default function CareerHub({
  skills,
  recentSessions,
  flashcardDecks,
  jobApplications,
  codeSnippets,
}: CareerHubProps) {
  const [workspace, setWorkspace] = useState<PrimaryWorkspace>('learning');
  const [learningSubTab, setLearningSubTab] = useState<'curriculum' | 'flashcards'>('curriculum');
  const [aiSubTab, setAiSubTab] = useState<'mentor' | 'interview'>('mentor');
  const [portfolioSubTab, setPortfolioSubTab] = useState<'jobs' | 'skills' | 'notes'>('jobs');
  const [zenMode, setZenMode] = useState(false);

  const totalDecksCount = flashcardDecks?.length || 0;
  const activeJobsCount = jobApplications?.length || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Clean Workspace Selector Bar */}
      <div
        className="glass-card"
        style={{
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'rgba(18, 19, 28, 0.78)',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            {
              id: 'learning' as PrimaryWorkspace,
              icon: '📚',
              label: 'Học Tập & Ôn Luyện',
              desc: 'Giáo trình đa ngành & Flashcards',
              badge: totalDecksCount > 0 ? `${totalDecksCount} bộ` : null,
            },
            {
              id: 'ai_coach' as PrimaryWorkspace,
              icon: '🤖',
              label: 'AI Cố Vấn & Phỏng Vấn',
              desc: 'Lộ trình & Luyện phỏng vấn',
              badge: 'AI',
            },
            {
              id: 'focus' as PrimaryWorkspace,
              icon: '⏱️',
              label: 'Deep Work Protocol',
              desc: 'Đồng bộ với Dashboard & Pop-up',
              badge: null,
            },
            {
              id: 'portfolio' as PrimaryWorkspace,
              icon: '💼',
              label: 'Hồ Sơ & Kỹ Năng',
              desc: 'Ứng tuyển, Kỹ năng & Ghi chú',
              badge: activeJobsCount > 0 ? `${activeJobsCount}` : null,
            },
          ].map((tab) => {
            const active = workspace === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setWorkspace(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: active
                    ? '1px solid rgba(139, 92, 246, 0.55)'
                    : '1px solid rgba(255,255,255,0.06)',
                  background: active
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.18))'
                    : 'rgba(255,255,255,0.02)',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '1px 6px',
                          borderRadius: '8px',
                          background: active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)',
                          color: '#fff',
                        }}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  {!zenMode && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {tab.desc}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Zen / Distraction-Free Toggle */}
        <button
          onClick={() => setZenMode((z) => !z)}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            border: zenMode ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
            background: zenMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.04)',
            color: zenMode ? '#10b981' : 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {zenMode ? '🧘 Đang bật Chế độ Tập trung' : '🧘 Chế độ Tối giản (Chống xao nhãng)'}
        </button>
      </div>

      {/* Workspace 1: Learning & Flashcards */}
      {workspace === 'learning' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px' }}>
              <button
                onClick={() => setLearningSubTab('curriculum')}
                style={{
                  padding: '7px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: learningSubTab === 'curriculum' ? 'var(--accent-primary)' : 'transparent',
                  color: learningSubTab === 'curriculum' ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                📖 Kho Học Liệu & Bài Tập Đa Ngành
              </button>
              <button
                onClick={() => setLearningSubTab('flashcards')}
                style={{
                  padding: '7px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: learningSubTab === 'flashcards' ? 'var(--accent-primary)' : 'transparent',
                  color: learningSubTab === 'flashcards' ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                🃏 Ôn Tập Flashcards ({totalDecksCount} bộ thẻ)
              </button>
            </div>
          </div>

          {learningSubTab === 'curriculum' ? (
            <CurriculumVault />
          ) : (
            <FlashcardVault decks={flashcardDecks} />
          )}
        </div>
      )}

      {/* Workspace 2: AI Mentor & Mock Interview */}
      {workspace === 'ai_coach' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
            <button
              onClick={() => setAiSubTab('mentor')}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: 'none',
                background: aiSubTab === 'mentor' ? 'var(--accent-primary)' : 'transparent',
                color: aiSubTab === 'mentor' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              🧭 AI Tư Vấn Lộ Trình Nghề Nghiệp
            </button>
            <button
              onClick={() => setAiSubTab('interview')}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: 'none',
                background: aiSubTab === 'interview' ? 'var(--accent-primary)' : 'transparent',
                color: aiSubTab === 'interview' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              🎙️ Phòng Phỏng Vấn AI Giả Lập
            </button>
          </div>

          {aiSubTab === 'mentor' ? <CareerBlueprint /> : <MockInterviewRoom />}
        </div>
      )}

      {/* Workspace 3: Synchronized Deep Work Timer */}
      {workspace === 'focus' && <DeepWorkTimer recentSessions={recentSessions} />}

      {/* Workspace 4: Portfolio, Jobs, Skill Tree & Notes */}
      {workspace === 'portfolio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', width: 'fit-content', flexWrap: 'wrap' }}>
            <button
              onClick={() => setPortfolioSubTab('jobs')}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: 'none',
                background: portfolioSubTab === 'jobs' ? 'var(--accent-primary)' : 'transparent',
                color: portfolioSubTab === 'jobs' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              💼 Quản Lý Ứng Tuyển ({activeJobsCount})
            </button>
            <button
              onClick={() => setPortfolioSubTab('skills')}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: 'none',
                background: portfolioSubTab === 'skills' ? 'var(--accent-primary)' : 'transparent',
                color: portfolioSubTab === 'skills' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              🌳 Cây Kỹ Năng ({skills?.length || 0})
            </button>
            <button
              onClick={() => setPortfolioSubTab('notes')}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: 'none',
                background: portfolioSubTab === 'notes' ? 'var(--accent-primary)' : 'transparent',
                color: portfolioSubTab === 'notes' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              📝 Kho Ghi Chú & Snippets ({codeSnippets?.length || 0})
            </button>
          </div>

          {portfolioSubTab === 'jobs' && <InternshipPipeline applications={jobApplications} />}
          {portfolioSubTab === 'skills' && <SkillTree skills={skills} />}
          {portfolioSubTab === 'notes' && <SnippetLibrary snippets={codeSnippets} />}
        </div>
      )}
    </div>
  );
}
