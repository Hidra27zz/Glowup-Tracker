'use client';

import { useState } from 'react';
import { Brain, Sparkles, Battery, BookHeart, History, ShieldAlert, ChevronRight, Zap, BookOpen } from 'lucide-react';
import { logMood } from '@/app/mental/actions';
import DopamineDetox from '@/components/mental/DopamineDetox';
import InformationDiet from '@/components/mental/InformationDiet';
import { MoodLog, DetoxSession, InformationDietLog } from '@prisma/client';

interface Props {
  moodLogs: MoodLog[];
  detoxHistory: DetoxSession[];
  infoDietLogs: InformationDietLog[];
  activeSession: DetoxSession | null;
  burnoutWarning: boolean;
  avgEnergy: number | null;
}

const TABS = [
  { id: 'matrix', label: 'Energy & Mood', icon: Brain, accent: '#a855f7' },
  { id: 'detox', label: 'Dopamine Detox', icon: ShieldAlert, accent: '#ef4444' },
  { id: 'diet', label: 'Information Diet', icon: BookOpen, accent: '#38bdf8' },
  { id: 'history', label: 'History', icon: History, accent: '#10b981' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function MentalHub({ moodLogs, detoxHistory, infoDietLogs, activeSession, burnoutWarning, avgEnergy }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('matrix');
  const currentTab = TABS.find(t => t.id === activeTab)!;

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
        <span style={{ fontSize: '0.78rem', color: '#475569' }}>Mental Hub</span>
        <ChevronRight size={12} color="#334155" />
        <span style={{ fontSize: '0.78rem', color: currentTab.accent, fontWeight: 600 }}>{currentTab.label}</span>
      </div>

      {/* ── Content panel ── */}
      <div style={{ flex: 1, background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', borderRadius: '0 0 20px 20px', padding: '24px', backdropFilter: 'blur(16px)' }}>
        
        {/* --- ENERGY & MOOD MATRIX --- */}
        {activeTab === 'matrix' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease', maxWidth: '800px', margin: '0 auto' }}>
            
            {burnoutWarning && (
              <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fff', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '12px' }}>
                  <ShieldAlert size={28} color="#ef4444" />
                </div>
                <div>
                  <h3 style={{ color: '#ef4444', margin: '0 0 8px 0', fontSize: '1.1rem' }}>Burnout Radar Alert</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, color: '#fca5a5' }}>
                    Năng lượng trung bình gần đây của bạn khá thấp ({avgEnergy?.toFixed(1)}/10). Hệ thống khuyến nghị kích hoạt chế độ <strong>Dopamine Detox</strong> và giảm tải công việc trong 48 giờ tới để não bộ phục hồi.
                  </p>
                </div>
              </div>
            )}

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', color: '#fff' }}>
                <div style={{ background: 'rgba(168,85,247,0.15)', padding: '8px', borderRadius: '10px' }}>
                  <Brain size={22} color="#a855f7" />
                </div>
                Energy - Mood Matrix
              </h3>
              
              <form action={logMood} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>
                      <Battery size={16} color="#3b82f6" /> Energy Level (1-10)
                    </label>
                    <input type="range" name="energy" min="1" max="10" defaultValue="5" style={{ width: '100%', accentColor: '#3b82f6' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                      <span>Kiệt sức</span>
                      <span>Sung mãn</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>
                      <Sparkles size={16} color="#f59e0b" /> Mood (1-10)
                    </label>
                    <input type="range" name="mood" min="1" max="10" defaultValue="5" style={{ width: '100%', accentColor: '#f59e0b' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                      <span>Tệ hại</span>
                      <span>Tuyệt vời</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>
                    <BookHeart size={16} color="#ec4899" /> Social Battery (1-10)
                  </label>
                  <input type="range" name="socialBattery" min="1" max="10" defaultValue="8" style={{ width: '100%', accentColor: '#ec4899' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                    <span>Muốn ở một mình</span>
                    <span>Sẵn sàng kết nối</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>Micro-Journaling</label>
                  <textarea 
                    name="notes" 
                    placeholder="Hôm nay bạn cảm thấy thế nào? Hoặc liệt kê 3 điều bạn biết ơn lúc này..." 
                    rows={4}
                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'vertical' }} 
                  />
                </div>

                <button type="submit" style={{ background: 'linear-gradient(135deg, #a855f7, #c084fc)', color: '#fff', border: 'none', borderRadius: '12px', padding: '16px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'opacity 0.2s' }}>
                  Lưu Nhật ký
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- DOPAMINE DETOX --- */}
        {activeTab === 'detox' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <DopamineDetox activeSession={activeSession} history={detoxHistory} />
          </div>
        )}

        {/* --- INFORMATION DIET --- */}
        {activeTab === 'diet' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <InformationDiet logs={infoDietLogs} />
          </div>
        )}

        {/* --- HISTORY LOGS --- */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.3s ease', maxWidth: '800px', margin: '0 auto' }}>
            {moodLogs.length === 0 ? (
               <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', padding: '40px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '14px' }}>
                 Chưa có dữ liệu. Hãy tạo nhật ký đầu tiên!
               </div>
            ) : (
              moodLogs.map(log => (
                <div key={log.id} style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>{log.date.toLocaleDateString('vi-VN')}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', gap: '12px' }}>
                      <span style={{ color: log.energy > 6 ? '#10b981' : log.energy < 4 ? '#ef4444' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Battery size={14} /> {log.energy}
                      </span>
                      <span style={{ color: log.mood > 6 ? '#10b981' : log.mood < 4 ? '#ef4444' : '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={14} /> {log.mood}
                      </span>
                      {log.socialBattery && (
                        <span style={{ color: log.socialBattery > 6 ? '#ec4899' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <BookHeart size={14} /> {log.socialBattery}
                        </span>
                      )}
                    </div>
                  </div>
                  {log.notes && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6, borderLeft: '3px solid #a855f7' }}>
                      {log.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}
