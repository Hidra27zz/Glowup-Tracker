'use client';

import { useState } from 'react';
import { Terminal, Plus, Database, Cloud, Layout, Cpu, Code2, Zap, Search, ExternalLink, BookOpen, Network, CheckCircle, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { Skill } from '@prisma/client';
import { addSkill, addExp, updateSkill, deleteSkill } from '@/app/career/actions';
import { fetchMultiSourceResources, fetchSingleResource, LearningResource } from '@/lib/actions/learning.actions';

const Github = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

const Youtube = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
    <path d="m10 15 5-3-5-3z"/>
  </svg>
);

interface Props {
  skills: Skill[];
}

export default function SkillTree({ skills }: Props) {
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  
  const [activeFarm, setActiveFarm] = useState<string | null>(null);
  const [farmResources, setFarmResources] = useState<LearningResource[]>([]);
  const [skipIds, setSkipIds] = useState<string[]>([]);
  const [loadingFarm, setLoadingFarm] = useState(false);

  const handleStartEdit = (skill: Skill) => {
    setEditingId(skill.id);
    setEditName(skill.name);
    setEditCategory(skill.category);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setLoading(true);
    await updateSkill(id, editName, editCategory);
    setEditingId(null);
    setLoading(false);
  };

  const handleDeleteSkill = async (skill: Skill) => {
    if (!confirm(`Xóa kỹ năng "${skill.name}"?`)) return;
    setLoading(true);
    await deleteSkill(skill.id);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    
    await addSkill(name, category);
    
    form.reset();
    setShowInput(false);
    setLoading(false);
  };

  const handleAddExp = async (id: string, amount: number) => {
    setLoading(true);
    await addExp(id, amount);
    setLoading(false);
  };

  const handleFindFarm = async (skillName: string, skillId: string) => {
    if (activeFarm === skillId) {
      setActiveFarm(null);
      return;
    }
    
    setActiveFarm(skillId);
    setLoadingFarm(true);
    try {
      const resources = await fetchMultiSourceResources(`${skillName} full course tutorial advanced`, 4, 0);
      setFarmResources(resources);
      setSkipIds(resources.map(r => r.id));
    } catch (e) {
      console.error(e);
    }
    setLoadingFarm(false);
  };

  const handleCompleteResource = async (skillId: string, resourceId: string, skillName: string) => {
    await handleAddExp(skillId, 50);
    setFarmResources(prev => prev.filter(r => r.id !== resourceId));
    try {
      const newResource = await fetchSingleResource(`${skillName} full course tutorial advanced`, skipIds);
      if (newResource) {
        setFarmResources(prev => [...prev, newResource]);
        setSkipIds(prev => [...prev, newResource.id]);
      }
    } catch (error) {
      console.error('Không tìm thấy tài liệu thay thế', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Frontend': return <Layout size={16} color="#6cc4ff" />;
      case 'Backend': return <Terminal size={16} color="#a5b1ff" />;
      case 'Data': return <Database size={16} color="#3dd68c" />;
      case 'Cloud': return <Cloud size={16} color="#0ea5e9" />;
      case 'Core': return <Cpu size={16} color="#facc15" />;
      default: return <Code2 size={16} color="#a5b1ff" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Frontend': return '#6cc4ff';
      case 'Backend': return '#a5b1ff';
      case 'Data': return '#3dd68c';
      case 'Cloud': return '#0ea5e9';
      case 'Core': return '#facc15';
      default: return '#a5b1ff';
    }
  };

  const getSourceIcon = (source: string) => {
    if (source === 'YouTube') return <Youtube size={14} color="#f46d75" />;
    if (source === 'GitHub') return <Github size={14} color="#f8fafc" />;
    if (source === 'Dev.to') return <Layout size={14} color="#3dd68c" />;
    if (source === 'Google') return <Search size={14} color="#6cc4ff" />;
    return <ExternalLink size={14} color="#6cc4ff" />;
  };

  const inputStyle: React.CSSProperties = {
    padding: '10px 14px', borderRadius: '10px',
    background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.09)',
    color: '#fff', fontSize: '0.9rem', outline: 'none', width: '100%',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(108, 196, 255,0.25), rgba(168,85,247,0.15))', padding: '14px', borderRadius: '16px', border: '1px solid rgba(108, 196, 255,0.2)' }}>
            <Network size={26} color="#6cc4ff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Quản lý Kỹ năng</h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Theo dõi mức độ thành thạo và gợi ý học liệu</p>
          </div>
        </div>

        <button 
          onClick={() => setShowInput(!showInput)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(108, 196, 255,0.1)', color: '#6cc4ff', border: '1px solid rgba(108, 196, 255,0.3)', borderRadius: '12px', padding: '10px 18px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}
        >
          <Plus size={16} /> Thêm Kỹ năng mới
        </button>
      </div>

      {/* Add Skill Form */}
      {showInput && (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tên kỹ năng</label>
            <input name="name" placeholder="VD: Tiếng Anh Giao Tiếp, Excel, Quản lý dự án, Next.js..." required autoFocus style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phân loại / Lĩnh vực</label>
            <input name="category" list="skill-categories" placeholder="VD: Ngoại ngữ, Kinh doanh, Frontend..." defaultValue="Kỹ năng mềm" required style={inputStyle} />
            <datalist id="skill-categories">
              <option value="Kỹ năng mềm" />
              <option value="Ngoại ngữ" />
              <option value="Kinh doanh & Quản trị" />
              <option value="Tài chính & Đầu tư" />
              <option value="Thiết kế & Sáng tạo" />
              <option value="Frontend" />
              <option value="Backend" />
              <option value="Data" />
              <option value="Cloud" />
              <option value="Core" />
            </datalist>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={loading} style={{ background: '#6cc4ff', color: '#0f172a', border: 'none', borderRadius: '10px', padding: '10px 24px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', height: '40px' }}>
              {loading ? 'Đang thêm...' : 'Lưu'}
            </button>
          </div>
        </form>
      )}

      {/* Skills Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {skills.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#64748b', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Network size={40} color="#475569" style={{ marginBottom: '12px', opacity: 0.5 }} />
            <div>Chưa có kỹ năng nào. Hãy thêm kỹ năng đầu tiên để bắt đầu theo dõi tiến độ!</div>
          </div>
        ) : (
          skills.map(skill => {
            const color = getCategoryColor(skill.category);
            const isFarming = activeFarm === skill.id;

            return (
              <div key={skill.id} style={{ display: 'flex', flexDirection: 'column', padding: '24px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${color}30`, position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }}>
                
                {/* Level Watermark */}
                <div style={{ position: 'absolute', right: '-10px', top: '-10px', fontSize: '6rem', fontWeight: 900, color: 'rgba(255,255,255,0.02)', pointerEvents: 'none', userSelect: 'none', lineHeight: 1 }}>
                  {skill.level}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1, gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{ background: `${color}15`, padding: '10px', borderRadius: '10px', border: `1px solid ${color}30` }}>
                      {getCategoryIcon(skill.category)}
                    </div>
                    {editingId === skill.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        <input value={editName} onChange={e => setEditName(e.target.value)} style={{ ...inputStyle, padding: '6px 10px', fontSize: '0.85rem' }} />
                        <input value={editCategory} onChange={e => setEditCategory(e.target.value)} list="skill-categories" style={{ ...inputStyle, padding: '5px 10px', fontSize: '0.75rem' }} />
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button type="button" onClick={() => handleSaveEdit(skill.id)} style={{ background: '#3dd68c', color: '#0f172a', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Lưu</button>
                          <button type="button" onClick={() => setEditingId(null)} style={{ background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer' }}>Hủy</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff', fontWeight: 700 }}>{skill.name}</h3>
                        <span style={{ fontSize: '0.7rem', color: color, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                          {skill.category}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Cấp độ</span>{skill.level}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button type="button" onClick={() => handleStartEdit(skill)} title="Sửa kỹ năng" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#94a3b8', cursor: 'pointer', padding: '4px 6px', display: 'flex' }}>
                        <Pencil size={12} />
                      </button>
                      <button type="button" onClick={() => handleDeleteSkill(skill)} title="Xóa kỹ năng" style={{ background: 'rgba(244,109,117,0.08)', border: '1px solid rgba(244,109,117,0.2)', borderRadius: '6px', color: '#f46d75', cursor: 'pointer', padding: '4px 6px', display: 'flex' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div style={{ zIndex: 1, marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>Mức độ thành thạo</span>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{skill.exp} / 100</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${skill.exp}%`, height: '100%', background: `linear-gradient(90deg, ${color}80, ${color})`, transition: 'width 0.5s ease', borderRadius: '3px' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', zIndex: 1 }}>
                  <button 
                    onClick={() => handleAddExp(skill.id, 25)}
                    disabled={loading}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  >
                    <CheckCircle size={14} color={color} /> Cập nhật tiến độ
                  </button>
                  <button 
                    onClick={() => handleFindFarm(skill.name, skill.id)}
                    disabled={loadingFarm && isFarming}
                    style={{ background: isFarming ? `${color}15` : 'rgba(255,255,255,0.04)', border: `1px solid ${isFarming ? color : 'rgba(255,255,255,0.08)'}`, color: isFarming ? color : '#cbd5e1', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 16px', gap: '6px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                  >
                    {loadingFarm && isFarming ? 'Đang tìm...' : <><BookOpen size={14} /> Học liệu</>}
                  </button>
                </div>

                {/* Resources Area */}
                {isFarming && (
                  <div style={{ zIndex: 1, marginTop: '20px', background: 'rgba(0,0,0,0.25)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', animation: 'fadeIn 0.2s ease' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: color, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <Search size={14} /> Nguồn học được đề xuất
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {farmResources.length === 0 && !loadingFarm ? (
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Không tìm thấy tài liệu phù hợp.</div>
                      ) : farmResources.map((resource, idx) => (
                        <div key={resource.id + idx} style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
                              {getSourceIcon(resource.source)}
                              <span>{resource.source}</span>
                            </div>
                          </div>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ display: 'flex', gap: '14px', textDecoration: 'none', alignItems: 'center' }}
                          >
                            {resource.thumbnail && (
                              <img src={resource.thumbnail} alt={resource.title} style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }} />
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <div style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>{resource.title}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Tác giả: {resource.author}</div>
                            </div>
                          </a>
                          <button 
                            onClick={() => handleCompleteResource(skill.id, resource.id, skill.name)}
                            style={{ background: 'rgba(61, 214, 140, 0.1)', border: '1px solid rgba(61, 214, 140, 0.3)', color: '#3dd68c', fontSize: '0.8rem', fontWeight: 700, padding: '8px', marginTop: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(61, 214, 140, 0.15)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(61, 214, 140, 0.1)'}
                          >
                            <ChevronRight size={14} /> Đánh dấu hoàn thành
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
