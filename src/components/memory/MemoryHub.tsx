'use client';

import { useState } from 'react';
import { Archive, Brain, RefreshCcw, ChevronRight, Send, Trash2, Lock, Unlock, Zap } from 'lucide-react';
import { MemoryVault, BrainDump } from '@prisma/client';
import { addMemory, deleteMemory, addBrainDump, deleteBrainDumpItem, clearBrainDump } from '@/app/memory/actions';

interface Props {
  memories: MemoryVault[];
  dumps: BrainDump[];
}

const TABS = [
  { id: 'capsule', label: 'Time Capsule', icon: Archive, accent: '#3b82f6' },
  { id: 'dump', label: 'Brain Dump', icon: Brain, accent: '#ec4899' },
  { id: 'resurface', label: 'Resurfacing', icon: RefreshCcw, accent: '#f59e0b' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function MemoryHub({ memories, dumps }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('capsule');
  const [loading, setLoading] = useState(false);
  const currentTab = TABS.find(t => t.id === activeTab)!;

  // -- Derived Data --
  const capsules = memories.filter(m => m.isTimeCapsule);
  const now = new Date().getTime();
  
  // Lấy 1 memory ngẫu nhiên để resurface (không phải time capsule hoặc đã unlock)
  const availableMemories = memories.filter(m => !m.isTimeCapsule || (m.unlockDate && new Date(m.unlockDate).getTime() <= now));
  const [resurfacedId, setResurfacedId] = useState<string | null>(availableMemories.length > 0 ? availableMemories[Math.floor(Math.random() * availableMemories.length)].id : null);
  
  const resurfacedMemory = availableMemories.find(m => m.id === resurfacedId);

  // -- Handlers --
  const handleAddCapsule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await addMemory(new FormData(e.currentTarget));
    e.currentTarget.reset();
    setLoading(false);
  };

  const handleAddDump = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await addBrainDump(new FormData(e.currentTarget));
    e.currentTarget.reset();
    setLoading(false);
  };

  const handleClearDump = async () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ Brain Dump?')) {
      setLoading(true);
      await clearBrainDump();
      setLoading(false);
    }
  };

  const rollNewResurface = () => {
    if (availableMemories.length === 0) return;
    let next;
    do {
      next = availableMemories[Math.floor(Math.random() * availableMemories.length)].id;
    } while (next === resurfacedId && availableMemories.length > 1);
    setResurfacedId(next);
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
        <span style={{ fontSize: '0.78rem', color: '#475569' }}>Memory Hub</span>
        <ChevronRight size={12} color="#334155" />
        <span style={{ fontSize: '0.78rem', color: currentTab.accent, fontWeight: 600 }}>{currentTab.label}</span>
      </div>

      {/* ── Content panel ── */}
      <div style={{ flex: 1, background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', borderRadius: '0 0 20px 20px', padding: '24px', backdropFilter: 'blur(16px)' }}>
        
        {/* --- TIME CAPSULE TAB --- */}
        {activeTab === 'capsule' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
            
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', alignSelf: 'start' }}>
              <h4 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: '1.1rem' }}>Gửi cho tương lai</h4>
              <form onSubmit={handleAddCapsule} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="hidden" name="isTimeCapsule" value="on" />
                <textarea name="content" placeholder="Viết thông điệp, hy vọng, hoặc cảm xúc hiện tại của bạn..." rows={4} required style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Ngày mở khóa:</label>
                  <input name="unlockDate" type="date" required style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', colorScheme: 'dark' }} />
                </div>
                <input name="tags" placeholder="Tags (VD: sinh_nhat, hy_vong)" style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
                <button type="submit" disabled={loading} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {loading ? 'Đang gửi...' : <><Send size={18} /> Khóa Capsule</>}
                </button>
              </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>Danh sách Capsules</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {capsules.length === 0 ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#64748b', padding: '40px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>Chưa có Time Capsule nào.</div>
                ) : (
                  capsules.map(cap => {
                    const unlockTime = cap.unlockDate ? new Date(cap.unlockDate).getTime() : 0;
                    const isUnlocked = unlockTime <= now;
                    return (
                      <div key={cap.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: `1px solid ${isUnlocked ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)'}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', color: isUnlocked ? '#3b82f6' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                            {isUnlocked ? <Unlock size={16} /> : <Lock size={16} />} 
                            {isUnlocked ? 'Đã mở khóa' : `Khóa đến ${new Date(cap.unlockDate!).toLocaleDateString()}`}
                          </span>
                          <button onClick={() => deleteMemory(cap.id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}><Trash2 size={16} /></button>
                        </div>
                        {isUnlocked ? (
                          <p style={{ margin: 0, fontSize: '0.95rem', color: '#fff', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{cap.content}</p>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '20px 0', color: '#475569', fontSize: '0.9rem' }}>
                            [Nội dung đã bị khóa]
                          </div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 'auto' }}>
                          Gửi vào: {new Date(cap.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

        {/* --- BRAIN DUMP TAB --- */}
        {activeTab === 'dump' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)', padding: '20px', borderRadius: '16px', display: 'flex', gap: '16px' }}>
              <Brain size={28} color="#ec4899" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#ec4899', fontSize: '1.1rem' }}>Brain Dump Inbox</h3>
                  <p style={{ margin: 0, color: '#fbcfe8', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    Có quá nhiều thứ trong đầu? Xả hết ra đây. Đừng lo về cấu trúc hay định dạng. Làm trống RAM cho não bộ.
                  </p>
                </div>
                <button onClick={handleClearDump} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Dọn dẹp (Xóa tất cả)</button>
              </div>
            </div>

            <form onSubmit={handleAddDump} style={{ display: 'flex', gap: '12px' }}>
              <input name="content" placeholder="Nhập suy nghĩ, ý tưởng, task bất chợt..." required autoFocus style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', fontSize: '1rem' }} />
              <button type="submit" disabled={loading} style={{ background: '#ec4899', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} /> Lưu
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dumps.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>Inbox rỗng. Tâm trí bạn đang rất tĩnh lặng!</div>
              ) : (
                dumps.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ fontSize: '1rem', color: '#fff', lineHeight: 1.5 }}>{item.content}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{new Date(item.createdAt).toLocaleString()}</div>
                    </div>
                    <button onClick={() => deleteBrainDumpItem(item.id)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '8px' }}><Trash2 size={16} /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- RESURFACING TAB --- */}
        {activeTab === 'resurface' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', animation: 'fadeIn 0.3s ease' }}>
            {resurfacedMemory ? (
              <div style={{ width: '100%', maxWidth: '600px', background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', background: 'rgba(245,158,11,0.1)', width: '150px', height: '150px', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }} />
                
                <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <RefreshCcw size={32} color="#f59e0b" />
                  <div style={{ fontSize: '0.85rem', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>
                    Ký ức gợi lại
                  </div>
                  <p style={{ fontSize: '1.2rem', color: '#fff', lineHeight: 1.6, fontStyle: 'italic', margin: '16px 0' }}>
                    "{resurfacedMemory.content}"
                  </p>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Viết vào: {new Date(resurfacedMemory.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <button onClick={rollNewResurface} style={{ zIndex: 1, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', marginTop: '16px' }}>
                  Khám phá thêm
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b' }}>
                <Archive size={48} color="#475569" style={{ marginBottom: '16px' }} />
                <p>Không có ký ức nào để gợi lại. Hãy viết thêm nhiều Time Capsule hoặc Brain Dump nhé!</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
