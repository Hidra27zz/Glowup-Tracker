'use client';

import { useState } from 'react';
import { ChefHat, ShoppingBasket, Trash2, Clock, Flame, ChevronRight, Video, Play } from 'lucide-react';
import { PantryItem } from '@prisma/client';
import PantryTracker from '@/components/health/PantryTracker';
import { searchYoutubeRecipes, DynamicYoutubeWorkout } from '@/lib/actions/youtube.actions';

interface Props {
  pantryItems: PantryItem[];
}

const TABS = [
  { id: 'pantry', label: 'Tủ Lạnh & Nguyên Liệu', icon: ShoppingBasket, accent: '#10b981' },
  { id: 'recipes', label: 'Công Thức (AI)', icon: ChefHat, accent: '#f59e0b' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function NutritionHub({ pantryItems }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('pantry');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [videos, setVideos] = useState<DynamicYoutubeWorkout[]>([]);

  const currentTab = TABS.find(t => t.id === activeTab)!;

  const handleSearchYoutube = async () => {
    if (selectedIngredients.length === 0) return;
    setIsSearching(true);
    try {
      const results = await searchYoutubeRecipes(selectedIngredients);
      setVideos(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
      
      {/* ── Top navigation bar ── */}
      <div style={{ display: 'flex', gap: '4px', background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px 20px 0 0', padding: '6px' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '14px 8px', borderRadius: '14px', border: 'none', background: active ? `linear-gradient(135deg, ${tab.accent}22, ${tab.accent}10)` : 'transparent', borderBottom: active ? `2px solid ${tab.accent}` : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s', outline: 'none' }}
            >
              <Icon size={18} color={active ? tab.accent : '#64748b'} strokeWidth={active ? 2.5 : 1.5} />
              <span style={{ fontSize: '0.75rem', fontWeight: active ? 700 : 500, color: active ? tab.accent : '#64748b' }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Breadcrumb strip ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: 'rgba(15,23,42,0.5)', borderLeft: '1px solid rgba(255,255,255,0.06)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: '0.78rem', color: '#475569' }}>Nutrition Hub</span>
        <ChevronRight size={12} color="#334155" />
        <span style={{ fontSize: '0.78rem', color: currentTab.accent, fontWeight: 600 }}>{currentTab.label}</span>
      </div>

      {/* ── Content panel ── */}
      <div style={{ flex: 1, background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', borderRadius: '0 0 20px 20px', padding: '24px', backdropFilter: 'blur(16px)' }}>
        
        {/* --- PANTRY TAB --- */}
        {activeTab === 'pantry' && (
          <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: '800px', margin: '0 auto' }}>
            <PantryTracker items={pantryItems} />
          </div>
        )}

        {/* --- RECIPES TAB --- */}
        {activeTab === 'recipes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                  <div style={{ background: 'rgba(245,158,11,0.15)', padding: '8px', borderRadius: '10px' }}>
                    <ChefHat size={22} color="#f59e0b" />
                  </div>
                  Tìm Video Hướng dẫn Nấu ăn
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>Chọn nguyên liệu có sẵn trong tủ lạnh để tìm cách nấu trên YouTube.</p>
              </div>

              {pantryItems.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>Tủ lạnh của bạn đang trống.</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                  {pantryItems.map(item => {
                    const isSelected = selectedIngredients.includes(item.name);
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (isSelected) setSelectedIngredients(prev => prev.filter(i => i !== item.name));
                          else setSelectedIngredients(prev => [...prev, item.name]);
                        }}
                        style={{
                          background: isSelected ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${isSelected ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                          color: isSelected ? '#fbbf24' : '#cbd5e1',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          fontWeight: isSelected ? 600 : 400,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {item.name} {isSelected && <span style={{ fontSize: '1.1rem', lineHeight: 0 }}></span>}
                      </button>
                    );
                  })}
                </div>
              )}

              <button 
                onClick={handleSearchYoutube}
                disabled={selectedIngredients.length === 0 || isSearching}
                style={{ 
                  background: 'linear-gradient(135deg, #ef4444, #b91c1c)', 
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 24px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  opacity: (selectedIngredients.length === 0 || isSearching) ? 0.5 : 1, 
                  cursor: (selectedIngredients.length === 0 || isSearching) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  justifyContent: 'center',
                  boxShadow: selectedIngredients.length > 0 ? '0 4px 12px rgba(239,68,68,0.3)' : 'none'
                }}
              >
                <Video size={20} /> 
                {isSearching ? 'Đang tìm...' : 'Tìm video YouTube'}
              </button>
            </div>
            
            {videos.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {videos.map(video => (
                  <a
                    key={video.id}
                    href={`https://youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      padding: '16px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '16px',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.3)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)';
                    }}
                  >
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                      <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: 'rgba(239,68,68,0.9)', padding: '12px', borderRadius: '50%', backdropFilter: 'blur(4px)' }}>
                          <Play size={24} color="#fff" fill="#fff" />
                        </div>
                      </div>
                      <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#fff' }}>
                        {video.duration}
                      </div>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#f1f5f9', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {video.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {video.channel}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
