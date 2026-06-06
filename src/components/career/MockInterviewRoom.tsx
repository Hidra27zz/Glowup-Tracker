'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic, Timer, ChevronRight, Lightbulb, Code, Send,
  SkipForward, RotateCcw, CheckCircle, XCircle, TrendingUp,
  MessageSquare, Cpu, Layout, Users,
} from 'lucide-react';
import {
  generateInterviewSession,
  evaluateAnswer,
  generateFinalReport,
  InterviewSession,
  InterviewEvaluation,
} from '@/lib/actions/interview.actions';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AnswerRecord {
  question: string;
  type: string;
  answer: string;
  score: number;
  feedback: string;
}
type Phase = 'setup' | 'loading' | 'interview' | 'evaluating' | 'report';

// ─── Constants ────────────────────────────────────────────────────────────────
const TOTAL_SECONDS = 30 * 60;

const TYPE_META: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  behavioral:       { label: 'Behavioral',    color: '#a78bfa', Icon: Users },
  technical_theory: { label: 'Technical',     color: '#38bdf8', Icon: Cpu },
  coding:           { label: 'Coding',        color: '#34d399', Icon: Code },
  system_design:    { label: 'System Design', color: '#fb923c', Icon: Layout },
};

const scoreColor = (s: number) =>
  s >= 8 ? '#34d399' : s >= 6 ? '#facc15' : s >= 4 ? '#fb923c' : '#f87171';

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// ─── Subcomponent: Stat Chip ──────────────────────────────────────────────────
function StatChip({ label, count, color, Icon }: { label: string; count: number; color: string; Icon: React.ElementType }) {
  return (
    <div style={{ flex: 1, background: `${color}0d`, borderRadius: '12px', padding: '16px 12px', textAlign: 'center', border: `1px solid ${color}25` }}>
      <Icon size={18} color={color} style={{ marginBottom: '8px' }} />
      <div style={{ fontSize: '1.3rem', fontWeight: 800, color }}>{count}</div>
      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MockInterviewRoom() {
  const [role, setRole]           = useState('Backend Developer');
  const [level, setLevel]         = useState('Junior (0-2 năm)');
  const [focusAreas, setFocusAreas] = useState('Python, PostgreSQL, RESTful API, OOP, Git');

  const [phase, setPhase]         = useState<Phase>('setup');
  const [session, setSession]     = useState<InterviewSession | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers]     = useState<AnswerRecord[]>([]);

  const [userInput, setUserInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{ score: number; feedback: string; followUp?: string } | null>(null);
  const [showHint, setShowHint]   = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [report, setReport]       = useState<InterviewEvaluation | null>(null);
  const [reportTab, setReportTab] = useState<'overview' | 'details'>('overview');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => { if (s <= 1) { clearInterval(timerRef.current!); return 0; } return s - 1; });
    }, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleStart = async () => {
    setPhase('loading');
    const s = await generateInterviewSession(role, level, focusAreas);
    setSession(s); setCurrentIdx(0); setAnswers([]);
    setUserInput(''); setAiFeedback(null); setSecondsLeft(TOTAL_SECONDS);
    setPhase('interview'); startTimer();
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleSubmit = async () => {
    if (!session || submitting) return;
    const q = session.questions[currentIdx];
    setSubmitting(true); setAiFeedback(null);
    const result = await evaluateAnswer(q.question, q.type, userInput, session.role);
    setAiFeedback(result);
    setAnswers(prev => [...prev, { question: q.question, type: q.type, answer: userInput || '(Bỏ qua)', score: result.score, feedback: result.feedback }]);
    if (result.followUp) setShowFollowUp(true);
    setSubmitting(false);
  };

  const advance = async () => {
    if (!session) return;
    setShowHint(false); setShowFollowUp(false); setUserInput(''); setAiFeedback(null);
    const next = currentIdx + 1;
    if (next >= session.questions.length) {
      clearInterval(timerRef.current!); setPhase('evaluating');
      const r = await generateFinalReport(session.role, session.level, answers);
      setReport(r); setPhase('report');
    } else {
      setCurrentIdx(next);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleSkip = () => {
    if (!session) return;
    const q = session.questions[currentIdx];
    setAnswers(prev => [...prev, { question: q.question, type: q.type, answer: '(Bỏ qua)', score: 0, feedback: 'Câu hỏi bị bỏ qua.' }]);
    advance();
  };

  const reset = () => { setPhase('setup'); setAnswers([]); setReport(null); setSession(null); };

  // ── Shared input style ──
  const inputStyle: React.CSSProperties = {
    padding: '10px 14px', borderRadius: '10px',
    background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.09)',
    color: '#fff', fontSize: '0.9rem', outline: 'none', width: '100%',
  };

  // ══════════════════════════════════════════════════════════════════════
  // SETUP
  // ══════════════════════════════════════════════════════════════════════
  if (phase === 'setup') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(236,72,153,0.15))', padding: '14px', borderRadius: '16px', border: '1px solid rgba(168,85,247,0.2)' }}>
            <Mic size={26} color="#a855f7" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Mock Interview Room</h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>22 câu hỏi · 30 phút · AI đánh giá thời gian thực</p>
          </div>
        </div>

        {/* Stats chips */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <StatChip label="Behavioral"    count={3}  color="#a78bfa" Icon={Users} />
          <StatChip label="Technical"     count={10} color="#38bdf8" Icon={Cpu} />
          <StatChip label="Coding"        count={5}  color="#34d399" Icon={Code} />
          <StatChip label="System Design" count={4}  color="#fb923c" Icon={Layout} />
        </div>

        {/* Form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase' }}>Vị trí ứng tuyển</label>
            <select value={role} onChange={e => setRole(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
              <option>Backend Developer</option>
              <option>Frontend Developer</option>
              <option>Full-Stack Developer</option>
              <option>Data Engineer</option>
              <option>ML Engineer</option>
              <option>DevOps / Platform Engineer</option>
              <option>Mobile Developer (iOS/Android)</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase' }}>Cấp độ</label>
            <select value={level} onChange={e => setLevel(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
              <option>Junior (0-2 năm)</option>
              <option>Middle (2-4 năm)</option>
              <option>Senior (4+ năm)</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase' }}>Kỹ năng tập trung</label>
            <input value={focusAreas} onChange={e => setFocusAreas(e.target.value)} placeholder="VD: Python, PostgreSQL, RESTful API, Docker..." style={inputStyle} />
          </div>
        </div>

        <button onClick={handleStart}
          style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff', border: 'none', borderRadius: '14px', padding: '15px 28px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'opacity 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
          <Mic size={18} /> Bắt đầu Phỏng Vấn
        </button>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // LOADING / EVALUATING
  // ══════════════════════════════════════════════════════════════════════
  if (phase === 'loading' || phase === 'evaluating') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', gap: '16px', minHeight: '400px' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(168,85,247,0.2)', borderTop: '3px solid #a855f7', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>
          {phase === 'loading' ? 'AI đang chuẩn bị câu hỏi...' : 'Đang phân tích câu trả lời...'}
        </div>
        <div style={{ color: '#475569', fontSize: '0.85rem' }}>
          {phase === 'loading' ? 'Tạo 22 câu hỏi cá nhân hóa theo JD' : 'Tạo báo cáo đánh giá chi tiết'}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // INTERVIEW
  // ══════════════════════════════════════════════════════════════════════
  if (phase === 'interview' && session) {
    const q = session.questions[currentIdx];
    const meta = TYPE_META[q.type] || TYPE_META.technical_theory;
    const progress = (currentIdx / session.questions.length) * 100;
    const timerWarn = secondsLeft < 300;
    const MetaIcon = meta.Icon;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Status bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)', color: '#a78bfa', padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>{session.role}</div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#64748b', padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem' }}>{session.level}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: timerWarn ? '#f87171' : '#34d399', fontWeight: 700, fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums', background: timerWarn ? 'rgba(248,113,113,0.1)' : 'rgba(52,211,153,0.08)', padding: '6px 14px', borderRadius: '8px', border: `1px solid ${timerWarn ? 'rgba(248,113,113,0.3)' : 'rgba(52,211,153,0.2)'}` }}>
              <Timer size={15} /> {fmt(secondsLeft)}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
              <span style={{ color: '#fff', fontWeight: 700 }}>{currentIdx + 1}</span> / {session.questions.length}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #a855f7, #ec4899)', transition: 'width 0.4s ease', borderRadius: '2px' }} />
        </div>

        {/* Two-column layout: question left, answer right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>

          {/* Left: Question */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '14px', padding: '20px', border: `1px solid ${meta.color}20`, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MetaIcon size={15} color={meta.color} />
                <span style={{ background: `${meta.color}15`, color: meta.color, padding: '3px 10px', borderRadius: '6px', fontSize: '0.73rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{meta.label}</span>
              </div>
              <div style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.75, fontWeight: 500 }}>{q.question}</div>
            </div>

            {/* Follow-up */}
            {showFollowUp && aiFeedback?.followUp && (
              <div style={{ background: 'rgba(168,85,247,0.07)', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(168,85,247,0.2)', color: '#c084fc', fontSize: '0.88rem', lineHeight: 1.6 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', color: '#a855f7' }}>Follow-up</div>
                {aiFeedback.followUp}
              </div>
            )}

            {/* Code template */}
            {q.codeTemplate && (
              <div style={{ background: '#0a0f1e', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700 }}>{q.language?.toUpperCase() || 'CODE'}</span>
                </div>
                <pre style={{ margin: 0, padding: '14px', color: '#94a3b8', fontSize: '0.8rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.65, overflowX: 'auto' }}>{q.codeTemplate}</pre>
              </div>
            )}

            {/* Hint toggle */}
            {q.hint && (
              <>
                <button onClick={() => setShowHint(!showHint)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: showHint ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${showHint ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.07)'}`, color: showHint ? '#fbbf24' : '#64748b', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, width: 'fit-content', transition: 'all 0.2s' }}>
                  <Lightbulb size={14} /> {showHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}
                </button>
                {showHint && <div style={{ background: 'rgba(251,191,36,0.06)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(251,191,36,0.15)', color: '#d4a820', fontSize: '0.85rem', lineHeight: 1.65 }}>{q.hint}</div>}
              </>
            )}
          </div>

          {/* Right: Answer + Feedback */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {q.type === 'coding' ? 'Code Solution' : 'Câu trả lời'}
              </label>
              <textarea ref={textareaRef} value={userInput} onChange={e => setUserInput(e.target.value)}
                placeholder={
                  q.type === 'coding' ? 'Viết code và giải thích thuật toán, độ phức tạp...'
                  : q.type === 'system_design' ? 'Requirements → High-level design → Components → Scaling...'
                  : 'Giải thích chi tiết với ví dụ thực tế...'
                }
                rows={q.type === 'coding' ? 12 : 8}
                style={{ padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: q.type === 'coding' ? '0.82rem' : '0.9rem', outline: 'none', resize: 'vertical', lineHeight: 1.7, fontFamily: q.type === 'coding' ? 'monospace' : 'inherit', width: '100%' }}
                onKeyDown={e => { if (e.key === 'Tab' && q.type === 'coding') { e.preventDefault(); const s = e.currentTarget.selectionStart; setUserInput(v => v.substring(0, s) + '    ' + v.substring(s)); } }}
              />
            </div>

            {/* AI Feedback card */}
            {aiFeedback && (
              <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '12px', padding: '16px', border: `1px solid ${scoreColor(aiFeedback.score)}30`, display: 'flex', gap: '14px', alignItems: 'flex-start', animation: 'fadeIn 0.25s ease' }}>
                <div style={{ background: `${scoreColor(aiFeedback.score)}15`, border: `2px solid ${scoreColor(aiFeedback.score)}`, color: scoreColor(aiFeedback.score), width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                  {aiFeedback.score}
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.65, flex: 1 }}>{aiFeedback.feedback}</div>
              </div>
            )}

            {/* Action row */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {!aiFeedback ? (
                <button onClick={handleSubmit} disabled={submitting || !userInput.trim()}
                  style={{ flex: 1, background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: userInput.trim() && !submitting ? 'pointer' : 'not-allowed', opacity: userInput.trim() && !submitting ? 1 : 0.45, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Send size={15} /> {submitting ? 'Đang đánh giá...' : 'Nộp câu trả lời'}
                </button>
              ) : (
                <button onClick={advance}
                  style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #0ea5e9)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  {currentIdx + 1 >= session.questions.length ? <><CheckCircle size={15} /> Xem Kết Quả</> : <><ChevronRight size={15} /> Câu tiếp theo</>}
                </button>
              )}
              {!aiFeedback && (
                <button onClick={handleSkip}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#475569', borderRadius: '10px', padding: '12px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                  <SkipForward size={14} /> Bỏ qua
                </button>
              )}
            </div>

            {/* Mini score track */}
            {answers.length > 0 && (
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {answers.map((a, i) => (
                  <div key={i} title={`Q${i + 1} · ${a.score}/10`}
                    style={{ width: '28px', height: '28px', borderRadius: '5px', background: `${scoreColor(a.score)}15`, border: `1px solid ${scoreColor(a.score)}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: scoreColor(a.score) }}>
                    {a.score}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // REPORT
  // ══════════════════════════════════════════════════════════════════════
  if (phase === 'report' && report) {
    const sc = scoreColor(report.overallScore / 10);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header + Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ background: `${sc}12`, border: `3px solid ${sc}`, borderRadius: '50%', width: '88px', height: '88px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 24px ${sc}20` }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: sc, lineHeight: 1 }}>{report.overallScore}</div>
            <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: '2px' }}>/ 100</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{session?.role} · {session?.level}</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{report.recommendation}</div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.65 }}>{report.summary}</div>
          </div>
        </div>

        {/* Strengths / Weaknesses */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ background: 'rgba(52,211,153,0.05)', borderRadius: '14px', padding: '18px', border: '1px solid rgba(52,211,153,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
              <CheckCircle size={15} color="#34d399" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Điểm mạnh</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {report.strengths.map((s, i) => <li key={i} style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>{s}</li>)}
            </ul>
          </div>
          <div style={{ background: 'rgba(248,113,113,0.05)', borderRadius: '14px', padding: '18px', border: '1px solid rgba(248,113,113,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
              <XCircle size={15} color="#f87171" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Cần cải thiện</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {report.weaknesses.map((s, i) => <li key={i} style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>{s}</li>)}
            </ul>
          </div>
        </div>

        {/* Per-type averages */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {Object.entries(TYPE_META).map(([type, info]) => {
            const ta = answers.filter(a => a.type === type);
            if (!ta.length) return null;
            const avg = ta.reduce((s, a) => s + a.score, 0) / ta.length;
            const TIcon = info.Icon;
            return (
              <div key={type} style={{ flex: 1, background: `${info.color}0d`, borderRadius: '10px', padding: '14px', textAlign: 'center', border: `1px solid ${info.color}20` }}>
                <TIcon size={16} color={info.color} style={{ marginBottom: '6px' }} />
                <div style={{ color: info.color, fontWeight: 800, fontSize: '1.2rem' }}>{avg.toFixed(1)}</div>
                <div style={{ color: '#475569', fontSize: '0.7rem', marginTop: '2px' }}>{info.label}</div>
              </div>
            );
          })}
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', gap: '4px' }}>
          {(['overview', 'details'] as const).map(t => (
            <button key={t} onClick={() => setReportTab(t)}
              style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', background: reportTab === t ? 'rgba(168,85,247,0.22)' : 'transparent', color: reportTab === t ? '#c084fc' : '#475569', fontWeight: reportTab === t ? 700 : 400, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}>
              {t === 'overview' ? 'Tổng quan' : 'Chi tiết từng câu'}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {reportTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={14} color="#a855f7" /> Bước tiếp theo
            </div>
            {report.nextSteps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ background: 'rgba(168,85,247,0.18)', color: '#a855f7', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.78rem', flexShrink: 0 }}>{i + 1}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.87rem', lineHeight: 1.65, paddingTop: '3px' }}>{step}</div>
              </div>
            ))}
          </div>
        )}

        {/* Details tab */}
        {reportTab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {report.questionFeedbacks.map((qf, i) => {
              const meta = TYPE_META[answers[i]?.type] || TYPE_META.technical_theory;
              const MIcon = meta.Icon;
              return (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '18px', border: `1px solid ${scoreColor(qf.score)}20` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ color: '#334155', fontSize: '0.78rem', fontWeight: 700 }}>Q{i + 1}</span>
                      <MIcon size={13} color={meta.color} />
                      <span style={{ background: `${meta.color}12`, color: meta.color, padding: '2px 8px', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 600 }}>{meta.label}</span>
                    </div>
                    <span style={{ color: scoreColor(qf.score), fontWeight: 800, fontSize: '0.95rem', flexShrink: 0 }}>{qf.score}/10</span>
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#e2e8f0', marginBottom: '8px', lineHeight: 1.65 }}>{qf.question}</div>
                  {qf.userAnswer && qf.userAnswer !== '(Bỏ qua)' && (
                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '7px', padding: '9px 12px', marginBottom: '8px', color: '#64748b', fontSize: '0.82rem', lineHeight: 1.6, borderLeft: '2px solid rgba(255,255,255,0.08)' }}>
                      {qf.userAnswer.substring(0, 220)}{qf.userAnswer.length > 220 ? '…' : ''}
                    </div>
                  )}
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.65, marginBottom: qf.idealAnswer ? '8px' : 0 }}>
                    <MessageSquare size={12} color="#475569" style={{ marginRight: '5px', display: 'inline-block', verticalAlign: 'middle' }} />
                    {qf.feedback}
                  </div>
                  {qf.idealAnswer && (
                    <div style={{ background: 'rgba(52,211,153,0.05)', borderRadius: '7px', padding: '9px 12px', borderLeft: '2px solid #34d399', color: '#6ee7b7', fontSize: '0.82rem', lineHeight: 1.6 }}>
                      <strong>Câu trả lời lý tưởng:</strong> {qf.idealAnswer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button onClick={reset}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: '10px', padding: '13px', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}>
          <RotateCcw size={15} /> Phỏng vấn lại
        </button>
      </div>
    );
  }

  return null;
}
