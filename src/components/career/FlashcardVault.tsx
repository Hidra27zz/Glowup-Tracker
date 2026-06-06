'use client';

import { useState } from 'react';
import { Layers, Plus, Trash2, RotateCw, Brain, UploadCloud, AlertCircle, Play, ChevronRight, MessageSquare, PlusCircle } from 'lucide-react';
import { FlashcardDeck, Flashcard } from '@prisma/client';
import { createFlashcardDeck, createFlashcard, deleteFlashcardDeck, deleteFlashcard, updateFlashcardMastery, bulkCreateFlashcards } from '@/app/career/actions';

interface DeckWithCards extends FlashcardDeck {
  cards: Flashcard[];
}

interface Props {
  decks: DeckWithCards[];
}

export default function FlashcardVault({ decks }: Props) {
  const [loading, setLoading] = useState(false);
  const [showNewDeck, setShowNewDeck] = useState(false);
  const [activeDeck, setActiveDeck] = useState<string | null>(null);
  
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);

  const [showNewCard, setShowNewCard] = useState<string | null>(null);
  const [showBulk, setShowBulk] = useState<string | null>(null);

  const categories = Array.from(new Set(decks.map(d => d.category)));
  const now = new Date();
  const dueCardsCount = decks.reduce((sum, deck) => sum + deck.cards.filter(c => new Date(c.nextReview) <= now).length, 0);

  const handleCreateDeck = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const category = (form.elements.namedItem('category') as HTMLInputElement).value || 'General';
    await createFlashcardDeck(name, category);
    form.reset();
    setShowNewDeck(false);
    setLoading(false);
  };

  const handleCreateCard = async (e: React.FormEvent<HTMLFormElement>, deckId: string) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const front = (form.elements.namedItem('front') as HTMLInputElement).value;
    const back = (form.elements.namedItem('back') as HTMLTextAreaElement).value;
    await createFlashcard(deckId, front, back);
    form.reset();
    setShowNewCard(null);
    setLoading(false);
  };

  const handleBulkImport = async (e: React.FormEvent<HTMLFormElement>, deckId: string) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const text = (form.elements.namedItem('bulkText') as HTMLTextAreaElement).value;
    
    const lines = text.split('\n');
    const cards = lines.map(line => {
      let parts = line.split('\t');
      if (parts.length < 2) parts = line.split('|');
      return { front: parts[0]?.trim() || '', back: parts[1]?.trim() || '' };
    }).filter(c => c.front && c.back);

    if (cards.length > 0) {
      await bulkCreateFlashcards(deckId, cards);
    }
    
    form.reset();
    setShowBulk(null);
    setLoading(false);
  };

  const startStudy = (deckId: string) => {
    const currentDeck = decks.find(d => d.id === deckId);
    if (!currentDeck) return;
    
    const due = currentDeck.cards.filter(c => new Date(c.nextReview) <= now);
    const cardsToStudy = due.length > 0 ? due : currentDeck.cards;

    setStudyCards(cardsToStudy);
    setActiveDeck(deckId);
    setStudyMode(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const nextCard = async (masteryValue: number) => {
    const card = studyCards[currentCardIndex];
    if (card) {
      await updateFlashcardMastery(card.id, masteryValue);
    }

    if (currentCardIndex < studyCards.length - 1) {
      setIsFlipped(false);
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setStudyMode(false);
      setActiveDeck(null);
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: '10px 14px', borderRadius: '10px',
    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff', fontSize: '0.85rem', outline: 'none', width: '100%',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.25), rgba(244,114,182,0.15))', padding: '14px', borderRadius: '16px', border: '1px solid rgba(236,72,153,0.2)' }}>
          <Layers size={26} color="#ec4899" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Flashcard Vault</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Học từ vựng và khái niệm qua Spaced Repetition</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left: Deck Management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Thư viện Thẻ</h3>
            <button onClick={() => setShowNewDeck(!showNewDeck)} style={{ background: 'rgba(236,72,153,0.15)', color: '#f472b6', border: '1px solid rgba(236,72,153,0.3)', borderRadius: '10px', padding: '8px 14px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <Plus size={16} /> Tạo Bộ Mới
            </button>
          </div>

          {showNewDeck && (
            <form onSubmit={handleCreateDeck} style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', animation: 'fadeIn 0.2s' }}>
              <input name="name" placeholder="Tên bộ thẻ (VD: Thuật ngữ Cloud, Tiếng Anh)" required autoFocus style={inputStyle} />
              <input name="category" placeholder="Nhóm / Topic (VD: Tech, Ngôn ngữ)" required style={inputStyle} />
              <button type="submit" disabled={loading} style={{ background: '#ec4899', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                Lưu Bộ Thẻ
              </button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {categories.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 20px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '14px' }}>
                Chưa có bộ thẻ nào. Bấm "Tạo Bộ Mới" để bắt đầu.
              </div>
            ) : (
              categories.map(cat => (
                <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f472b6', textTransform: 'uppercase', letterSpacing: '0.5px', paddingLeft: '4px' }}>
                    {cat}
                  </div>
                  
                  {decks.filter(d => d.category === cat).map(deck => {
                    const dueCount = deck.cards.filter(c => new Date(c.nextReview) <= now).length;
                    
                    return (
                      <div key={deck.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', transition: 'all 0.2s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>{deck.name}</h4>
                              {dueCount > 0 && <span style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '20px', fontWeight: 700, border: '1px solid rgba(239,68,68,0.3)' }}>{dueCount} due</span>}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{deck.cards.length} cards</div>
                          </div>
                          <button onClick={() => deleteFlashcardDeck(deck.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', opacity: 0.6, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity='1'} onMouseLeave={e => e.currentTarget.style.opacity='0.6'}>
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => startStudy(deck.id)} disabled={deck.cards.length === 0} style={{ flex: 1, background: dueCount > 0 ? 'linear-gradient(135deg, #ef4444, #f43f5e)' : 'rgba(236,72,153,0.15)', color: dueCount > 0 ? '#fff' : '#f472b6', border: dueCount > 0 ? 'none' : '1px solid rgba(236,72,153,0.3)', padding: '8px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: deck.cards.length === 0 ? 'not-allowed' : 'pointer', opacity: deck.cards.length === 0 ? 0.5 : 1 }}>
                            <Play size={14} /> Học Ngay
                          </button>
                          <button onClick={() => { setShowNewCard(showNewCard === deck.id ? null : deck.id); setShowBulk(null); }} style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }} title="Thêm 1 Card">
                            <PlusCircle size={16} />
                          </button>
                          <button onClick={() => { setShowBulk(showBulk === deck.id ? null : deck.id); setShowNewCard(null); }} style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }} title="Nhập hàng loạt">
                            <UploadCloud size={16} />
                          </button>
                        </div>

                        {showNewCard === deck.id && (
                          <form onSubmit={(e) => handleCreateCard(e, deck.id)} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', animation: 'fadeIn 0.2s', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                            <input name="front" placeholder="Mặt trước (Câu hỏi)" required autoFocus style={inputStyle} />
                            <textarea name="back" placeholder="Mặt sau (Đáp án)" required style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} />
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button type="submit" disabled={loading} style={{ flex: 1, background: '#10b981', color: '#fff', padding: '8px', borderRadius: '8px', border: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Lưu Card</button>
                              <button type="button" onClick={() => setShowNewCard(null)} style={{ background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '0.8rem', cursor: 'pointer' }}>Hủy</button>
                            </div>
                          </form>
                        )}

                        {showBulk === deck.id && (
                          <form onSubmit={(e) => handleBulkImport(e, deck.id)} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', animation: 'fadeIn 0.2s', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Dán từ Excel (cách nhau bởi Tab)</div>
                            <textarea name="bulkText" placeholder="Mặt trước 1&#9;Mặt sau 1&#10;Mặt trước 2&#9;Mặt sau 2" required autoFocus style={{ ...inputStyle, minHeight: '120px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem' }} />
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button type="submit" disabled={loading} style={{ flex: 1, background: '#a855f7', color: '#fff', padding: '8px', borderRadius: '8px', border: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Import</button>
                              <button type="button" onClick={() => setShowBulk(null)} style={{ background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '0.8rem', cursor: 'pointer' }}>Hủy</button>
                            </div>
                          </form>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Study Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', height: '100%', minHeight: '500px' }}>
          
          {!studyMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', textAlign: 'center', gap: '16px' }}>
              <Brain size={64} color="rgba(255,255,255,0.05)" />
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#cbd5e1', fontSize: '1.2rem' }}>Khu vực Học tập</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', maxWidth: '300px', lineHeight: 1.6 }}>Chọn "Học Ngay" ở một bộ thẻ bất kỳ để bắt đầu ôn tập theo phương pháp Spaced Repetition.</p>
              </div>
              {dueCardsCount > 0 && (
                <div style={{ marginTop: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: '#fca5a5' }}>
                  <AlertCircle size={20} />
                  <span style={{ fontSize: '0.85rem' }}>Bạn có <strong>{dueCardsCount}</strong> thẻ tới hạn cần ôn.</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, color: '#f472b6', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Brain size={18} /> Đang học
                </h3>
                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
                  {currentCardIndex + 1} / {studyCards.length}
                </span>
              </div>

              {/* 3D Flip Card */}
              <div onClick={() => setIsFlipped(!isFlipped)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1000px', cursor: 'pointer', minHeight: '300px' }}>
                <div style={{ width: '100%', height: '100%', maxWidth: '400px', position: 'relative', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)', transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)' }}>
                  
                  {/* Front */}
                  <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(236,72,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                    <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: 0, fontWeight: 600, lineHeight: 1.5 }}>{studyCards[currentCardIndex]?.front}</h2>
                    <div style={{ position: 'absolute', bottom: '24px', color: '#64748b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <RotateCw size={14} /> Chạm để lật
                    </div>
                  </div>
                  
                  {/* Back */}
                  <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', background: 'rgba(236,72,153,0.08)', borderRadius: '20px', border: '1px solid rgba(236,72,153,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center', transform: 'rotateX(180deg)' }}>
                    <p style={{ fontSize: '1.1rem', color: '#fff', margin: 0, lineHeight: 1.7 }}>{studyCards[currentCardIndex]?.back}</p>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '40px', opacity: isFlipped ? 1 : 0, pointerEvents: isFlipped ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
                <button onClick={(e) => { e.stopPropagation(); nextCard(0); }} style={{ flex: 1, background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '14px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                  Mai học lại
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextCard(1); }} style={{ flex: 1, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', padding: '14px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                  Tạm ổn (3d)
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextCard(2); }} style={{ flex: 1, background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '14px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                  Đã thuộc (7d)
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button onClick={() => setStudyMode(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='#fff'} onMouseLeave={e => e.currentTarget.style.color='#64748b'}>
                  Thoát phiên học
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
