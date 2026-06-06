'use client';

import { useState } from 'react';
import { Kanban, Timer, ChevronRight, Plus, CheckCircle, Circle, Flame, BatteryCharging, Zap, BatteryLow, BatteryFull, BatteryMedium, Trash2 } from 'lucide-react';
import { Task, Sprint } from '@prisma/client';
import { addTask, updateTaskStatus, deleteTask, createSprint } from '@/app/tasks/actions';

interface SprintWithTasks extends Sprint {
  tasks: Task[];
}

interface Props {
  tasks: Task[];
  sprints: SprintWithTasks[];
  currentEnergy: number; // 1-10 from Mental log
}

const TABS = [
  { id: 'energy', label: 'Energy Board', icon: BatteryCharging, accent: '#3b82f6' },
  { id: 'sprint', label: 'Sprint Manager', icon: Kanban, accent: '#f59e0b' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function TaskHub({ tasks, sprints, currentEnergy }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('energy');
  const [loading, setLoading] = useState(false);
  const currentTab = TABS.find(t => t.id === activeTab)!;

  // -- Derived --
  const getEnergyRecommendation = () => {
    if (currentEnergy <= 4) return 'Low';
    if (currentEnergy <= 7) return 'Medium';
    return 'High';
  };
  const recEnergy = getEnergyRecommendation();

  const getEnergyIcon = (level: string) => {
    if (level === 'Low') return <BatteryLow size={16} color="#3b82f6" />;
    if (level === 'Medium') return <BatteryMedium size={16} color="#f59e0b" />;
    return <BatteryFull size={16} color="#ef4444" />;
  };

  const getEnergyColor = (level: string) => {
    if (level === 'Low') return '#3b82f6';
    if (level === 'Medium') return '#f59e0b';
    return '#ef4444';
  };

  const activeSprint = sprints.find(s => s.isActive);

  // -- Handlers --
  const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await addTask(new FormData(e.currentTarget));
    e.currentTarget.reset();
    setLoading(false);
  };

  const handleAddSprint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await createSprint(new FormData(e.currentTarget));
    e.currentTarget.reset();
    setLoading(false);
  };

  const renderTask = (task: any) => {
    const realDeadline = new Date(task.deadline);
    const fakeDeadline = new Date(realDeadline);
    fakeDeadline.setDate(fakeDeadline.getDate() - 2); // Anti-Procrastination Buffer: 2 days earlier
    
    // Check if task is blocked
    const isBlocked = task.blockedById && task.status !== 'DONE';
    const blockingTask = isBlocked ? tasks.find(t => t.id === task.blockedById) : null;
    const isBlockerDone = blockingTask?.status === 'DONE';

    const effectivelyBlocked = isBlocked && !isBlockerDone;

    return (
      <div key={task.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '8px', opacity: task.status === 'DONE' ? 0.6 : 1, transition: 'all 0.2s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: task.status === 'DONE' ? '#64748b' : '#fff', fontWeight: 600 }}>
            <button 
              disabled={effectivelyBlocked && task.status !== 'DONE'}
              onClick={() => updateTaskStatus(task.id, task.status === 'DONE' ? 'TODO' : 'DONE')} 
              style={{ background: 'none', border: 'none', padding: 0, cursor: effectivelyBlocked ? 'not-allowed' : 'pointer', color: task.status === 'DONE' ? '#10b981' : effectivelyBlocked ? '#64748b' : '#64748b', display: 'flex', opacity: effectivelyBlocked && task.status !== 'DONE' ? 0.5 : 1 }}
              title={effectivelyBlocked ? 'Bị block bởi task khác' : ''}
            >
              {task.status === 'DONE' ? <CheckCircle size={18} /> : <Circle size={18} />}
            </button>
            <span style={{ textDecoration: task.status === 'DONE' ? 'line-through' : 'none' }}>
              {task.title} {task.isCoreTask && <span title="Core Task" style={{ display: 'inline', marginLeft: '4px' }}><Flame size={14} color="#ef4444" /></span>}
            </span>
          </div>
          <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><Trash2 size={16} /></button>
        </div>
        {task.description && <p style={{ margin: '0 0 0 26px', fontSize: '0.85rem', color: '#94a3b8' }}>{task.description}</p>}
        
        {effectivelyBlocked && blockingTask && (
          <div style={{ marginLeft: '26px', fontSize: '0.8rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '4px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
            Bị block bởi: {blockingTask.title}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '26px', marginTop: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: getEnergyColor(task.energyLevel) }}>
            {getEnergyIcon(task.energyLevel)} {task.energyLevel} Energy
          </span>
          <span style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: '4px' }} title={`Deadline thật: ${realDeadline.toLocaleDateString()}`}>
            Hạn giả: {fakeDeadline.toLocaleDateString()}
          </span>
        </div>
      </div>
    );
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
        <span style={{ fontSize: '0.78rem', color: '#475569' }}>Task Hub</span>
        <ChevronRight size={12} color="#334155" />
        <span style={{ fontSize: '0.78rem', color: currentTab.accent, fontWeight: 600 }}>{currentTab.label}</span>
      </div>

      {/* ── Content panel ── */}
      <div style={{ flex: 1, background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', borderRadius: '0 0 20px 20px', padding: '24px', backdropFilter: 'blur(16px)' }}>
        
        {/* --- ENERGY BOARD TAB --- */}
        {activeTab === 'energy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', padding: '20px', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ background: 'rgba(59,130,246,0.2)', padding: '12px', borderRadius: '50%' }}>
                <Zap size={24} color="#3b82f6" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#3b82f6', fontSize: '1.1rem' }}>Mức năng lượng hiện tại: {currentEnergy}/10</h3>
                <p style={{ margin: 0, color: '#93c5fd', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Gợi ý: Hãy tập trung vào các việc yêu cầu mức năng lượng <strong style={{ color: getEnergyColor(recEnergy) }}>[{recEnergy} Energy]</strong>.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: '1.1rem' }}>Tạo Task mới</h4>
                <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input name="title" placeholder="Tên công việc..." required style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
                  <textarea name="description" placeholder="Mô tả ngắn gọn" rows={2} style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <select name="energyLevel" required style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff', outline: 'none' }}>
                      <option value="Low">Low Energy (Dễ)</option>
                      <option value="Medium">Medium Energy (Vừa)</option>
                      <option value="High">High Energy (Khó)</option>
                    </select>
                    <input name="deadline" type="date" required defaultValue={new Date().toISOString().split('T')[0]} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', colorScheme: 'dark' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      <input type="checkbox" name="isCoreTask" /> Core Task (Daily Draft)
                    </label>
                    <select name="blockedById" style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff', outline: 'none', fontSize: '0.85rem' }}>
                      <option value="">Không bị block bởi task nào</option>
                      {tasks.filter(t => t.status !== 'DONE').map(t => (
                        <option key={t.id} value={t.id}>Bị block bởi: {t.title}</option>
                      ))}
                    </select>
                  </div>
                  {activeSprint && (
                     <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>
                       <input type="checkbox" name="sprintId" value={activeSprint.id} defaultChecked /> Thêm vào Sprint hiện tại ({activeSprint.name})
                     </label>
                  )}
                  <button type="submit" disabled={loading} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', marginTop: '4px' }}>
                    {loading ? 'Đang thêm...' : 'Tạo Task'}
                  </button>
                </form>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tasks Phù Hợp (Low/Medium/High)</span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                  {tasks.filter(t => t.status !== 'DONE').sort((a,b) => {
                    const order: Record<string,number> = { 'Low': 1, 'Medium': 2, 'High': 3 };
                    // Ưu tiên hiển thị task hợp mức năng lượng lên đầu
                    if (a.energyLevel === recEnergy && b.energyLevel !== recEnergy) return -1;
                    if (a.energyLevel !== recEnergy && b.energyLevel === recEnergy) return 1;
                    return order[a.energyLevel] - order[b.energyLevel];
                  }).map(renderTask)}
                  
                  {tasks.filter(t => t.status === 'DONE').map(renderTask)}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- SPRINT TAB --- */}
        {activeTab === 'sprint' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
              
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', alignSelf: 'start' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: '1.1rem' }}>Tạo Sprint Mới</h4>
                <form onSubmit={handleAddSprint} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input name="name" placeholder="Tên Sprint (VD: Sprint 1 - Build MVP)" required style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', display: 'block' }}>Ngày bắt đầu</label>
                      <input name="startDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', colorScheme: 'dark' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', display: 'block' }}>Ngày kết thúc</label>
                      <input name="endDate" type="date" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', colorScheme: 'dark' }} />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', marginTop: '4px' }}>
                    {loading ? 'Đang tạo...' : 'Bắt đầu Sprint'}
                  </button>
                </form>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {sprints.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>Chưa có Sprint nào. Tạo một Sprint 2 tuần để ép tiến độ nào!</div>
                ) : (
                  sprints.map(sprint => {
                    const isDone = !sprint.isActive || new Date(sprint.endDate).getTime() < new Date().getTime();
                    const total = sprint.tasks.length;
                    const done = sprint.tasks.filter(t => t.status === 'DONE').length;
                    const progress = total === 0 ? 0 : Math.round((done / total) * 100);

                    return (
                      <div key={sprint.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: `1px solid ${isDone ? 'rgba(255,255,255,0.05)' : 'rgba(245,158,11,0.3)'}`, display: 'flex', flexDirection: 'column', gap: '12px', opacity: isDone ? 0.7 : 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{sprint.name} {isDone && '(Đã kết thúc)'}</h4>
                          <span style={{ fontSize: '0.8rem', background: isDone ? 'rgba(255,255,255,0.1)' : 'rgba(245,158,11,0.1)', color: isDone ? '#94a3b8' : '#f59e0b', padding: '4px 8px', borderRadius: '8px', fontWeight: 600 }}>
                            Tiến độ: {progress}%
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Timer size={14} /> {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                        </div>
                        
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                          <div style={{ width: `${progress}%`, height: '100%', background: isDone ? '#64748b' : '#f59e0b', transition: 'width 0.3s' }} />
                        </div>

                        {sprint.tasks.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                            {sprint.tasks.map(t => (
                              <div key={t.id} style={{ fontSize: '0.85rem', color: t.status === 'DONE' ? '#64748b' : '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: t.status === 'DONE' ? 'line-through' : 'none' }}>
                                {t.status === 'DONE' ? <CheckCircle size={12} color="#10b981" /> : <Circle size={12} />} {t.title}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
