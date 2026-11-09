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
  curriculumData?: any[];
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
  curriculumData = [],
}: CareerHubProps) {
  const [workspace, setWorkspace] = useState<Workspace>('learning');
  const [learningTab, setLearningTab] = useState<'curriculum' | 'flashcards'>('curriculum');
  const [aiTab, setAiTab] = useState<'mentor' | 'interview'>('mentor');
  const [portfolioTab, setPortfolioTab] = useState<'jobs' | 'skills' | 'notes'>('jobs');
  const [showGuide, setShowGuide] = useState<boolean>(true);

  const tabs: { id: Workspace; label: string }[] = [
    { id: 'learning', label: 'Học tập' },
    { id: 'ai_coach', label: 'Cố vấn AI' },
    { id: 'focus', label: 'Tập trung' },
    { id: 'portfolio', label: 'Hồ sơ và kỹ năng' },
  ];

  const workflowSteps = [
    {
      step: 'Bước 1',
      title: 'Kho Học Liệu & Bài Tập Đa Ngành',
      desc: 'Chọn khung chương trình có sẵn (Kinh tế, Ngoại ngữ, Thiết kế, CNTT...) hoặc tự tạo môn mới / tải file PDF, link Web để AI biên soạn bài giảng & câu hỏi trắc nghiệm.',
      actionLabel: 'Mở Kho học liệu',
      onClick: () => {
        setWorkspace('learning');
        setLearningTab('curriculum');
      },
      active: workspace === 'learning' && learningTab === 'curriculum',
    },
    {
      step: 'Bước 2',
      title: 'Ôn Tập Thẻ Nhớ (Flashcards)',
      desc: 'Tự động trích xuất khái niệm quan trọng từ chương đang học hoặc tạo bộ thẻ câu hỏi – đáp án để lật thẻ ôn tập ngắt quãng (Spaced Repetition).',
      actionLabel: `Mở Flashcards (${flashcardDecks?.length || 0} bộ)`,
      onClick: () => {
        setWorkspace('learning');
        setLearningTab('flashcards');
      },
      active: workspace === 'learning' && learningTab === 'flashcards',
    },
    {
      step: 'Bước 3',
      title: 'Cố Vấn Lộ Trình & Phỏng Vấn AI',
      desc: 'Xây dựng lộ trình phát triển nghề nghiệp theo mục tiêu cá nhân và thực hành trả lời phỏng vấn trực tiếp cùng AI theo từng vị trí công việc.',
      actionLabel: 'Mở Cố vấn & Phỏng vấn AI',
      onClick: () => {
        setWorkspace('ai_coach');
        setAiTab('interview');
      },
      active: workspace === 'ai_coach',
    },
    {
      step: 'Bước 4',
      title: 'Hồ Sơ Ứng Tuyển & Quản Lý Kỹ Năng',
      desc: 'Theo dõi trạng thái các vị trí đã nộp CV, tích lũy điểm kinh nghiệm (EXP) vào Cây kỹ năng và lưu trữ các mẫu ghi chú / tài liệu quan trọng.',
      actionLabel: 'Mở Hồ sơ & Kỹ năng',
      onClick: () => {
        setWorkspace('portfolio');
        setPortfolioTab('jobs');
      },
      active: workspace === 'portfolio',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* QUY TRÌNH HOẠT ĐỘNG & HƯỚNG DẪN SỬ DỤNG TRỰC QUAN */}
      <section
        className="glass-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Cách hoạt động & Quy trình sử dụng Career & Learning Hub
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Bấm trực tiếp vào từng bước bên dưới để chuyển nhanh đến công cụ tương ứng
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowGuide((v) => !v)}
            className="btn"
            style={{ padding: '5px 12px', fontSize: '0.78rem' }}
          >
            {showGuide ? 'Thu nhỏ hướng dẫn' : 'Xem cách hoạt động'}
          </button>
        </div>

        {showGuide && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '12px',
            }}
          >
            {workflowSteps.map((item) => (
              <div
                key={item.step}
                onClick={item.onClick}
                style={{
                  background: item.active ? 'var(--accent-soft)' : 'var(--surface-2)',
                  border: `1px solid ${item.active ? 'var(--accent-color)' : 'var(--border)'}`,
                  borderRadius: '10px',
                  padding: '13px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-color)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {item.step}
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {item.desc}
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-color)' }}>
                  {item.actionLabel} →
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

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
          {learningTab === 'curriculum' ? (
            <CurriculumVault initialData={curriculumData} />
          ) : (
            <FlashcardVault decks={flashcardDecks} />
          )}
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
              { id: 'notes', label: `Ghi chú (${codeSnippets?.length || 0})` },
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
