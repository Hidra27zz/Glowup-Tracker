'use client';

import { useState } from 'react';
import { Users, Handshake, Bell, ChevronRight, Plus, MessageSquare, TrendingUp, TrendingDown, Clock, ShieldAlert } from 'lucide-react';
import { Contact, Interaction } from '@prisma/client';
import { addContact, deleteContact, logInteraction } from '@/app/crm/actions';

interface ContactWithInteractions extends Contact {
  interactions: Interaction[];
}

interface Props {
  contacts: ContactWithInteractions[];
}

const TABS = [
  { id: 'network', label: 'Network & Heatmap', icon: Users, accent: '#5b9cff' },
  { id: 'value', label: 'Value Exchange', icon: Handshake, accent: '#3dd68c' },
  { id: 'followup', label: 'Smart Follow-up', icon: Bell, accent: '#f5b94a' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function CRMHub({ contacts }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('network');
  const [loading, setLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  
  const currentTab = TABS.find(t => t.id === activeTab)!;

  // -- Helpers --
  const getDaysSince = (date: Date) => {
    const diff = new Date().getTime() - new Date(date).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getHeatmapColor = (days: number) => {
    if (days <= 14) return '#3dd68c'; // Green: active
    if (days <= 45) return '#f5b94a'; // Yellow: maintain
    return '#f46d75'; // Red: needs attention
  };

  const followupQueue = contacts.filter(c => getDaysSince(c.lastContact) > 45).sort((a, b) => getDaysSince(b.lastContact) - getDaysSince(a.lastContact));

  // -- Handlers --
  const handleAddContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await addContact(new FormData(e.currentTarget));
    e.currentTarget.reset();
    setLoading(false);
  };

  const handleLogInteraction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await logInteraction(new FormData(e.currentTarget));
    e.currentTarget.reset();
    setSelectedContact(null);
    setLoading(false);
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
        <span style={{ fontSize: '0.78rem', color: '#475569' }}>CRM Hub</span>
        <ChevronRight size={12} color="#334155" />
        <span style={{ fontSize: '0.78rem', color: currentTab.accent, fontWeight: 600 }}>{currentTab.label}</span>
      </div>

      {/* ── Content panel ── */}
      <div style={{ flex: 1, background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', borderRadius: '0 0 20px 20px', padding: '24px', backdropFilter: 'blur(16px)' }}>
        
        {/* --- NETWORK TAB --- */}
        {activeTab === 'network' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
            
            {/* Thêm Contact */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', alignSelf: 'start' }}>
              <h4 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: '1.1rem' }}>Thêm Connection</h4>
              <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input name="name" placeholder="Tên (VD: Nguyễn Văn A)" required style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
                <select name="category" required style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff', outline: 'none' }}>
                  <option value="Mentor">Mentor / Cố vấn</option>
                  <option value="Partner">Partner / Đối tác</option>
                  <option value="Friend">Bạn bè</option>
                  <option value="Family">Gia đình</option>
                </select>
                <textarea name="notes" placeholder="Ghi chú (Nơi gặp, sở thích...)" rows={3} style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
                <button type="submit" disabled={loading} style={{ background: '#5b9cff', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', marginTop: '4px' }}>
                  {loading ? 'Đang thêm...' : 'Lưu Connection'}
                </button>
              </form>
            </div>

            {/* Heatmap List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#fff' }}>Relationship Heatmap</h3>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3dd68c' }}/> Gần đây</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f5b94a' }}/> Cần duy trì</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f46d75' }}/> Bỏ bê</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                {contacts.length === 0 ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#64748b', padding: '40px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>Chưa có ai trong mạng lưới của bạn.</div>
                ) : (
                  contacts.map(c => {
                    const days = getDaysSince(c.lastContact);
                    const color = getHeatmapColor(days);
                    return (
                      <div key={c.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', borderTop: `3px solid ${color}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ margin: 0, color: '#fff', fontSize: '1.05rem' }}>{c.name}</h4>
                          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', color: '#cbd5e1' }}>{c.category}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={14} /> Gặp {days === 0 ? 'hôm nay' : `${days} ngày trước`}
                        </div>
                        {c.notes && <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.notes}</p>}
                        <button onClick={() => setSelectedContact(selectedContact === c.id ? null : c.id)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#6cc4ff', padding: '6px', borderRadius: '8px', cursor: 'pointer', marginTop: '8px', fontSize: '0.85rem' }}>
                          + Ghi log gặp mặt
                        </button>
                        
                        {selectedContact === c.id && (
                          <form onSubmit={handleLogInteraction} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', animation: 'fadeIn 0.2s', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px' }}>
                            <input type="hidden" name="contactId" value={c.id} />
                            <select name="type" required style={{ padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff', outline: 'none', fontSize: '0.85rem' }}>
                              <option value="coffee">Cà phê / Ăn uống</option>
                              <option value="call">Gọi điện / Nhắn tin</option>
                              <option value="help">Giúp đỡ / Công việc</option>
                            </select>
                            <input name="notes" placeholder="Nội dung cuộc nói chuyện..." required style={{ padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', outline: 'none', fontSize: '0.85rem' }} />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94a3b8', cursor: 'pointer' }}>
                              <input type="checkbox" name="valueGiven" value="true" /> Bạn là người trao giá trị (giúp đỡ)?
                            </label>
                            <button type="submit" disabled={loading} style={{ background: '#3dd68c', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>Lưu</button>
                          </form>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- VALUE EXCHANGE TAB --- */}
        {activeTab === 'value' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ background: 'rgba(61, 214, 140,0.1)', border: '1px solid rgba(61, 214, 140,0.3)', padding: '20px', borderRadius: '16px', display: 'flex', gap: '16px' }}>
              <Handshake size={28} color="#3dd68c" style={{ flexShrink: 0 }} />
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#3dd68c', fontSize: '1.1rem' }}>Value Exchange Balance</h3>
                <p style={{ margin: 0, color: '#8ae8b8', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Networking bền vững là win-win. Chỉ số dương (+) nghĩa là bạn đang trao đi nhiều giá trị. Chỉ số âm (-) nghĩa là bạn đang nhận nhiều hơn, hãy tìm cách trả ơn họ nhé.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {contacts.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>{c.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{c.category}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 700, color: c.valueExchange > 0 ? '#3dd68c' : c.valueExchange < 0 ? '#f46d75' : '#64748b' }}>
                    {c.valueExchange > 0 ? <TrendingUp size={18} /> : c.valueExchange < 0 ? <TrendingDown size={18} /> : null}
                    {c.valueExchange > 0 ? `+${c.valueExchange}` : c.valueExchange}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- FOLLOW UP TAB --- */}
        {activeTab === 'followup' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
             <div style={{ background: 'rgba(245, 185, 74,0.1)', border: '1px solid rgba(245, 185, 74,0.3)', padding: '20px', borderRadius: '16px', display: 'flex', gap: '16px' }}>
              <Bell size={28} color="#f5b94a" style={{ flexShrink: 0 }} />
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#f5b94a', fontSize: '1.1rem' }}>Smart Follow-up</h3>
                <p style={{ margin: 0, color: '#fcd34d', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Danh sách những người quan trọng bạn đã không liên lạc hơn 45 ngày. Hãy gửi một tin nhắn hỏi thăm để hâm nóng mối quan hệ!
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {followupQueue.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#64748b', padding: '40px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>Không có ai cần hâm nóng quan hệ lúc này. Giỏi lắm!</div>
              ) : (
                followupQueue.map(c => (
                  <div key={c.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(244, 109, 117,0.3)', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#f46d75' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{c.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f46d75', fontSize: '0.85rem', fontWeight: 700, background: 'rgba(244, 109, 117,0.1)', padding: '4px 8px', borderRadius: '8px' }}>
                        <ShieldAlert size={14} /> Bỏ bê {getDaysSince(c.lastContact)} ngày
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a href={`https://zalo.me`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: 'none', background: 'rgba(91, 156, 255,0.1)', color: '#7db2ff', border: '1px solid rgba(91, 156, 255,0.3)', padding: '8px', borderRadius: '8px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <MessageSquare size={14} /> Nhắn Zalo
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
