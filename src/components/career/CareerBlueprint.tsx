'use client';

import { useState } from 'react';
import { Compass, Search, BookOpen, ExternalLink, MessageCircleQuestion, Lightbulb, Code, ChevronRight, Layout, Video } from 'lucide-react';
import { generateCareerBlueprintAI } from '@/app/career/actions';
import { CareerBlueprint as BlueprintType } from '@/lib/utils/careerEngine';
import { fetchMultiSourceResources, LearningResource } from '@/lib/actions/learning.actions';
import CareerQuiz from './CareerQuiz';

const SAMPLE_BLUEPRINT: BlueprintType = {
  focusArea: 'Backend Developer (Python & PostgreSQL)',
  pathway: {
    basic: [
      'Python cơ bản: kiểu dữ liệu, vòng lặp, hàm, OOP',
      'PostgreSQL & SQL: SELECT, JOIN, GROUP BY, INDEX, Transaction',
      'Git workflow: branching, merging, pull request',
      'Linux command line: file system, chmod, process management',
    ],
    intermediate: [
      'RESTful API với FastAPI hoặc Django REST Framework',
      'Thiết kế Database: Normalization, ERD, Foreign Key',
      'Authentication: JWT, OAuth2, Session vs Token',
      'Docker cơ bản: build image, docker-compose',
    ],
    advanced: [
      'System Design: CAP theorem, Load Balancing, Cache (Redis)',
      'CI/CD Pipeline với GitHub Actions hoặc GitLab CI',
      'Microservices vs Monolith: trade-offs',
      'Performance Optimization: Query profiling, N+1 problem',
    ],
  },
  interviewQuestions: [
    {
      id: 'q1', type: 'multiple_choice',
      question: 'Trong Python, cơ chế nào đảm bảo file luôn được đóng an toàn kể cả khi có exception khi dùng context manager?',
      options: [
        'Garbage Collector phát hiện và đóng file',
        'Phương thức __exit__ luôn được gọi',
        'OS tự thu hồi file descriptor',
        'Python tự chèn lệnh f.close()'
      ],
      correctAnswer: 'Phương thức __exit__ luôn được gọi',
      explanation: 'Context Manager Protocol gồm __enter__ và __exit__. Phương thức __exit__ luôn được gọi dù có lỗi xảy ra.',
    },
    {
      id: 'q2', type: 'multiple_choice',
      question: 'Trong PostgreSQL, loại INDEX mặc định là gì?',
      options: ['Hash Index', 'GiST Index', 'B-Tree Index', 'BRIN Index'],
      correctAnswer: 'B-Tree Index',
      explanation: 'B-Tree (Balanced Tree) là index mặc định, phù hợp với hầu hết các toán tử so sánh.',
    },
  ],
  youtubeQuery: 'python backend developer full course postgresql rest api',
  theoryReview: [
    {
      title: 'RESTful API Principles',
      content: 'Stateless, Uniform Interface, Client-Server, Cacheable. Sử dụng HTTP methods đúng chuẩn: GET, POST, PUT, DELETE. Naming conventions: Dùng danh từ số nhiều, tránh động từ trong URL.',
    },
    {
      title: 'PostgreSQL Indexing',
      content: 'B-Tree Index phù hợp cho truy vấn =, >, <, BETWEEN. Không nên lạm dụng quá nhiều index vì sẽ làm chậm quá trình INSERT/UPDATE. Dùng EXPLAIN ANALYZE để kiểm tra.',
    },
  ],
  codingExercises: [
    {
      title: 'N+1 Query Problem',
      language: 'python',
      code: `users = User.objects.all()\nfor user in users:\n    print(user.posts.all())  # N+1 Queries`,
      task: 'Tối ưu hóa đoạn code trên sử dụng select_related hoặc prefetch_related trong Django ORM để giảm số lượng query.',
    },
  ],
};

