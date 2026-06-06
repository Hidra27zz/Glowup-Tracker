'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Play, Terminal, CheckCircle2, XCircle, AlertCircle,
  Clock, ChevronRight, ChevronDown, BookOpen, Code2,
  PanelLeftClose, PanelLeftOpen, Lightbulb, Zap,
  Loader2, Brain, RotateCcw, Trophy, Download, Globe, FileText,
  Search, Timer, Pause, Star
} from 'lucide-react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-twilight.css';

import { getCurriculumData, generateDeepLearningContent } from '@/app/career/curriculum-actions';

type ActiveView = 'theory' | 'exercise' | 'quiz' | 'import';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  topic: string;
}

function YouTubeEmbed({ query }: { query: string }) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/video?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        if (data.videoId) setVideoId(data.videoId);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [query]);

  if (loading) return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}><Loader2 className="animate-spin" color="#64748b" /></div>;
  if (error || !videoId) return <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Không tìm thấy video phù hợp.</div>;

  return (
    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
      <iframe 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        src={`https://www.youtube.com/embed/${videoId}`}
        frameBorder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowFullScreen
      ></iframe>
    </div>
  );
}

export default function CurriculumVault() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [activeView, setActiveView] = useState<ActiveView>('theory');
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  
  const [language, setLanguage] = useState<'cpp' | 'javascript' | 'python'>('cpp');
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [showHint, setShowHint] = useState(false);
  const [descOpen, setDescOpen] = useState(true);
  
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // ── QUIZ STATE ──
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  
  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isGeneratingTheory, setIsGeneratingTheory] = useState(false);
  const [isGeneratingExercise, setIsGeneratingExercise] = useState(false);
  const [showQuizReview, setShowQuizReview] = useState(false);

  // ── GAMIFICATION ──
  const [exp, setExp] = useState(() => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem('glowup_exp') || '0', 10);
  });
  
  const level = Math.floor(Math.sqrt(exp / 100)) + 1;
  const nextLevelExp = Math.pow(level, 2) * 100;
  const prevLevelExp = Math.pow(level - 1, 2) * 100;
  const levelProgress = ((exp - prevLevelExp) / (nextLevelExp - prevLevelExp)) * 100;

  const addExp = (amount: number) => {
    setExp(prev => {
      const next = prev + amount;
      localStorage.setItem('glowup_exp', next.toString());
      return next;
    });
  };

  // ── PROGRESS TRACKING ──
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem('glowup_completed');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // ── PERSONAL NOTES STATE ──
  const [notes, setNotes] = useState<Record<string, string>>({}); // key = sectionId
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesSaving, setNotesSaving] = useState(false);

  // ── FLASHCARD STATE ──
  const [flashcards, setFlashcards] = useState<{term: string, desc: string}[]>([]);
  const [activeCard, setActiveCard] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);

  useEffect(() => {
    if (activeView === 'theory' && selectedSection?.coreConcept && typeof window !== 'undefined') {
      const div = document.createElement('div');
      div.innerHTML = selectedSection.coreConcept;
      const bolds = Array.from(div.querySelectorAll('strong, b')).map(el => el.textContent?.trim() || '');
      const cards: {term: string, desc: string}[] = [];
      bolds.forEach(b => {
        if (b && b.length > 2 && !cards.some(c => c.term === b)) {
          cards.push({ term: b, desc: `Thuật ngữ quan trọng xuất hiện trong phần: ${selectedSection.title}` });
        }
      });
      setFlashcards(cards.slice(0, 8)); // Tối đa 8 thẻ
      setActiveCard(0);
      setCardFlipped(false);
    } else {
      setFlashcards([]);
    }
  }, [activeView, selectedSection]);

  // ── SEARCH & POMODORO STATE ──
  const [searchQuery, setSearchQuery] = useState('');
  const [tocSearchQuery, setTocSearchQuery] = useState('');
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isPomodoroRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(t => t - 1);
      }, 1000);
    } else if (pomodoroTime === 0 && isPomodoroRunning) {
      setIsPomodoroRunning(false);
      alert('Hết giờ Focus! Nghỉ ngơi chút nhé.');
    }
    return () => clearInterval(interval);
  }, [isPomodoroRunning, pomodoroTime]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleGenerateTheory = async () => {
    if (!selectedSubject || !selectedSection) return;
    setIsGeneratingTheory(true);
    try {
      const res = await fetch('/api/theory/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: selectedSection.id,
          subjectCode: selectedSubject.code,
          subjectName: selectedSubject.name,
          chapterTitle: selectedSection.title,
          focusKeywords: selectedSection.focusKeywords
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedSection({ ...selectedSection, coreConcept: data.theory });
      } else {
        const errorData = await res.json();
        alert(`Lỗi sinh Bài Giảng: ${errorData.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('Đã xảy ra lỗi hệ thống khi sinh Bài Giảng.');
    } finally {
      setIsGeneratingTheory(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!selectedSubject || !selectedSection) return;
    setIsGeneratingQuiz(true);
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectCode: selectedSubject.code,
          subjectName: selectedSubject.name,
          chapterTitle: selectedSection.title,
          coreConcept: selectedSection.coreConcept,
          sectionId: selectedSection.id
        })
      });
      if (res.ok) {
        await loadQuizForSubject(selectedSubject.code); // Tải lại quiz
      } else {
        const errorData = await res.json();
        alert(`Lỗi sinh Quiz: ${errorData.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('Đã xảy ra lỗi hệ thống khi sinh Quiz.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isRegeneratingTheory, setIsRegeneratingTheory] = useState(false);

  const handleGenerateFlashcards = async () => {
    if (!selectedSection) return;
    setIsGeneratingFlashcards(true);
    try {
      const res = await fetch('/api/flashcard/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId: selectedSection.id, forceGenerate: true })
      });
      if (res.ok) {
        getCurriculumData().then(freshData => {
          setData(freshData);
          const freshSub = freshData.flatMap((g: any) => g.subjects).find((s: any) => s.id === selectedSubject?.id);
          if (freshSub) {
            setSelectedSubject(freshSub);
            const freshSec = freshSub.theories.find((s: any) => s.id === selectedSection.id);
            if (freshSec) setSelectedSection(freshSec);
          }
        });
      } else {
        const err = await res.json();
        alert('Lỗi sinh Flashcards: ' + err.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleRegenerateTheory = async () => {
    if (!selectedSection || !selectedSubject) return;
    if (!confirm('Bạn có chắc chắn muốn tạo lại bài giảng này? Nội dung hiện tại sẽ bị ghi đè.')) return;
    setIsRegeneratingTheory(true);
    try {
      const res = await fetch('/api/theory/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: selectedSection.id,
          subjectCode: selectedSubject.code,
          subjectName: selectedSubject.name,
          chapterTitle: selectedSection.title,
          forceGenerate: true
        })
      });
      if (res.ok) {
        getCurriculumData().then(freshData => {
          setData(freshData);
          const freshSub = freshData.flatMap((g: any) => g.subjects).find((s: any) => s.id === selectedSubject.id);
          if (freshSub) {
            setSelectedSubject(freshSub);
            const freshSec = freshSub.theories.find((s: any) => s.id === selectedSection.id);
            if (freshSec) setSelectedSection(freshSec);
          }
        });
      } else {
        alert('Lỗi tạo lại bài giảng');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegeneratingTheory(false);
    }
  };

  const handleRateTheory = async (rating: number) => {
    if (!selectedSection) return;
    try {
      const res = await fetch('/api/theory/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId: selectedSection.id, rating })
      });
      if (res.ok) {
        // Update locally
        setSelectedSection((prev: any) => prev ? { ...prev, rating } : null);
      }
    } catch(e) {}
  };

  const handleGenerateExercise = async () => {
    if (!selectedSubject) return;
    setIsGeneratingExercise(true);
    try {
      const res = await fetch('/api/exercise/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectCode: selectedSubject.code,
          subjectName: selectedSubject.name,
          sectionId: selectedSection?.id,
          forceGenerate: true
        })
      });
      if (res.ok) {
        getCurriculumData().then(freshData => {
          setData(freshData);
          const freshSub = freshData.flatMap((g: any) => g.subjects).find((s: any) => s.id === selectedSubject.id);
          if (freshSub) {
            setSelectedSubject(freshSub);
            if (selectedSection) {
              const freshSec = freshSub.theories.find((s: any) => s.id === selectedSection.id);
              if (freshSec) {
                setSelectedSection(freshSec);
                setSelectedExercise(freshSec.exercises?.[0] || null);
              }
            } else {
              setSelectedExercise(freshSub.exercises?.[0] || null);
            }
          }
        });
      } else {
        const err = await res.json();
        alert(`Lỗi sinh bài tập: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('Lỗi hệ thống khi sinh bài tập.');
    } finally {
      setIsGeneratingExercise(false);
    }
  };

  // Import state
  const [importUrl, setImportUrl] = useState('');
  const [importingType, setImportingType] = useState<'web'|'github'|'pdf'|'ugc'|null>(null);
  const [importResult, setImportResult] = useState<{success: boolean, msg: string}|null>(null);
  const [ugcForm, setUgcForm] = useState({ code: '', name: '', chapter: '' });

  // Load notes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('glowup_notes');
    if (saved) setNotes(JSON.parse(saved));
  }, []);

  // Reset quiz when section changes
  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  }, [selectedSection]);

  useEffect(() => {
    getCurriculumData().then(res => {
      setData(res);
      if (res.length > 0) {
        setExpandedGroups({ [res[0].id]: true });
        if (res[0].subjects.length > 0) {
          const sub = res[0].subjects[0];
          setSelectedSubject(sub);
          setSelectedSection(sub.theories[0] || null);
          setSelectedExercise(sub.exercises[0] || null);
        }
      }
      setLoading(false);
    });
  }, []);

  // Load quiz khi chuyển sang tab quiz hoặc đổi môn
  const loadQuizForSubject = useCallback(async (subjectCode: string) => {
    setQuizLoading(true);
    setQuizQuestions([]);
    setCurrentQuizIdx(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizScore(0);
    setQuizAnswered({});
    setQuizFinished(false);
    try {
      const res = await fetch(`/api/quiz?subject=${encodeURIComponent(subjectCode)}`);
      const data = await res.json();
      setQuizQuestions(data.questions || []);
    } catch {
      setQuizQuestions([]);
    } finally {
      setQuizLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeView === 'quiz' && selectedSubject) {
      loadQuizForSubject(selectedSubject.code);
    }
  }, [activeView, selectedSubject, loadQuizForSubject]);

  const handleAnswerSelect = (answerIdx: number) => {
    if (quizAnswered[currentQuizIdx] !== undefined) return;
    setSelectedAnswer(answerIdx);
    setShowExplanation(true);
    const isCorrect = answerIdx === quizQuestions[currentQuizIdx]?.answerIndex;
    if (isCorrect) setQuizScore(s => s + 1);
    setQuizAnswered(prev => ({ ...prev, [currentQuizIdx]: answerIdx }));
  };

  const markSectionComplete = (topicName: string) => {
    for (const group of data) {
      for (const sub of group.subjects) {
        for (const sec of sub.theories) {
          if (topicName.includes(sec.title)) {
            setCompletedSections(prev => {
              if (!prev[sec.id]) {
                addExp(50); // 50 EXP for passing quiz
              }
              const next = { ...prev, [sec.id]: true };
              localStorage.setItem('glowup_completed', JSON.stringify(next));
              return next;
            });
            return;
          }
        }
      }
    }
  };

  const handleNextQuiz = () => {
    if (currentQuizIdx < quizQuestions.length - 1) {
      setCurrentQuizIdx(i => i + 1);
      setSelectedAnswer(quizAnswered[currentQuizIdx + 1] ?? null);
      setShowExplanation(quizAnswered[currentQuizIdx + 1] !== undefined);
    } else {
      // Calculate final score including any already-answered questions
      const finalScore = quizScore;
      setQuizFinished(true);
      if (quizQuestions.length > 0 && finalScore / quizQuestions.length >= 0.8) {
        markSectionComplete(quizQuestions[0]?.topic || '');
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuizIdx(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizScore(0);
    setQuizAnswered({});
    setQuizFinished(false);
  };

  useEffect(() => {
    if (selectedExercise) {
      try {
        const starter = JSON.parse(selectedExercise.starterCode);
        setCode(starter[language] || '');
      } catch {
        setCode('');
      }
      setExecutionResult(null);
    }
  }, [selectedExercise, language]);

  const selectSubject = (subject: any) => {
    setSelectedSubject(subject);
    setSelectedSection(subject.theories[0] || null);
    setSelectedExercise(subject.exercises[0] || null);
    setExecutionResult(null);
    setShowHint(false);
  };

  const toggleGroup = (gid: string) => {
    setExpandedGroups(prev => ({ ...prev, [gid]: !prev[gid] }));
  };

  const runCode = async () => {
    if (!selectedExercise) return;
    setIsRunning(true);
    setExecutionResult(null);
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code, testCases: selectedExercise.testCases })
      });
      const resData = await res.json();
      setExecutionResult(resData);
      
      if (resData.status === 'Accepted') {
        const key = `ex_${selectedExercise.id}`;
        setCompletedSections(prev => {
          if (!prev[key]) {
            addExp(100);
            const next = { ...prev, [key]: true };
            localStorage.setItem('glowup_completed', JSON.stringify(next));
            return next;
          }
          return prev;
        });
      }
    } catch {
      setExecutionResult({ status: 'Error', error: 'Network or server error' });
    } finally {
      setIsRunning(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!selectedSection) return;
    setIsGeneratingAI(true);
    try {
      const updated = await generateDeepLearningContent(selectedSection.id);
      setSelectedSection(updated);
      
      // Update local state tree to prevent overwrite on next navigation
      setData(prev => prev.map(g => ({
        ...g,
        subjects: g.subjects.map((s: any) => ({
          ...s,
          theories: s.theories.map((t: any) => t.id === updated.id ? updated : t)
        }))
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const diffColor = (d: string) =>
    d === 'Easy' ? '#4ade80' : d === 'Medium' ? '#facc15' : '#f87171';
  const diffBg = (d: string) =>
    d === 'Easy' ? 'rgba(34,197,94,0.12)' : d === 'Medium' ? 'rgba(234,179,8,0.12)' : 'rgba(239,68,68,0.12)';

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '600px', color: '#64748b' }}>
      <Loader2 size={32} className="animate-spin" /> <span style={{ marginLeft: '12px' }}>Đang tải dữ liệu học tập...</span>
    </div>;
  }

  if (data.length === 0 || !selectedSubject) {
    return <div style={{ padding: '40px', color: '#64748b', textAlign: 'center' }}>Không có dữ liệu môn học.</div>;
  }

  // Parse JSON fields safely
  const parseJsonStr = (str: string | null) => {
    if (!str) return null;
    try { return JSON.parse(str); } catch { return null; }
  };

  const realWorldApps = selectedSection ? parseJsonStr(selectedSection.realWorldApplications) : null;
  const edgeCases = selectedSection ? parseJsonStr(selectedSection.edgeCases) : null;

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: '85vh', gap: 0, position: 'relative' }}>
      
      {/* ── SIDEBAR ── */}
      <div style={{
        width: sidebarOpen ? '260px' : '0px',
        minWidth: sidebarOpen ? '260px' : '0px',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        background: 'rgba(0,0,0,0.25)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px 0 0 16px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Sidebar header */}
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Môn học
            </div>
            <button 
              onClick={() => setActiveView('import')} 
              style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '6px', color: '#4ade80', padding: '4px 8px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Tạo Môn Học Mới"
            >
              + Tạo mới
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Tìm theo mã, tên..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#e2e8f0', fontSize: '0.8rem', outline: 'none' }}
            />
          </div>
        </div>

        {/* Scrollable subject list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
          {data.map(group => {
            const q = searchQuery.toLowerCase();
            const filteredSubjects = group.subjects.filter((s: any) => 
              s.name.toLowerCase().includes(q) || 
              s.code.toLowerCase().includes(q) ||
              (s.theories && s.theories.some((t: any) => t.title.toLowerCase().includes(q)))
            );
            if (searchQuery && filteredSubjects.length === 0) return null;
            return (
            <div key={group.id}>
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 16px', background: 'transparent', border: 'none',
                  cursor: 'pointer', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
                onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
              >
                <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.name}</span>
                {(searchQuery ? true : expandedGroups[group.id]) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>

              {/* Subjects */}
              {(searchQuery ? true : expandedGroups[group.id]) && filteredSubjects.map((subject: any) => (
                <button
                  key={subject.id}
                  onClick={() => selectSubject(subject)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 16px 9px 28px', background: selectedSubject.id === subject.id
                      ? `rgba(255,255,255,0.06)` : 'transparent',
                    border: 'none', borderLeft: selectedSubject.id === subject.id
                      ? `2px solid ${subject.color}` : '2px solid transparent',
                    cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                  }}
                  onMouseEnter={e => { if (selectedSubject.id !== subject.id) (e.currentTarget.style.background = 'rgba(255,255,255,0.03)'); }}
                  onMouseLeave={e => { if (selectedSubject.id !== subject.id) (e.currentTarget.style.background = 'transparent'); }}
                >
                  <span style={{
                    width: '26px', height: '26px', borderRadius: '6px', flexShrink: 0,
                    background: `${subject.color}22`, border: `1px solid ${subject.color}44`,
                    color: subject.color, fontSize: '0.6rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{subject.code?.slice(0, 2)}</span>
                  <div style={{ overflow: 'hidden', width: '100%', minWidth: 0 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: selectedSubject.id === subject.id ? '#e2e8f0' : '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {subject.name}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#475569' }}>{subject.code} · {subject.credits} TC</div>
                    {(() => {
                      const subjectSections = subject.theories || [];
                      const doneCount = subjectSections.filter((s: any) => completedSections[s.id]).length;
                      const totalCount = subjectSections.length;
                      const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
                      return totalCount > 0 ? (
                        <div style={{ marginTop: '4px', width: '100%', height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: subject.color, borderRadius: '2px', transition: 'width 0.4s' }} />
                        </div>
                      ) : null;
                    })()}
                  </div>
                </button>
              ))}
            </div>
          );
        })}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* ── TOP BAR ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px 20px', background: 'rgba(0,0,0,0.2)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0, flexWrap: 'wrap',
        }}>
          {/* Toggle sidebar */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            title={sidebarOpen ? 'Ẩn sidebar' : 'Hiện sidebar'}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', padding: '6px 8px', cursor: 'pointer', color: '#94a3b8',
              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem',
              transition: 'all 0.2s', flexShrink: 0,
            }}
          >
            {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
            <span style={{
              width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
              background: `${selectedSubject.color}20`, border: `1px solid ${selectedSubject.color}40`,
              color: selectedSubject.color, fontSize: '0.65rem', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{selectedSubject.icon}</span>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedSubject.name}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                {selectedSubject.code} · {selectedSubject.credits} tín chỉ
              </div>
            </div>
          </div>

          {/* Level / EXP Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '6px 12px', flexShrink: 0, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Trophy size={14} color="#facc15" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#facc15', letterSpacing: '0.05em' }}>Lv.{level}</span>
              <div style={{ width: '40px', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '2px' }}>
                <div style={{ width: `${levelProgress}%`, height: '100%', background: '#facc15', borderRadius: '2px', transition: 'width 0.3s' }} />
              </div>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '4px', fontWeight: 600 }}>{exp} XP</span>
          </div>

          {/* Pomodoro Timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '6px 12px', flexShrink: 0, border: '1px solid rgba(255,255,255,0.05)' }}>
            <button
              onClick={() => setIsPomodoroRunning(r => !r)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer', color: isPomodoroRunning ? '#f87171' : '#4ade80',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0',
              }}
              title={isPomodoroRunning ? "Dừng Focus" : "Bắt đầu Focus"}
            >
              {isPomodoroRunning ? <Pause size={16} /> : <Timer size={16} />}
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', fontFamily: 'monospace', width: '42px', textAlign: 'center' }}>
              {formatTime(pomodoroTime)}
            </span>
            <button
              onClick={() => { setIsPomodoroRunning(false); setPomodoroTime(25 * 60); }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0', marginLeft: '4px', display: 'flex' }}
              title="Reset Timer"
              onMouseEnter={e => e.currentTarget.style.color = '#e2e8f0'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '3px', gap: '2px', flexShrink: 0 }}>
            {([
              { key: 'theory', label: 'Lý thuyết', icon: <BookOpen size={14} />, badge: null },
              { key: 'exercise', label: 'Bài tập', icon: <Code2 size={14} />, badge: selectedSection?.exercises?.length || 0 },
              { key: 'quiz', label: 'Quiz', icon: <Brain size={14} />, badge: null },
              { key: 'import', label: 'Import', icon: <Download size={14} />, badge: null },
            ] as const).map(({ key, label, icon, badge }) => (
              <button
                key={key}
                onClick={() => setActiveView(key as ActiveView)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.2s',
                  background: activeView === key ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: activeView === key
                    ? key === 'quiz' ? '#a78bfa' : '#e2e8f0'
                    : '#64748b',
                }}
              >
                {icon}
                {label}{badge !== null && badge > 0 ? ` (${badge})` : ''}
              </button>
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

          {/* Theory section list (mini TOC) */}
          <div style={{
            width: '240px', minWidth: '240px', borderRight: '1px solid rgba(255,255,255,0.06)',
                overflowY: 'auto', padding: '12px 8px', background: 'rgba(0,0,0,0.1)',
                display: 'flex', flexDirection: 'column'
              }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px 8px' }}>
                  Mục lục
                </div>
                <div style={{ position: 'relative', marginBottom: '12px', padding: '0 8px' }}>
                  <Search size={12} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input 
                    type="text" 
                    placeholder="Lọc chương..." 
                    value={tocSearchQuery}
                    onChange={e => setTocSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px 6px 26px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#e2e8f0', fontSize: '0.75rem', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                {selectedSubject.theories.filter((sec: any) => sec.title.toLowerCase().includes(tocSearchQuery.toLowerCase())).map((sec: any) => (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedSection(sec)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '8px 10px',
                      borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: selectedSection?.id === sec.id ? 'rgba(255,255,255,0.07)' : 'transparent',
                      color: selectedSection?.id === sec.id ? '#e2e8f0' : '#64748b',
                      fontSize: '0.78rem', fontWeight: selectedSection?.id === sec.id ? 600 : 400,
                      transition: 'all 0.15s', lineHeight: 1.4,
                      borderLeft: selectedSection?.id === sec.id ? '2px solid #38bdf8' : '2px solid transparent',
                    }}
                    onMouseEnter={e => { if (selectedSection?.id !== sec.id) e.currentTarget.style.color = '#94a3b8'; }}
                    onMouseLeave={e => { if (selectedSection?.id !== sec.id) e.currentTarget.style.color = '#64748b'; }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', width: '100%' }}>
                      <span style={{ flex: 1 }}>{sec.title}</span>
                      {completedSections[sec.id] && <CheckCircle2 size={11} color="#4ade80" style={{ flexShrink: 0 }} />}
                    </span>
                  </button>
                ))}
                </div>
              </div>

              {/* Theory content */}
              {activeView === 'theory' && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', maxWidth: '860px' }}>
                {selectedSection ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                      <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.3 }}>
                        {selectedSection.title}
                      </h2>
                      {!realWorldApps && (
                        <button
                          onClick={handleGenerateAI}
                          disabled={isGeneratingAI}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(168,85,247,0.4)',
                            background: 'rgba(168,85,247,0.1)', color: '#c084fc',
                            fontSize: '0.75rem', fontWeight: 700, cursor: isGeneratingAI ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {isGeneratingAI ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                          {isGeneratingAI ? 'Đang phân tích...' : 'Mở rộng với AI'}
                        </button>
                      )}
                    </div>
                    
                    {(!selectedSection.coreConcept || selectedSection.coreConcept.includes("Đang chờ cập nhật nội dung") || selectedSection.coreConcept.includes("chưa cập nhật")) ? (
                      <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}><Globe size={48} color="#7c3aed" strokeWidth={1.5} /></div>
                        <div style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '8px', fontWeight: 600 }}>Bài giảng đang trống</div>
                        <div style={{ color: '#475569', fontSize: '0.85rem', maxWidth: '440px', margin: '0 auto 24px', lineHeight: 1.5 }}>
                          Hệ thống sẽ tự động quét dữ liệu chuyên ngành từ Wikipedia, GeeksforGeeks, Programiz để tổng hợp bài giảng (Zero-Token). AI sẽ được dùng làm phương án dự phòng.
                        </div>
                        <button 
                          onClick={handleGenerateTheory}
                          disabled={isGeneratingTheory}
                          style={{
                            background: isGeneratingTheory ? '#334155' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                            color: '#fff',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            cursor: isGeneratingTheory ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: isGeneratingTheory ? 'none' : '0 4px 15px rgba(124,58,237,0.3)',
                            transition: 'all 0.2s'
                          }}
                        >
                          {isGeneratingTheory ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Đang thu thập dữ liệu...
                            </>
                          ) : (
                            <>
                              <Download size={18} />
                              Thu thập dữ liệu bài giảng
                            </>
                          )}
                        </button>
                        {selectedSection.focusKeywords && (
                          <div style={{ marginTop: '20px', color: '#64748b', fontSize: '0.8rem' }}>
                            Từ khóa AI sẽ tập trung: <span style={{ color: '#38bdf8' }}>{selectedSection.focusKeywords}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div
                          className="theory-content"
                          dangerouslySetInnerHTML={{ __html: selectedSection.coreConcept }}
                        />
                        
                        {/* Rating System */}
                        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <h4 style={{ margin: '0 0 4px 0', color: '#e2e8f0', fontSize: '0.9rem' }}>Đánh giá chất lượng bài giảng này</h4>
                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.75rem' }}>Phản hồi của bạn giúp AI cải thiện các bài học sau</p>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                onClick={() => handleRateTheory(star)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: (selectedSection.rating || 0) >= star ? '#facc15' : '#475569', transition: 'color 0.2s' }}
                              >
                                <Star size={20} fill={(selectedSection.rating || 0) >= star ? '#facc15' : 'transparent'} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Tự động nhúng Video YouTube (Zero-Token) */}
                    <div style={{ marginTop: '40px', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Play size={18} color="#ef4444" fill="#ef4444" />
                        Video Bài Giảng / Hướng Dẫn Nhanh
                      </h3>
                      <YouTubeEmbed query={selectedSection.title.replace(/Chương \d+[-\d]*:/, '').trim() + ' ' + selectedSubject.name + ' bách khoa uit'} />
                    </div>

                    {/* Flashcards (Auto-generated from AI) */}
                    {(() => {
                      const flashcards = parseJsonStr(selectedSection.flashcards) || [];
                      return (
                        <div style={{ marginTop: '40px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                              <Lightbulb size={18} color="#facc15" />
                              Flashcards Ôn Tập
                            </h3>
                            {flashcards.length === 0 && (
                              <button onClick={handleGenerateFlashcards} disabled={isGeneratingFlashcards} style={{ background: 'linear-gradient(135deg, #facc15, #eab308)', color: '#000', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Brain size={14} /> {isGeneratingFlashcards ? 'Đang tạo...' : 'Tạo Flashcards bằng AI'}
                              </button>
                            )}
                          </div>
                          
                          {flashcards.length > 0 && (
                      <div style={{ marginTop: '40px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Lightbulb size={18} color="#facc15" />
                          Flashcards Ôn Tập
                        </h3>
                        <div style={{ 
                          width: '100%', height: '200px', perspective: '1000px', cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center'
                        }} onClick={() => setCardFlipped(!cardFlipped)}>
                          <div style={{
                            width: '100%', maxWidth: '500px', height: '160px', position: 'relative',
                            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)', transformStyle: 'preserve-3d',
                            transform: cardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                          }}>
                            {/* Front */}
                            <div style={{
                              position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
                              boxShadow: '0 8px 32px rgba(0,0,0,0.2)', textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>{flashcards[activeCard]?.front}</div>
                              <div style={{ position: 'absolute', bottom: '12px', fontSize: '0.7rem', color: '#64748b' }}>Chạm để lật mặt sau</div>
                            </div>
                            {/* Back */}
                            <div style={{
                              position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                              background: 'linear-gradient(135deg, rgba(56,189,248,0.1), rgba(56,189,248,0.05))',
                              border: '1px solid rgba(56,189,248,0.2)', borderRadius: '16px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
                              transform: 'rotateY(180deg)', textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '1rem', color: '#e2e8f0', lineHeight: 1.5 }}>{flashcards[activeCard]?.back}</div>
                              <div style={{ position: 'absolute', bottom: '12px', fontSize: '0.7rem', color: '#38bdf8' }}>Chạm để lật lại</div>
                            </div>
                          </div>
                          
                          {/* Controls */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }} onClick={e => e.stopPropagation()}>
                            <button 
                              onClick={() => { setActiveCard(Math.max(0, activeCard - 1)); setCardFlipped(false); }}
                              disabled={activeCard === 0}
                              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeCard === 0 ? '#475569' : '#e2e8f0', cursor: activeCard === 0 ? 'not-allowed' : 'pointer' }}
                            >
                              <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                              {activeCard + 1} / {flashcards.length}
                            </div>
                            <button 
                              onClick={() => {
                                if (activeCard < flashcards.length - 1) {
                                  setActiveCard(activeCard + 1); setCardFlipped(false);
                                  addExp(5); // Nhận 5 EXP khi học flashcard
                                }
                              }}
                              disabled={activeCard === flashcards.length - 1}
                              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeCard === flashcards.length - 1 ? '#475569' : '#e2e8f0', cursor: activeCard === flashcards.length - 1 ? 'not-allowed' : 'pointer' }}
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    </div>
                  );
                })()}

                    {/* Notes Panel */}
                    {selectedSection && (
                      <div style={{ marginTop: '32px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                        <button
                          onClick={() => setNotesOpen(o => !o)}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '12px 16px', background: 'rgba(255,255,255,0.02)',
                            border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600,
                          }}
                        >
                          <FileText size={14} />
                          Ghi chú cá nhân
                          {notes[selectedSection.id] && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#4ade80', background: 'rgba(74,222,128,0.1)', padding: '2px 8px', borderRadius: '10px' }}>Đã có ghi chú</span>}
                          {notesOpen ? <ChevronDown size={14} style={{ marginLeft: notes[selectedSection.id] ? undefined : 'auto' }} /> : <ChevronRight size={14} style={{ marginLeft: notes[selectedSection.id] ? undefined : 'auto' }} />}
                        </button>
                        {notesOpen && (
                          <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.2)' }}>
                            <textarea
                              placeholder="Ghi chú của bạn về chương này..."
                              value={notes[selectedSection.id] || ''}
                              onChange={e => {
                                const text = e.target.value;
                                setNotes(prev => {
                                  const next = { ...prev, [selectedSection.id]: text };
                                  localStorage.setItem('glowup_notes', JSON.stringify(next));
                                  return next;
                                });
                              }}
                              rows={5}
                              style={{
                                width: '100%', padding: '12px', borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.3)', color: '#e2e8f0',
                                fontSize: '0.88rem', lineHeight: 1.6,
                                resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                                boxSizing: 'border-box',
                              }}
                            />
                            <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '6px', textAlign: 'right' }}>
                              Lưu tự động · {notes[selectedSection.id]?.length || 0} ký tự
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Real world & Edge cases generated by AI */}
                    {(realWorldApps || edgeCases) && (
                      <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.5s' }}>
                        
                        {realWorldApps && realWorldApps.length > 0 && (
                          <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '12px', padding: '20px' }}>
                            <h3 style={{ margin: '0 0 12px', color: '#4ade80', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Zap size={16} /> Ứng dụng Thực tế
                            </h3>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
                              {realWorldApps.map((app: string, idx: number) => <li key={idx} style={{ marginBottom: '8px' }}>{app}</li>)}
                            </ul>
                          </div>
                        )}

                        {edgeCases && edgeCases.length > 0 && (
                          <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '20px' }}>
                            <h3 style={{ margin: '0 0 12px', color: '#f87171', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <AlertCircle size={16} /> Góc khuất & Ngoại lệ
                            </h3>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
                              {edgeCases.map((ec: string, idx: number) => <li key={idx} style={{ marginBottom: '8px' }}>{ec}</li>)}
                            </ul>
                          </div>
                        )}

                      </div>
                    )}

                    {/* ── QUIZ TRẮC NGHIỆM ── */}
                    {(() => {
                      const quiz = selectedSection.quizzes || [];
                      if (!quiz || !Array.isArray(quiz) || quiz.length === 0) return null;
                      const score = quizSubmitted ? quiz.filter((_: any, i: number) => quizAnswers[i] === quiz[i].correct).length : 0;
                      return (
                        <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '2px solid rgba(168,85,247,0.2)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, color: '#c084fc', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <BookOpen size={18} /> Kiểm tra Lý thuyết ({quiz.length} câu)
                            </h3>
                            {quizSubmitted && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: score === quiz.length ? '#4ade80' : score >= quiz.length/2 ? '#facc15' : '#f87171', fontWeight: 800, fontSize: '1rem' }}>
                                  {score}/{quiz.length} đúng
                                </span>
                                <button
                                  onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }}
                                  style={{ padding: '5px 12px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#94a3b8', fontSize: '0.78rem', cursor: 'pointer' }}
                                >
                                  Làm lại
                                </button>
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {quiz.map((q: any, qi: number) => {
                              const answered = quizAnswers[qi] !== undefined;
                              const isCorrect = quizAnswers[qi] === q.correct;
                              return (
                                <div key={qi} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '18px', border: quizSubmitted ? (isCorrect ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)') : '1px solid rgba(255,255,255,0.07)' }}>
                                  <p style={{ margin: '0 0 14px', fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>
                                    <span style={{ color: '#a78bfa', marginRight: '8px' }}>Q{qi + 1}.</span>
                                    {q.question}
                                  </p>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {q.options.map((opt: string, oi: number) => {
                                      let bg = 'transparent';
                                      let border = '1px solid rgba(255,255,255,0.08)';
                                      let color = '#94a3b8';
                                      if (quizSubmitted) {
                                        if (oi === q.correct) { bg = 'rgba(34,197,94,0.12)'; border = '1px solid rgba(34,197,94,0.4)'; color = '#4ade80'; }
                                        else if (oi === quizAnswers[qi]) { bg = 'rgba(239,68,68,0.1)'; border = '1px solid rgba(239,68,68,0.3)'; color = '#f87171'; }
                                      } else if (quizAnswers[qi] === oi) {
                                        bg = 'rgba(168,85,247,0.12)'; border = '1px solid rgba(168,85,247,0.4)'; color = '#c084fc';
                                      }
                                      return (
                                        <button
                                          key={oi}
                                          onClick={() => { if (!quizSubmitted) setQuizAnswers(prev => ({ ...prev, [qi]: oi })); }}
                                          style={{
                                            textAlign: 'left', padding: '10px 14px', borderRadius: '8px',
                                            border, background: bg, color,
                                            fontSize: '0.85rem', cursor: quizSubmitted ? 'default' : 'pointer',
                                            transition: 'all 0.15s', fontWeight: quizAnswers[qi] === oi || (quizSubmitted && oi === q.correct) ? 600 : 400,
                                          }}
                                        >
                                          <span style={{ marginRight: '8px', opacity: 0.5 }}>{String.fromCharCode(65+oi)}.</span>
                                          {opt}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  {quizSubmitted && (
                                    <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6 }}>
                                      <strong style={{ color: '#c084fc' }}>Giải thích:</strong> {q.explanation}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {!quizSubmitted && (
                            <button
                              onClick={() => setQuizSubmitted(true)}
                              disabled={Object.keys(quizAnswers).length < quiz.length}
                              style={{
                                marginTop: '20px', padding: '10px 24px', borderRadius: '10px', border: 'none',
                                background: Object.keys(quizAnswers).length < quiz.length ? '#1e293b' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                color: Object.keys(quizAnswers).length < quiz.length ? '#475569' : '#fff',
                                fontWeight: 700, fontSize: '0.9rem',
                                cursor: Object.keys(quizAnswers).length < quiz.length ? 'not-allowed' : 'pointer',
                              }}
                            >
                              Nộp bài ({Object.keys(quizAnswers).length}/{quiz.length} câu đã trả lời)
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {/* Nav to next section */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                      {selectedSubject.theories.findIndex((s: any) => s.id === selectedSection.id) > 0 && (
                        <button
                          onClick={() => {
                            const idx = selectedSubject.theories.findIndex((s: any) => s.id === selectedSection.id);
                            setSelectedSection(selectedSubject.theories[idx - 1]);
                          }}
                          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.82rem' }}
                        >
                          ← Trước
                        </button>
                      )}
                      {selectedSubject.theories.findIndex((s: any) => s.id === selectedSection.id) < selectedSubject.theories.length - 1 && (
                        <button
                          onClick={() => {
                            const idx = selectedSubject.theories.findIndex((s: any) => s.id === selectedSection.id);
                            setSelectedSection(selectedSubject.theories[idx + 1]);
                          }}
                          style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                        >
                          Tiếp theo →
                        </button>
                      )}
                      {selectedSubject.exercises.length > 0 && (
                        <button
                          onClick={() => setActiveView('exercise')}
                          style={{ marginLeft: 'auto', padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'rgba(34,197,94,0.15)', color: '#4ade80', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Code2 size={14} /> Luyện tập →
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ color: '#64748b', textAlign: 'center', paddingTop: '60px' }}>
                    Chọn một mục trong danh sách bên trái để bắt đầu.
                  </div>
                )}
              </div>
            )}

          {/* ════════ EXERCISE VIEW ════════ */}
          {activeView === 'exercise' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              
              {/* Exercise picker bar */}
              <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '8px', flexWrap: 'wrap', background: 'rgba(0,0,0,0.1)', flexShrink: 0, alignItems: 'center' }}>
                {selectedSubject.exercises.map((ex: any) => (
                  <button
                    key={ex.id}
                    onClick={() => { setSelectedExercise(ex); setExecutionResult(null); setShowHint(false); setDescOpen(true); }}
                    style={{
                      padding: '5px 12px', borderRadius: '8px', border: '1px solid',
                      borderColor: selectedExercise?.id === ex.id ? diffColor(ex.difficulty) : 'rgba(255,255,255,0.08)',
                      background: selectedExercise?.id === ex.id ? diffBg(ex.difficulty) : 'transparent',
                      color: selectedExercise?.id === ex.id ? diffColor(ex.difficulty) : '#64748b',
                      cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ex.title}
                  </button>
                ))}
                {selectedSubject.exercises.length === 0 && (
                  <span style={{ color: '#475569', fontSize: '0.82rem', padding: '4px 0' }}>Môn này chưa có bài tập code.</span>
                )}
                <button
                  onClick={handleGenerateExercise}
                  disabled={isGeneratingExercise}
                  style={{
                    marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '5px 12px', borderRadius: '8px',
                    border: '1px solid rgba(34,197,94,0.3)',
                    background: isGeneratingExercise ? 'rgba(255,255,255,0.03)' : 'rgba(34,197,94,0.08)',
                    color: isGeneratingExercise ? '#475569' : '#4ade80',
                    fontSize: '0.75rem', fontWeight: 600, cursor: isGeneratingExercise ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  {isGeneratingExercise ? <><Loader2 size={12} className="animate-spin" /> Đang tạo...</> : <><Zap size={12} /> Sinh bài tập</>}
                </button>
              </div>


              {/* Exercise body */}
              {selectedExercise && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  
                  {/* Collapsible description */}
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, overflow: 'hidden', transition: 'all 0.3s' }}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setDescOpen(o => !o)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setDescOpen(o => !o) }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 20px', background: 'rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer',
                        color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: diffColor(selectedExercise.difficulty), fontWeight: 700 }}>{selectedExercise.difficulty}</span>
                        <span style={{ color: '#e2e8f0' }}>{selectedExercise.title}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          onClick={e => { e.stopPropagation(); setShowHint(h => !h); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            padding: '3px 10px', borderRadius: '6px', border: 'none',
                            background: showHint ? 'rgba(250,204,21,0.15)' : 'rgba(255,255,255,0.05)',
                            color: showHint ? '#facc15' : '#64748b', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          <Lightbulb size={12} /> Gợi ý
                        </button>
                        {descOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </div>
                    </div>

                    {descOpen && (
                      <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.05)', maxHeight: '300px', overflowY: 'auto' }}>
                        {showHint && selectedExercise.hint && (
                          <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', color: '#fde68a', fontSize: '0.82rem', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <Lightbulb size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                            {selectedExercise.hint}
                          </div>
                        )}
                        <div
                          className="theory-content"
                          style={{ fontSize: '0.85rem' }}
                          dangerouslySetInnerHTML={{ __html: selectedExercise.description }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Code Editor area */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Editor toolbar */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 16px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)',
                      flexShrink: 0,
                    }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(['cpp', 'javascript', 'python'] as const).map(lang => (
                          <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            style={{
                              padding: '5px 12px', borderRadius: '6px', border: '1px solid',
                              borderColor: language === lang ? 'rgba(56,189,248,0.4)' : 'transparent',
                              background: language === lang ? 'rgba(56,189,248,0.1)' : 'transparent',
                              color: language === lang ? '#38bdf8' : '#64748b',
                              fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                            }}
                          >
                            {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JS' : 'Python'}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={runCode}
                        disabled={isRunning}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '7px 18px', borderRadius: '8px', border: 'none',
                          background: isRunning ? '#334155' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                          color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                          cursor: isRunning ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                          boxShadow: isRunning ? 'none' : '0 0 20px rgba(34,197,94,0.3)',
                        }}
                      >
                        <Play size={14} fill="currentColor" />
                        {isRunning ? 'Chấm bài...' : 'Nộp & Chấm'}
                      </button>
                    </div>

                    {/* Editor + Console split (vertical) */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      {/* Code editor */}
                      <div style={{ flex: 1, overflowY: 'auto', background: '#1a1a2e', minHeight: '200px' }}>
                        <Editor
                          value={code}
                          onValueChange={setCode}
                          highlight={c => Prism.highlight(c, Prism.languages[language === 'cpp' ? 'cpp' : language], language)}
                          padding={20}
                          style={{
                            fontFamily: '"Fira Code", "JetBrains Mono", "Cascadia Code", monospace',
                            fontSize: 14, minHeight: '100%', color: '#d4d4d4', lineHeight: 1.6,
                          }}
                        />
                      </div>

                      {/* Console */}
                      <div style={{
                        borderTop: '1px solid rgba(255,255,255,0.07)',
                        background: 'rgba(0,0,0,0.3)',
                        maxHeight: executionResult ? '260px' : '50px',
                        transition: 'max-height 0.3s ease',
                        overflow: 'hidden', flexShrink: 0,
                      }}>
                        <div style={{
                          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px',
                          color: '#64748b', fontSize: '0.78rem', fontWeight: 600,
                          borderBottom: executionResult ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        }}>
                          <Terminal size={13} />
                          Console
                          {isRunning && <span style={{ color: '#38bdf8', marginLeft: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={12} /> Đang chấm...</span>}
                          {executionResult && (
                            <span style={{ marginLeft: '8px', fontWeight: 700, color: executionResult.status === 'Accepted' ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              {executionResult.status === 'Accepted' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                              {executionResult.status}
                            </span>
                          )}
                        </div>

                        {executionResult && (
                          <div style={{ padding: '12px 16px', overflowY: 'auto', maxHeight: '200px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {executionResult.error && (
                              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', padding: '10px 12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                                {executionResult.error}
                              </div>
                            )}
                            {executionResult.results?.map((res: any) => (
                              <div key={res.testCaseId} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                                <span style={{ color: res.passed ? '#4ade80' : '#f87171', marginTop: '1px' }}>
                                  {res.passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                </span>
                                <div style={{ flex: 1 }}>
                                  <span style={{ color: '#64748b' }}>Test #{res.testCaseId} </span>
                                  {!res.passed && (
                                    <span style={{ color: '#94a3b8' }}>
                                      Expected: <code style={{ color: '#86efac' }}>{res.expected}</code>
                                      {' | '}Got: <code style={{ color: '#fca5a5' }}>{res.actual || '(empty)'}</code>
                                    </span>
                                  )}
                                  {res.passed && <span style={{ color: '#4ade80' }}>Passed </span>}
                                  {res.error && <span style={{ color: '#fca5a5' }}> · {res.error}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════ QUIZ VIEW ════════ */}
          {activeView === 'quiz' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', maxWidth: '860px' }}>
              {quizLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', paddingTop: '60px', justifyContent: 'center' }}>
                  <Loader2 size={24} className="animate-spin" />
                  <span>Đang tải câu hỏi...</span>
                </div>
              ) : quizQuestions.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                  <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}><Brain size={48} color="#7c3aed" strokeWidth={1.5} /></div>
                  <div style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '8px', fontWeight: 600 }}>Chưa có câu hỏi quiz</div>
                  <div style={{ color: '#475569', fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto', marginBottom: '20px' }}>
                    Sử dụng siêu AI Gemini để tự động phân tích bài học và biên soạn bộ câu hỏi trắc nghiệm ngay bây giờ.
                  </div>
                  <button 
                    onClick={handleGenerateQuiz}
                    disabled={isGeneratingQuiz}
                    style={{
                      background: isGeneratingQuiz ? '#334155' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      cursor: isGeneratingQuiz ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: isGeneratingQuiz ? 'none' : '0 4px 15px rgba(124,58,237,0.3)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isGeneratingQuiz ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Đang biên soạn câu hỏi...
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        Tự động sinh Quiz bằng AI
                      </>
                    )}
                  </button>
                </div>
              ) : quizFinished ? (
                /* ── KẾT QUẢ ── */
                <div style={{ textAlign: 'center', paddingTop: '40px', animation: 'fadeIn 0.5s' }}>
                  <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                    <Trophy size={56} style={{ color: quizScore / quizQuestions.length >= 0.8 ? '#4ade80' : quizScore / quizQuestions.length >= 0.5 ? '#facc15' : '#f87171' }} />
                  </div>
                  <h2 style={{ margin: '0 0 8px', color: '#f1f5f9', fontSize: '1.8rem' }}>Hoàn thành!</h2>
                  <div style={{ color: '#64748b', marginBottom: '24px' }}>Kết quả của bạn</div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '20px 40px', borderRadius: '16px',
                    background: quizScore / quizQuestions.length >= 0.8
                      ? 'rgba(34,197,94,0.1)' : quizScore / quizQuestions.length >= 0.5
                      ? 'rgba(250,204,21,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${quizScore / quizQuestions.length >= 0.8
                      ? 'rgba(34,197,94,0.3)' : quizScore / quizQuestions.length >= 0.5
                      ? 'rgba(250,204,21,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    marginBottom: '32px',
                  }}>
                    <Trophy size={28} style={{ color: quizScore / quizQuestions.length >= 0.8 ? '#4ade80' : quizScore / quizQuestions.length >= 0.5 ? '#facc15' : '#f87171' }} />
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f1f5f9' }}>{quizScore}</span>
                    <span style={{ fontSize: '1.2rem', color: '#64748b' }}>/ {quizQuestions.length}</span>
                  </div>
                  <div style={{ color: '#94a3b8', marginBottom: '32px', fontSize: '0.95rem' }}>
                    {quizScore / quizQuestions.length >= 0.8 ? 'Xuất sắc! Bạn nắm vững kiến thức chương này.' :
                     quizScore / quizQuestions.length >= 0.5 ? 'Khá tốt! Ôn lại phần còn sai nhé.' :
                     'Cần ôn lại lý thuyết trước khi làm quiz.'}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
                    <button
                      onClick={resetQuiz}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '10px 24px', borderRadius: '10px', border: 'none',
                        background: 'rgba(167,139,250,0.15)', color: '#a78bfa',
                        fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(167,139,250,0.25)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(167,139,250,0.15)')}
                    >
                      <RotateCcw size={16} /> Làm lại
                    </button>
                    <button
                      onClick={() => setShowQuizReview(r => !r)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '10px 24px', borderRadius: '10px', border: '1px solid rgba(56,189,248,0.3)',
                        background: showQuizReview ? 'rgba(56,189,248,0.15)' : 'rgba(56,189,248,0.06)',
                        color: '#38bdf8', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                      }}
                    >
                      <BookOpen size={16} /> {showQuizReview ? 'Ẩn giải thích' : 'Xem lại đáp án'}
                    </button>
                  </div>

                  {/* Detailed Review Panel */}
                  {showQuizReview && (
                    <div style={{ textAlign: 'left', animation: 'fadeIn 0.3s', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {quizQuestions.map((q, idx) => {
                        const userAns = quizAnswered[idx];
                        const isCorrect = userAns === q.answerIndex;
                        const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
                        return (
                          <div key={q.id} style={{
                            padding: '16px', borderRadius: '12px',
                            border: `1px solid ${isCorrect ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
                            background: isCorrect ? 'rgba(34,197,94,0.04)' : 'rgba(239,68,68,0.04)',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                              {isCorrect
                                ? <CheckCircle2 size={16} color="#4ade80" style={{ flexShrink: 0, marginTop: '2px' }} />
                                : <XCircle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                              }
                              <span style={{ fontSize: '0.88rem', color: '#e2e8f0', fontWeight: 600 }}>
                                {idx + 1}. {q.question}
                              </span>
                            </div>
                            {!isCorrect && userAns !== undefined && (
                              <div style={{ fontSize: '0.8rem', color: '#f87171', paddingLeft: '26px', marginBottom: '6px' }}>
                                Bạn chọn: {opts[userAns]}
                              </div>
                            )}
                            <div style={{ fontSize: '0.8rem', color: '#4ade80', paddingLeft: '26px', marginBottom: '8px' }}>
                              Đáp án đúng: {opts[q.answerIndex]}
                            </div>
                            {q.explanation && (
                              <div style={{ fontSize: '0.78rem', color: '#94a3b8', paddingLeft: '26px', borderLeft: '2px solid rgba(255,255,255,0.06)', lineHeight: 1.6 }}>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* ── CÂU HỎI ── */
                <div style={{ animation: 'fadeIn 0.3s' }}>
                  {/* Progress bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '99px',
                        background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                        width: `${((currentQuizIdx + 1) / quizQuestions.length) * 100}%`,
                        transition: 'width 0.4s ease',
                      }} />
                    </div>
                    <span style={{ color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {currentQuizIdx + 1} / {quizQuestions.length}
                    </span>
                    <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 700 }}>
                      +{quizScore}
                    </span>
                  </div>

                  {/* Question */}
                  <div style={{
                    background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)',
                    borderRadius: '16px', padding: '28px 32px', marginBottom: '24px',
                  }}>
                    <div style={{ color: '#7c3aed', fontSize: '0.75rem', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Câu {currentQuizIdx + 1}
                    </div>
                    <p style={{ margin: 0, color: '#f1f5f9', fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.6 }}>
                      {quizQuestions[currentQuizIdx]?.question}
                    </p>
                  </div>

                  {/* Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                    {quizQuestions[currentQuizIdx]?.options.map((opt, idx) => {
                      const answered = quizAnswered[currentQuizIdx] !== undefined;
                      const isCorrect = idx === quizQuestions[currentQuizIdx].answerIndex;
                      const isSelected = quizAnswered[currentQuizIdx] === idx;
                      let bg = 'rgba(255,255,255,0.04)';
                      let border = '1px solid rgba(255,255,255,0.08)';
                      let color = '#cbd5e1';
                      if (answered) {
                        if (isCorrect) { bg = 'rgba(34,197,94,0.1)'; border = '1px solid rgba(34,197,94,0.35)'; color = '#86efac'; }
                        else if (isSelected) { bg = 'rgba(239,68,68,0.1)'; border = '1px solid rgba(239,68,68,0.35)'; color = '#fca5a5'; }
                      }
                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswerSelect(idx)}
                          disabled={answered}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: '14px',
                            padding: '14px 18px', borderRadius: '12px',
                            border, background: bg, color,
                            cursor: answered ? 'default' : 'pointer',
                            textAlign: 'left', fontSize: '0.92rem', lineHeight: 1.5,
                            transition: 'all 0.2s', fontFamily: 'inherit',
                          }}
                          onMouseEnter={e => { if (!answered) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                          onMouseLeave={e => { if (!answered) e.currentTarget.style.background = bg; }}
                        >
                          <span style={{
                            width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: answered && isCorrect ? 'rgba(34,197,94,0.2)' : answered && isSelected ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.07)',
                            fontWeight: 700, fontSize: '0.78rem',
                          }}>
                            {answered ? (isCorrect ? <CheckCircle2 size={14} style={{ color: '#4ade80' }} /> : isSelected ? <XCircle size={14} style={{ color: '#f87171' }} /> : ['A','B','C','D'][idx]) : ['A','B','C','D'][idx]}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {showExplanation && quizQuestions[currentQuizIdx]?.explanation && (
                    <div style={{
                      padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', animation: 'fadeIn 0.3s',
                      background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)',
                    }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <Lightbulb size={16} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
                        <p style={{ margin: 0, color: '#fde68a', fontSize: '0.88rem', lineHeight: 1.6 }}>
                          {quizQuestions[currentQuizIdx].explanation}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Next button */}
                  {showExplanation && (
                    <button
                      onClick={handleNextQuiz}
                      style={{
                        padding: '10px 28px', borderRadius: '10px', border: 'none',
                        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                        color: '#fff', fontWeight: 700, fontSize: '0.92rem',
                        cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: '0 0 20px rgba(124,58,237,0.3)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                    >
                      {currentQuizIdx < quizQuestions.length - 1 ? 'Câu tiếp theo →' : ' Xem kết quả'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ════════ IMPORT VIEW ════════ */}
          {activeView === 'import' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '40px', background: '#0f172a' }}>
              <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>
                  Thu thập dữ liệu (Zero-Token)
                </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '32px' }}>
              Nhập nội dung học tập vào môn <strong>{selectedSubject?.code} - {selectedSubject?.name}</strong> mà không cần tốn chi phí AI.
            </p>

            {importResult && (
              <div style={{
                padding: '16px', borderRadius: '12px', marginBottom: '24px',
                background: importResult.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${importResult.success ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: importResult.success ? '#4ade80' : '#fca5a5',
              }}>
                {importResult.msg}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Tạo Môn Học Cá Nhân (UGC) */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(74,222,128,0.1)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.1rem' }}>Tạo Môn Học Cá Nhân</h3>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Tự định nghĩa khóa học hoặc kỹ năng bạn muốn học</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text" placeholder="Mã môn (Vd: JAP101)"
                    value={ugcForm.code} onChange={e => setUgcForm({...ugcForm, code: e.target.value})}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  />
                  <input
                    type="text" placeholder="Tên môn học (Vd: Tiếng Nhật N3)"
                    value={ugcForm.name} onChange={e => setUgcForm({...ugcForm, name: e.target.value})}
                    style={{ flex: 2, padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text" placeholder="Tên chương đầu tiên (Tùy chọn)"
                    value={ugcForm.chapter} onChange={e => setUgcForm({...ugcForm, chapter: e.target.value})}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  />
                  <button
                    onClick={async () => {
                      if (!ugcForm.code || !ugcForm.name) return alert('Vui lòng nhập Mã và Tên môn học!');
                      setImportingType('ugc'); setImportResult(null);
                      try {
                        const res = await fetch('/api/subject/create', { 
                          method: 'POST', headers: {'Content-Type': 'application/json'}, 
                          body: JSON.stringify({ code: ugcForm.code, name: ugcForm.name, chapterTitles: ugcForm.chapter ? [ugcForm.chapter] : undefined }) 
                        });
                        const d = await res.json();
                        if (d.success) {
                          setImportResult({ success: true, msg: 'Đã tạo môn học thành công! Vui lòng refresh trang để cập nhật danh sách.' });
                          setUgcForm({ code: '', name: '', chapter: '' });
                        } else setImportResult({ success: false, msg: d.error || 'Lỗi server' });
                      } catch (e: any) { setImportResult({ success: false, msg: e.message }); }
                      finally { setImportingType(null); }
                    }}
                    disabled={importingType !== null}
                    style={{ padding: '0 24px', borderRadius: '8px', border: 'none', background: '#4ade80', color: '#0f172a', fontWeight: 700, cursor: importingType ? 'not-allowed' : 'pointer' }}
                  >
                    {importingType === 'ugc' ? <Loader2 size={18} className="animate-spin" /> : 'Tạo mới'}
                  </button>
                </div>
              </div>

              {/* Web Crawler */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Globe size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.1rem' }}>Web Crawler</h3>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Trích xuất bài viết từ GeeksforGeeks, Viblo, W3Schools...</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Nhập URL bài viết (https://...)"
                    value={importUrl}
                    onChange={e => setImportUrl(e.target.value)}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  />
                  <button
                    onClick={async () => {
                      if (!importUrl) return;
                      setImportingType('web'); setImportResult(null);
                      try {
                        const res = await fetch('/api/import/web', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ url: importUrl, subjectId: selectedSubject?.id }) });
                        const d = await res.json();
                        if (d.success) setImportResult({ success: true, msg: 'Đã import thành công lý thuyết mới!' });
                        else setImportResult({ success: false, msg: d.error || 'Lỗi server' });
                      } catch (e: any) { setImportResult({ success: false, msg: e.message }); }
                      finally { setImportingType(null); setImportUrl(''); }
                    }}
                    disabled={importingType !== null}
                    style={{ padding: '0 24px', borderRadius: '8px', border: 'none', background: '#38bdf8', color: '#0f172a', fontWeight: 700, cursor: importingType ? 'not-allowed' : 'pointer' }}
                  >
                    {importingType === 'web' ? <Loader2 size={18} className="animate-spin" /> : 'Import'}
                  </button>
                </div>
              </div>

              {/* GitHub Fetcher */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(167,139,250,0.1)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Code2 size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.1rem' }}>GitHub Markdown</h3>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Kéo các file ghi chú (.md) từ kho lưu trữ của sinh viên UIT</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Nhập URL file .md trên GitHub"
                    id="github-import-url"
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  />
                  <button
                    onClick={async () => {
                      const url = (document.getElementById('github-import-url') as HTMLInputElement).value;
                      if (!url) return;
                      setImportingType('github'); setImportResult(null);
                      try {
                        const res = await fetch('/api/import/github', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ url, subjectId: selectedSubject?.id }) });
                        const d = await res.json();
                        if (d.success) setImportResult({ success: true, msg: 'Đã kéo file GitHub thành công!' });
                        else setImportResult({ success: false, msg: d.error || 'Lỗi server' });
                      } catch (e: any) { setImportResult({ success: false, msg: e.message }); }
                      finally { setImportingType(null); (document.getElementById('github-import-url') as HTMLInputElement).value = ''; }
                    }}
                    disabled={importingType !== null}
                    style={{ padding: '0 24px', borderRadius: '8px', border: 'none', background: '#a78bfa', color: '#0f172a', fontWeight: 700, cursor: importingType ? 'not-allowed' : 'pointer' }}
                  >
                    {importingType === 'github' ? <Loader2 size={18} className="animate-spin" /> : 'Kéo về'}
                  </button>
                </div>
              </div>

              {/* PDF Upload */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(244,63,94,0.1)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.1rem' }}>PDF Slide Parser</h3>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Upload slide giảng viên để tự động trích xuất nội dung chữ</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept=".pdf"
                    id="pdf-upload"
                    style={{ color: '#94a3b8' }}
                  />
                  <button
                    onClick={async () => {
                      const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
                      const file = fileInput.files?.[0];
                      if (!file) return;
                      setImportingType('pdf'); setImportResult(null);
                      try {
                        const fd = new FormData();
                        fd.append('file', file);
                        if (selectedSubject) fd.append('subjectId', selectedSubject.id);
                        
                        const res = await fetch('/api/import/pdf', { method: 'POST', body: fd });
                        const d = await res.json();
                        if (d.success) setImportResult({ success: true, msg: 'Đã phân tích và lưu slide thành công!' });
                        else setImportResult({ success: false, msg: d.error || 'Lỗi server' });
                      } catch (e: any) { setImportResult({ success: false, msg: e.message }); }
                      finally { setImportingType(null); fileInput.value = ''; }
                    }}
                    disabled={importingType !== null}
                    style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#f43f5e', color: '#fff', fontWeight: 700, cursor: importingType ? 'not-allowed' : 'pointer', marginLeft: 'auto' }}
                  >
                    {importingType === 'pdf' ? <Loader2 size={18} className="animate-spin" /> : 'Tải lên & Phân tích'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
        </div>
      </div>

      {/* ── GLOBAL STYLES ── */}
      <style jsx global>{`
        .theory-content { 
          color: #cbd5e1; font-size: 0.95rem; line-height: 1.8; 
          word-wrap: break-word; overflow-wrap: break-word; 
        }
        /* Fix tràn viền hình ảnh */
        .theory-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; }
        .theory-content figure { max-width: 100%; margin: 10px 0; overflow-x: auto; }
        
        .theory-content h2 { color: #f1f5f9; font-size: 1.35rem; margin: 24px 0 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; }
        .theory-content h3 { color: #e2e8f0; font-size: 1.15rem; margin: 20px 0 12px; }
        .theory-content p { margin: 0 0 16px; }
        .theory-content ul, .theory-content ol { margin: 0 0 16px; padding-left: 20px; }
        .theory-content li { margin-bottom: 8px; }
        .theory-content code {
          background: rgba(56,189,248,0.08);
          border: 1px solid rgba(56,189,248,0.15);
          padding: 1px 6px; border-radius: 5px;
          font-family: "Fira Code", monospace;
          color: #7dd3fc; font-size: 0.88em;
        }
        .theory-content pre {
          background: #0d1117; padding: 20px; border-radius: 12px;
          margin: 12px 0 18px; border: 1px solid rgba(255,255,255,0.07);
          overflow-x: auto;
        }
        .theory-content pre code {
          background: transparent; border: none; padding: 0;
          color: #a5b4fc; font-size: 0.85rem; line-height: 1.7;
          white-space: pre; word-wrap: normal;
        }
        
        /* Fix tràn viền bảng (Tables) */
        .theory-content table {
          width: 100%; border-collapse: collapse; margin: 16px 0;
          font-size: 0.85rem; display: block; overflow-x: auto; white-space: nowrap;
          background: rgba(15,23,42,0.5);
        }
        .theory-content th {
          background: rgba(56,189,248,0.08); color: #7dd3fc;
          padding: 10px 14px; text-align: left; font-weight: 700;
          border-bottom: 1px solid rgba(56,189,248,0.2);
        }
        .theory-content td {
          padding: 9px 14px; border-bottom: 1px solid rgba(255,255,255,0.05);
          color: #94a3b8;
        }
        .theory-content tr:hover td { background: rgba(255,255,255,0.02); }
        .theory-content strong { color: #e2e8f0; }
        .theory-content em { color: #94a3b8; }
        .theory-content hr { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 24px 0; }
        .theory-content a { color: #38bdf8; text-decoration: none; }
        .theory-content a:hover { text-decoration: underline; }
        
        /* Ẩn các class rác của Wikipedia */
        .theory-content .mw-editsection, 
        .theory-content .reference, 
        .theory-content .navbox, 
        .theory-content .infobox, 
        .theory-content .ambox,
        .theory-content .reflist,
        .theory-content .noprint { display: none !important; }

        /* Source attribution badges */
        .source-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.75rem; color: #64748b;
          background: rgba(56,189,248,0.06); border: 1px solid rgba(56,189,248,0.15);
          padding: 5px 12px; border-radius: 6px; margin-bottom: 20px;
        }
        .source-badge a { color: #38bdf8; text-decoration: none; }
        .source-badge a:hover { text-decoration: underline; }
        .source-badge--ai { background: rgba(124,58,237,0.06); border-color: rgba(124,58,237,0.2); }

        /* GFG / Programiz content normalization */
        .gfg-content, .programiz-content { color: #cbd5e1; }
        .gfg-content pre, .programiz-content pre { background: rgba(0,0,0,0.4) !important; border-radius: 8px !important; padding: 16px !important; overflow-x: auto; }
        .gfg-content code, .programiz-content code { background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; font-size: 0.88rem; }
        .gfg-content h2, .programiz-content h2 { color: #f1f5f9; font-size: 1.35rem; margin: 24px 0 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; }
        .gfg-content h3, .programiz-content h3 { color: #e2e8f0; font-size: 1.15rem; margin: 20px 0 12px; }
        .gfg-content img, .programiz-content img { max-width: 100%; height: auto; border-radius: 6px; filter: brightness(0.9); }
        .gfg-content .advertisement, .programiz-content .advertisement,
        .gfg-content nav, .programiz-content nav,
        .gfg-content footer, .programiz-content footer { display: none !important; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
