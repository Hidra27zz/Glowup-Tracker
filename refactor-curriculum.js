const fs = require('fs');
let content = fs.readFileSync('src/components/career/CurriculumVault.tsx', 'utf8');

// 1. Add handleGenerateFlashcards and handleRegenerateTheory
const newHandlers = `
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
        setSelectedSection(prev => prev ? { ...prev, rating } : null);
      }
    } catch(e) {}
  };
`;
content = content.replace('const handleGenerateExercise = async () => {', newHandlers + '\n  const handleGenerateExercise = async () => {');

// 2. Modify handleGenerateExercise to use sectionId
content = content.replace(
  `subjectCode: selectedSubject.code,
          subjectName: selectedSubject.name,
          forceGenerate: true`,
  `subjectCode: selectedSubject.code,
          subjectName: selectedSubject.name,
          sectionId: selectedSection?.id,
          forceGenerate: true`
);
// In handleGenerateExercise, update selectedSection too
content = content.replace(
  `if (freshSub) { setSelectedSubject(freshSub); setSelectedExercise(freshSub.exercises[0] || null); }`,
  `if (freshSub) {
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
          }`
);

// 3. Modify handleGenerateQuiz to use sectionId
content = content.replace(
  `subjectCode: selectedSubject.code,
          subjectName: selectedSubject.name,
          chapterTitle: selectedSection.title,
          coreConcept: selectedSection.coreConcept`,
  `subjectCode: selectedSubject.code,
          subjectName: selectedSubject.name,
          chapterTitle: selectedSection.title,
          coreConcept: selectedSection.coreConcept,
          sectionId: selectedSection.id`
);

// 4. Update the activeView tabs to use selectedSection.exercises.length
content = content.replace(
  `{ key: 'exercise', label: 'Bài tập', icon: <Code2 size={14} />, badge: selectedSubject.exercises.length }`,
  `{ key: 'exercise', label: 'Bài tập', icon: <Code2 size={14} />, badge: selectedSection?.exercises?.length || 0 }`
);

fs.writeFileSync('src/components/career/CurriculumVault.tsx', content, 'utf8');
console.log('Script updated successfully step 1-4.');
