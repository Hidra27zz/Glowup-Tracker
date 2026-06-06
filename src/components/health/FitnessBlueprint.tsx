'use client';

import { useState, useEffect } from 'react';
import { Target, MapPin, Apple, Dumbbell, Calendar, Video, Check, X } from 'lucide-react';
import { Blueprint } from '@/lib/utils/blueprintEngine';
import { generateFitnessBlueprintAI } from '@/lib/actions/health.actions';
import { searchYoutubeWorkouts, DynamicYoutubeWorkout } from '@/lib/actions/youtube.actions';
import { updateUserSettings } from '@/lib/actions/health.actions';

interface Props {
  initialBlueprint?: string | null;
}

export default function FitnessBlueprint({ initialBlueprint }: Props) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [videos, setVideos] = useState<DynamicYoutubeWorkout[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (initialBlueprint) {
      try {
        const bp = JSON.parse(initialBlueprint) as Blueprint;
        setBlueprint(bp);
        setIsSaved(true);
        // Tự động search video khi load plan đã lưu
        searchYoutubeWorkouts(bp.youtubeQuery).then(setVideos).catch(console.error);
      } catch (e) {}
    }
  }, [initialBlueprint]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setLoading(true);
    const bp = await generateFitnessBlueprintAI(prompt);
    setBlueprint(bp);
    setIsSaved(false);

    try {
      const results = await searchYoutubeWorkouts(bp.youtubeQuery);
      setVideos(results);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!blueprint) return;
    setLoading(true);
    await updateUserSettings({ activeBlueprint: JSON.stringify(blueprint) });
    setIsSaved(true);
    setLoading(false);
  };

  const handleClear = async () => {
    setLoading(true);
    await updateUserSettings({ activeBlueprint: null });
    setBlueprint(null);
    setVideos([]);
    setIsSaved(false);
    setPrompt('');
    setLoading(false);
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', gridColumn: '1 / -1', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(96, 165, 250, 0.2)', padding: '10px', borderRadius: '12px' }}>
            <Target size={24} color="#60a5fa" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>GlowUp Blueprint</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {isSaved ? 'Lộ trình đang áp dụng' : 'AI tự động lên lộ trình tập luyện và ăn uống dành riêng cho bạn'}
            </p>
          </div>
        </div>

        {isSaved && (
          <button 
            onClick={handleClear}
            disabled={loading}
            className="btn"
            style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#ef4444', display: 'flex', gap: '4px', padding: '6px 12px' }}
          >
            <X size={16} /> Hủy Kế Hoạch
          </button>
        )}
      </div>

      {!isSaved && (
        <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Mô tả mục tiêu thể chất của bạn (vd: Giảm mỡ toàn thân, Phát triển nhóm cơ thân trên...)"
            style={{ 
              flex: 1, padding: '12px 16px', borderRadius: '12px', 
              background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', 
              color: '#fff', outline: 'none', fontSize: '1rem'
            }}
          />
          <button 
            type="submit" 
            disabled={loading || !prompt.trim()}
            className="btn"
            style={{ 
              background: '#60a5fa', color: '#0f172a', fontWeight: 'bold', 
              padding: '0 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px',
              opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Đang phân tích...' : 'Lên Kế Hoạch'}
          </button>
        </form>
      )}

      {blueprint && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px', animation: 'fadeIn 0.5s ease-out' }}>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="#f43f5e" /> Vùng tập trung: <strong>{blueprint.focusArea}</strong>
              </span>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Target size={14} color="#10b981" /> Chiến lược: <strong>{blueprint.goalType}</strong>
              </span>
            </div>
            
            {!isSaved && (
              <button 
                onClick={handleSave}
                disabled={loading}
                className="btn btn-primary"
                style={{ background: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 16px' }}
              >
                <Check size={16} /> {loading ? 'Đang lưu...' : 'Áp Dụng Lộ Trình Này'}
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Dinh dưỡng */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                <Apple size={20} /> Chiến lược Dinh dưỡng
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {blueprint.nutrition.map((item, i) => (
                  <li key={i} style={{ lineHeight: '1.5' }}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Tập luyện */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#fb923c' }}>
                <Dumbbell size={20} /> Chế độ Tập luyện
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {blueprint.workout.map((item, i) => (
                  <li key={i} style={{ lineHeight: '1.5' }}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc' }}>
              <Calendar size={20} /> Tiến trình Hành động
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {blueprint.timeline.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(192, 132, 252, 0.2)', color: '#c084fc', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 'bold', fontSize: '0.8rem' }}>
                    {i + 1}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', paddingTop: '4px' }}>
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Playlist */}
          {videos.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                <Video size={20} /> Playlist Dành Riêng Cho Bạn
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {videos.map(video => (
                  <div key={video.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '8px', overflow: 'hidden' }}>
                      <iframe
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                        src={`https://www.youtube.com/embed/${video.id}`}
                        title={video.title}
                        allowFullScreen
                      />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', lineHeight: '1.3' }}>
                        <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>
                          {video.title} ↗
                        </a>
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {video.channel} • {video.duration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