const getSourceIcon = (source: string) => {
  if (source === 'YouTube') return <Video size={14} color="#f87171" />;
  if (source === 'GitHub') return <Code size={14} color="#f8fafc" />;
  if (source === 'Dev.to') return <Layout size={14} color="#10b981" />;
  if (source === 'Google') return <Search size={14} color="#38bdf8" />;
  return <ExternalLink size={14} color="#38bdf8" />;
};

export default function CareerBlueprint() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<BlueprintType | null>(null);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [usedSample, setUsedSample] = useState(false);

  const [activeTab, setActiveTab] = useState<'theory' | 'coding' | 'resources' | 'quiz'>('theory');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    
    const bp = await generateCareerBlueprintAI(prompt);
    
    const isStaleData = bp.focusArea === 'Kỹ năng chung (General Skill)' || 
      (bp.theoryReview?.length === 0 && bp.codingExercises?.length === 0 && bp.interviewQuestions?.length <= 2);
      
    if (isStaleData) {
      setBlueprint(SAMPLE_BLUEPRINT);
      setUsedSample(true);
    } else {
      setBlueprint(bp);
      setUsedSample(false);
    }

    try {
      const multiResources = await fetchMultiSourceResources(bp.youtubeQuery, 6);
      setResources(multiResources);
    } catch (e) {
      console.error(e);
    }
    
    setActiveTab('theory');
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    padding: '16px', borderRadius: '12px',
    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff', fontSize: '0.95rem', outline: 'none', width: '100%', resize: 'vertical'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(56,189,248,0.15))', padding: '14px', borderRadius: '16px', border: '1px solid rgba(168,85,247,0.2)' }}>
          <Compass size={26} color="#a855f7" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Career Mentor</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Phân tích JD và xây dựng lộ trình học tập cá nhân hóa</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: blueprint ? '1fr 1.2fr' : '1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Input & Pathway */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem' }}>
              <Search size={18} color="#a855f7" /> Nhập Yêu Cầu (JD)
            </div>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
              placeholder="Dán Job Description (VD: Yêu cầu React, Node.js, AWS...)"
              rows={4}
              style={inputStyle}
            />
            <button onClick={handleGenerate} disabled={loading || !prompt.trim()} 
              style={{ background: 'linear-gradient(135deg, #a855f7, #3b82f6)', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: 700, fontSize: '0.95rem', cursor: prompt.trim() && !loading ? 'pointer' : 'not-allowed', opacity: prompt.trim() && !loading ? 1 : 0.6, transition: 'all 0.2s' }}>
              {loading ? 'Đang phân tích...' : 'Phân tích & Lên Lộ Trình'}
            </button>
          </div>

          {blueprint && (
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ borderLeft: '3px solid #a855f7', paddingLeft: '16px' }}>
                <h3 style={{ margin: '0 0 6px 0', color: '#fff', fontSize: '1.1rem' }}>Mục tiêu: <span style={{ color: '#c084fc' }}>{blueprint.focusArea}</span></h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>
                  Lộ trình được thiết kế bám sát JD của bạn
                  {usedSample && <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>DEMO DATA</span>}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(59,130,246,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.15)' }}>
                  <div style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><BookOpen size={16} /> Level 1: Cơ bản</div>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {blueprint.pathway.basic.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(245,158,11,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><BookOpen size={16} /> Level 2: Trung cấp</div>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {blueprint.pathway.intermediate.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(239,68,68,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <div style={{ color: '#f87171', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><BookOpen size={16} /> Level 3: Nâng cao</div>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {blueprint.pathway.advanced.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Resources */}
        {blueprint && (
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.4s ease' }}>
            
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '12px', gap: '4px' }}>
              {(['theory', 'coding', 'resources', 'quiz'] as const).map(tab => {
                const label = tab === 'theory' ? 'Lý thuyết' : tab === 'coding' ? 'Thực hành' : tab === 'resources' ? 'Tài liệu' : 'Bài Test';
                const Icon = tab === 'theory' ? Lightbulb : tab === 'coding' ? Code : tab === 'resources' ? ExternalLink : MessageCircleQuestion;
                const active = activeTab === tab;
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    style={{ flex: 1, padding: '10px 8px', borderRadius: '8px', border: 'none', background: active ? 'rgba(168,85,247,0.2)' : 'transparent', color: active ? '#c084fc' : '#64748b', cursor: 'pointer', fontWeight: active ? 700 : 500, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}>
                    <Icon size={14} /> {label}
                  </button>
                )
              })}
            </div>

            <div style={{ minHeight: '400px' }}>
              {activeTab === 'theory' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.2s' }}>
                  {blueprint.theoryReview?.map((theory, idx) => (
                    <div key={idx} style={{ background: 'rgba(245,158,11,0.05)', padding: '16px', borderRadius: '12px', borderLeft: '3px solid #f59e0b', borderRight: '1px solid rgba(245,158,11,0.1)', borderTop: '1px solid rgba(245,158,11,0.1)', borderBottom: '1px solid rgba(245,158,11,0.1)' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '0.95rem' }}>{theory.title}</h4>
                      <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.65, fontSize: '0.85rem' }}>{theory.content}</p>
                    </div>
                  ))}
                  {(!blueprint.theoryReview || blueprint.theoryReview.length === 0) && <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>Chưa có lý thuyết cho phần này.</div>}
                </div>
              )}

              {activeTab === 'coding' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.2s' }}>
                  {blueprint.codingExercises?.map((exercise, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ margin: 0, color: '#14b8a6', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Code size={16} /> {exercise.title}
                      </h4>
                      <div style={{ background: '#0a0f1e', padding: '16px', borderRadius: '10px', overflowX: 'auto', border: '1px solid #1e293b' }}>
                        <pre style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem', fontFamily: 'monospace', lineHeight: 1.6 }}>
                          <code>{exercise.code}</code>
                        </pre>
                      </div>
                      <div style={{ background: 'rgba(20,184,166,0.05)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid #14b8a6', fontSize: '0.85rem', lineHeight: 1.6 }}>
                        <span style={{ fontWeight: 700, color: '#2dd4bf' }}>Yêu cầu: </span>
                        <span style={{ color: '#cbd5e1' }}>{exercise.task}</span>
                      </div>
                    </div>
                  ))}
                  {(!blueprint.codingExercises || blueprint.codingExercises.length === 0) && <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>Chưa có bài tập coding.</div>}
                </div>
              )}

              {activeTab === 'resources' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', animation: 'fadeIn 0.2s' }}>
                  {resources.length === 0 && <div style={{ color: '#64748b', fontSize: '0.85rem', gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>Không tìm thấy tài liệu mở rộng.</div>}
                  {resources.map((resource, idx) => (
                    <a key={idx} href={resource.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.25)', borderRadius: '12px', padding: '12px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(56,189,248,0.4)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}>
                      {resource.thumbnail && (
                        <div style={{ position: 'relative' }}>
                          <img src={resource.thumbnail} alt={resource.title} style={{ width: '100%', borderRadius: '6px', aspectRatio: '16/9', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.05)' }} />
                          <div style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.8)', padding: '4px', borderRadius: '6px' }}>
                            {getSourceIcon(resource.source)}
                          </div>
                        </div>
                      )}
                      {!resource.thumbnail && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px', fontWeight: 600, alignSelf: 'flex-start' }}>
                          {getSourceIcon(resource.source)} <span>{resource.source}</span>
                        </div>
                      )}
                      <div style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>{resource.title}</div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>Tác giả: {resource.author}</div>
                    </a>
                  ))}
                </div>
              )}

              {activeTab === 'quiz' && (
                <div style={{ animation: 'fadeIn 0.2s' }}>
                  <CareerQuiz questions={blueprint.interviewQuestions} />
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
