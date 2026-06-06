'use client';

import { useState } from 'react';
import { QuizQuestion } from '@/lib/utils/careerEngine';
import { CheckCircle2, XCircle, ChevronRight, HelpCircle, AlertCircle } from 'lucide-react';
import { addExp, saveQuizResult } from '@/app/career/actions'; // Reuse addExp to reward the user
// Wait, we don't have skillId in Blueprint. Let's just mock the EXP UI for now, or don't call addExp directly without skillId.
// Actually, we can just show a fake EXP +50 visual effect.

interface Props {
  questions: QuizQuestion[];
}

export default function CareerQuiz({ questions }: Props) {
  const [answers, setAnswers] = useState<Record<string, {
    isCorrect: boolean;
    userAnswer: string;
  }>>({});

  const [textInputs, setTextInputs] = useState<Record<string, string>>({});

  const handleSelectMultipleChoice = async (q: QuizQuestion, option: string) => {
    if (answers[q.id]) return; // Đã trả lời rồi thì không đổi được nữa
    
    const isCorrect = option === q.correctAnswer;
    setAnswers(prev => ({
      ...prev,
      [q.id]: { isCorrect, userAnswer: option }
    }));
    
    await saveQuizResult(q.id, q.question, option, isCorrect);
  };

  const handleSubmitText = async (q: QuizQuestion) => {
    if (answers[q.id]) return;
    
    const userInput = (textInputs[q.id] || '').toLowerCase().trim();
    if (!userInput) return;

    // Lấy mảng từ khóa đúng
    const keywords = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer as string];
    
    // Kiểm tra xem input có chứa ÍT NHẤT MỘT từ khóa hợp lệ không (OR logic)
    const isCorrect = keywords.some(kw => userInput.includes(kw.toLowerCase()));

    setAnswers(prev => ({
      ...prev,
      [q.id]: { isCorrect, userAnswer: userInput }
    }));
    
    await saveQuizResult(q.id, q.question, userInput, isCorrect);
  };

  const getScore = () => {
    return Object.values(answers).filter(a => a.isCorrect).length;
  };

  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {questions.map((q, index) => {
        const answeredState = answers[q.id];
        
        return (
          <div key={q.id} className="glass-panel" style={{ 
            background: 'rgba(0,0,0,0.2)', 
            border: answeredState 
              ? answeredState.isCorrect 
                ? '1px solid rgba(16, 185, 129, 0.4)' 
                : '1px solid rgba(239, 68, 68, 0.4)'
              : '1px solid var(--glass-border)',
            padding: '24px', 
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background highlight if answered */}
            {answeredState && (
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '4px', height: '100%',
                background: answeredState.isCorrect ? '#10b981' : '#ef4444'
              }} />
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                Q{index + 1}
              </div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', flex: 1, lineHeight: 1.5 }}>
                {q.question}
              </h3>
            </div>

            {/* Render Multiple Choice */}
            {q.type === 'multiple_choice' && q.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', marginLeft: '48px' }}>
                {q.options.map(opt => {
                  const isSelected = answeredState?.userAnswer === opt;
                  let btnBg = 'rgba(255,255,255,0.03)';
                  let btnBorder = '1px solid var(--glass-border)';
                  let icon = null;

                  if (answeredState) {
                    if (opt === q.correctAnswer) {
                      btnBg = 'rgba(16, 185, 129, 0.1)';
                      btnBorder = '1px solid #10b981';
                      icon = <CheckCircle2 size={18} color="#10b981" />;
                    } else if (isSelected && !answeredState.isCorrect) {
                      btnBg = 'rgba(239, 68, 68, 0.1)';
                      btnBorder = '1px solid #ef4444';
                      icon = <XCircle size={18} color="#ef4444" />;
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectMultipleChoice(q, opt)}
                      disabled={!!answeredState}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', borderRadius: '8px', background: btnBg, border: btnBorder,
                        color: '#fff', textAlign: 'left', cursor: answeredState ? 'default' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>{opt}</span>
                      {icon}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Render Text Input */}
            {q.type === 'text_input' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', marginLeft: '48px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input 
                    value={textInputs[q.id] || ''}
                    onChange={(e) => setTextInputs({ ...textInputs, [q.id]: e.target.value })}
                    disabled={!!answeredState}
                    placeholder="Nhập câu trả lời của bạn..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmitText(q);
                    }}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }}
                  />
                  {!answeredState && (
                    <button 
                      onClick={() => handleSubmitText(q)}
                      className="btn"
                      style={{ background: '#38bdf8', color: '#0f172a', fontWeight: 'bold', padding: '0 20px' }}
                    >
                      Trả lời
                    </button>
                  )}
                </div>

                {answeredState && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: answeredState.isCorrect ? '#10b981' : '#ef4444', fontWeight: 500 }}>
                    {answeredState.isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    {answeredState.isCorrect ? 'Chính xác! Bạn đã tìm đúng từ khóa.' : `Sai rồi. Các từ khóa được chấp nhận: ${(q.correctAnswer as string[]).join(', ')}`}
                  </div>
                )}
              </div>
            )}

            {/* Render Explanation */}
            {answeredState && (
              <div style={{ marginTop: '20px', marginLeft: '48px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: '3px solid #38bdf8', animation: 'fadeIn 0.3s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  <HelpCircle size={16} /> Giải thích chi tiết
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {q.explanation}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {allAnswered && (
        <div style={{ padding: '24px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '16px', textAlign: 'center', animation: 'fadeIn 0.5s' }}>
          <h2 style={{ color: '#10b981', margin: '0 0 8px 0' }}>Kết quả bài kiểm tra</h2>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '16px' }}>
            {getScore()} / {questions.length}
          </div>
          {getScore() === questions.length ? (
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Xuất sắc! Bạn đã vượt qua bài test năng lực. +100 EXP!</p>
          ) : (
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Cần cố gắng hơn! Hãy xem lại phần giải thích để nắm vững kiến thức nhé.</p>
          )}
        </div>
      )}

    </div>
  );
}
