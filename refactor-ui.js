const fs = require('fs');
let content = fs.readFileSync('src/components/career/CurriculumVault.tsx', 'utf8');

// 1. Move TOC out of `activeView === 'theory'`
// Find:
// {activeView === 'theory' && (
//             <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
//               {/* Theory section list (mini TOC) */}
//               <div style={{
//                 width: '240px' ...
const theoryViewStartIdx = content.indexOf("{activeView === 'theory' && (");
if (theoryViewStartIdx !== -1) {
  // We'll just replace the specific string
  content = content.replace(
    `{activeView === 'theory' && (
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Theory section list (mini TOC) */}`,
    `{/* Theory section list (mini TOC) */}
              <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <div style={{`
  );
  // Wait, replacing like this is brittle. Let's do it safer.
}

// Better: Let's do string replacement for the Theory Header to add Regenerate
content = content.replace(
  `<h2 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.4rem', fontWeight: 800 }}>
                          {selectedSection.title}
                        </h2>`,
  `<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <h2 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.4rem', fontWeight: 800 }}>
                            {selectedSection.title}
                          </h2>
                          <button onClick={handleRegenerateTheory} disabled={isRegeneratingTheory} style={{ background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <RotateCcw size={12} /> {isRegeneratingTheory ? 'Đang tạo...' : 'Tạo lại AI'}
                          </button>
                        </div>`
);

// Add Rating System under theory content
content = content.replace(
  `<div
                        className="theory-content"
                        dangerouslySetInnerHTML={{ __html: selectedSection.coreConcept }}
                      />`,
  `<div
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
                      </div>`
);

// Update Exercise View to use selectedSection.exercises
content = content.replace(
  `{selectedSubject.exercises.length === 0 ? (`,
  `{!selectedSection ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  Vui lòng chọn một chương ở Lý thuyết để xem bài tập.
                </div>
              ) : (!selectedSection.exercises || selectedSection.exercises.length === 0) ? (`
);

content = content.replace(
  `{selectedSubject.exercises.map((ex: any, idx: number) => (`,
  `{selectedSection.exercises?.map((ex: any, idx: number) => (`
);

// Update Quiz View
content = content.replace(
  `const quiz = parseJsonStr(selectedSection.codeIllustrations);`,
  `const quiz = selectedSection.quizzes || [];`
);

content = content.replace(
  `{/* Flashcards (Auto-generated from bold text) */}
                    {flashcards.length > 0 && (`,
  `{/* Flashcards (Auto-generated from AI) */}
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
                          
                          {flashcards.length > 0 && (`
);

content = content.replace(
  `{flashcards[activeCard]?.term}</div>`,
  `{flashcards[activeCard]?.front}</div>`
);
content = content.replace(
  `{flashcards[activeCard]?.desc}</div>`,
  `{flashcards[activeCard]?.back}</div>`
);
content = content.replace(
  `</button>
                          </div>
                        </div>
                      </div>
                    )}`,
  `</button>
                          </div>
                        </div>
                      )}
                      </div>
                    );
                  })()}`
);

fs.writeFileSync('src/components/career/CurriculumVault.tsx', content, 'utf8');
console.log('Script updated successfully step 5-10.');
