'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Kanban,
  Timer,
  ChevronRight,
  Plus,
  CheckCircle,
  Circle,
  Flame,
  BatteryCharging,
  Zap,
  BatteryLow,
  BatteryFull,
  BatteryMedium,
  Trash2,
  Calendar,
  ChevronLeft,
  AlertTriangle,
  FileWarning,
  Target,
  Clock,
  MapPin,
  Upload,
  Download,
} from 'lucide-react';
import { Task, Sprint } from '@prisma/client';
import {
  addTask,
  updateTaskStatus,
  deleteTask,
  createSprint,
  deleteSprint,
  assignTaskToSprint,
  submitOverdueReport,
} from '@/app/tasks/actions';
import {
  getTaskTimeStatus,
  formatDateTimeRange,
  TASK_CATEGORIES,
  getCategoryMeta,
  matchesCategoryFilter,
} from '@/lib/utils/timeFormat';
import SmartGoalBoard, { SmartGoalItem } from '@/components/dashboard/SmartGoalBoard';

interface SprintWithTasks extends Sprint {
  tasks: Task[];
}

interface Props {
  tasks: any[];
  sprints: SprintWithTasks[];
  currentEnergy: number; // 1-10 from Mental log
  smartGoals?: SmartGoalItem[];
}

const TABS = [
  { id: 'calendar', label: 'Calendar (TKB & Làm Việc)', icon: Calendar, accent: '#7b8cff' },
  { id: 'energy', label: 'Danh Sách & Năng Lượng', icon: BatteryCharging, accent: '#3dd68c' },
  { id: 'sprint', label: 'Sprint Manager', icon: Kanban, accent: '#f5b94a' },
  { id: 'smart', label: 'Mục Tiêu SMART', icon: Target, accent: '#a5b1ff' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function TaskHub({ tasks, sprints, currentEnergy, smartGoals = [] }: Props) {
  const router = useRouter();
  const scheduleFileRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('calendar');
  const [loading, setLoading] = useState(false);
  const [importingFile, setImportingFile] = useState(false);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [reportingTaskId, setReportingTaskId] = useState<string | null>(null);
  const [overdueReason, setOverdueReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const currentTab = TABS.find(t => t.id === activeTab)!;

  const handleScheduleUpload = async (file: File | null) => {
    if (!file) return;
    setImportingFile(true);
    setImportMsg(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/schedule/import', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setImportMsg({ ok: false, text: data.error || 'Không thể import file lịch trình.' });
      } else {
        setImportMsg({ ok: true, text: data.message });
        router.refresh();
      }
    } catch (e: any) {
      setImportMsg({ ok: false, text: e?.message || 'Lỗi kết nối khi import file.' });
    } finally {
      setImportingFile(false);
      if (scheduleFileRef.current) scheduleFileRef.current.value = '';
    }
  };

  const toLocalISO = (d: Date) =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const defaultStartStr = toLocalISO(new Date());
  const defaultEndStr = toLocalISO(new Date(Date.now() + 2 * 60 * 60 * 1000));

  // -- Derived --
  const getEnergyRecommendation = () => {
    if (currentEnergy <= 4) return 'Low';
    if (currentEnergy <= 7) return 'Medium';
    return 'High';
  };
  const recEnergy = getEnergyRecommendation();

  const getEnergyIcon = (level: string) => {
    if (level === 'Low') return <BatteryLow size={16} color="#5b9cff" />;
    if (level === 'Medium') return <BatteryMedium size={16} color="#f5b94a" />;
    return <BatteryFull size={16} color="#f46d75" />;
  };

  const getEnergyColor = (level: string) => {
    if (level === 'Low') return '#5b9cff';
    if (level === 'Medium') return '#f5b94a';
    return '#f46d75';
  };

  const activeSprint = sprints.find(s => s.isActive);

  // Overdue & Warning counts
  const now = new Date();
  const todoTasks = tasks.filter(t => t.status !== 'DONE');
  const overdueTasks = todoTasks.filter(t => getTaskTimeStatus(t.startTime, t.deadline, t.status, now).isOverdue);
  const warningTasks = todoTasks.filter(t => getTaskTimeStatus(t.startTime, t.deadline, t.status, now).isWarning);

  // -- Calendar Derived --
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);
  const dayOfWeek = startOfWeek.getDay(); // 0 is Sunday, 1 is Monday
  const diffToMonday = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) + weekOffset * 7;
  startOfWeek.setDate(diffToMonday);

  const weekDays = [...Array(7)].map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isDateInRange = (date: Date, startRaw: Date | string, endRaw: Date | string) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const s = new Date(startRaw);
    const e = new Date(endRaw);
    return s <= dayEnd && e >= dayStart;
  };

  const getTasksForDate = (date: Date) => {
    return tasks
      .filter(t => {
        if (!matchesCategoryFilter(t.category, categoryFilter)) return false;
        const start = t.startTime ? new Date(t.startTime) : new Date(t.deadline);
        const end = new Date(t.deadline);
        return isSameDay(start, date) || isSameDay(end, date) || isDateInRange(date, start, end);
      })
      .sort((a, b) => new Date(a.startTime || a.deadline).getTime() - new Date(b.startTime || b.deadline).getTime());
  };

  const getSprintsForDate = (date: Date) => {
    return sprints.filter(s => isDateInRange(date, s.startDate, s.endDate));
  };

  const getWeekActiveSprints = () => {
    const weekStart = weekDays[0];
    const weekEnd = new Date(weekDays[6]);
    weekEnd.setHours(23, 59, 59, 999);
    return sprints.filter(s => {
      const st = new Date(s.startDate);
      const en = new Date(s.endDate);
      return st <= weekEnd && en >= weekStart;
    });
  };

  // -- Handlers --
  const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    await addTask(new FormData(form));
    form.reset();
    setLoading(false);
  };

  const handleAddSprint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    await createSprint(new FormData(form));
    form.reset();
    setLoading(false);
  };

  const handleOverdueSubmit = async (taskId: string) => {
    if (!overdueReason.trim()) return;
    setLoading(true);
    await submitOverdueReport(taskId, overdueReason, rescheduleDate || undefined);
    setReportingTaskId(null);
    setOverdueReason('');
    setRescheduleDate('');
    setLoading(false);
  };

  const renderTask = (task: any) => {
    const timeStatus = getTaskTimeStatus(task.startTime, task.deadline, task.status, now);
    const catMeta = getCategoryMeta(task.category);
    const sprintObj = sprints.find(s => s.id === task.sprintId);

    // Check if task is blocked
    const isBlocked = task.blockedById && task.status !== 'DONE';
    const blockingTask = isBlocked ? tasks.find(t => t.id === task.blockedById) : null;
    const isBlockerDone = blockingTask?.status === 'DONE';
    const effectivelyBlocked = isBlocked && !isBlockerDone;

    return (
      <div
        key={task.id}
        style={{
          background: timeStatus.isOverdue
            ? 'rgba(244, 109, 117,0.06)'
            : timeStatus.isWarning
            ? 'rgba(245, 185, 74,0.06)'
            : 'rgba(255,255,255,0.02)',
          padding: '16px',
          borderRadius: '14px',
          border: `1px solid ${timeStatus.borderColor}`,
          borderLeft: `4px solid ${timeStatus.color}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          opacity: task.status === 'DONE' ? 0.6 : 1,
          transition: 'all 0.2s',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: task.status === 'DONE' ? '#64748b' : '#fff', fontWeight: 600, flexWrap: 'wrap' }}>
            <button
              disabled={effectivelyBlocked && task.status !== 'DONE'}
              onClick={() => updateTaskStatus(task.id, task.status === 'DONE' ? 'TODO' : 'DONE')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: effectivelyBlocked ? 'not-allowed' : 'pointer',
                color: task.status === 'DONE' ? '#3dd68c' : timeStatus.color,
                display: 'flex',
                opacity: effectivelyBlocked && task.status !== 'DONE' ? 0.5 : 1,
              }}
              title={effectivelyBlocked ? 'Bị block bởi task khác' : ''}
            >
              {task.status === 'DONE' ? <CheckCircle size={18} /> : <Circle size={18} />}
            </button>

            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', background: `${catMeta.color}22`, color: catMeta.color, fontWeight: 700 }}>
              {catMeta.icon} {catMeta.label}
            </span>

            <span style={{ textDecoration: task.status === 'DONE' ? 'line-through' : 'none', fontSize: '0.98rem' }}>
              {task.title}
              {task.isCoreTask && (
                <span title="Core Task" style={{ display: 'inline', marginLeft: '6px' }}>
                  <Flame size={14} color="#f46d75" style={{ verticalAlign: 'middle' }} />
                </span>
              )}
            </span>

            {sprintObj && (
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(245, 185, 74,0.15)', color: '#f5b94a', border: '1px solid rgba(245, 185, 74,0.3)' }}>
                {sprintObj.name}
              </span>
            )}
          </div>

          <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
            <Trash2 size={16} />
          </button>
        </div>

        {task.description && <p style={{ margin: '0 0 0 26px', fontSize: '0.85rem', color: '#94a3b8' }}>{task.description}</p>}

        {task.location && (
          <div style={{ marginLeft: '26px', fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={13} color="#6cc4ff" /> Địa điểm / Phòng: {task.location}
          </div>
        )}

        {effectivelyBlocked && blockingTask && (
          <div style={{ marginLeft: '26px', fontSize: '0.8rem', color: '#f46d75', background: 'rgba(244, 109, 117,0.1)', padding: '4px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
            Bị block bởi: {blockingTask.title}
          </div>
        )}

        {/* Time range + Warning / Overdue Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginLeft: '26px', marginTop: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: getEnergyColor(task.energyLevel) }}>
              {getEnergyIcon(task.energyLevel)} {task.energyLevel} Energy
            </span>
            <span style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} color="#94a3b8" />
              {formatDateTimeRange(task.startTime, task.deadline)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                background: timeStatus.bgColor,
                color: timeStatus.color,
                border: `1px solid ${timeStatus.borderColor}`,
                fontWeight: 700,
              }}
            >
              {timeStatus.badgeText}
            </span>

            {timeStatus.isOverdue && (
              <button
                type="button"
                onClick={() => setReportingTaskId(reportingTaskId === task.id ? null : task.id)}
                style={{
                  background: 'rgba(244, 109, 117,0.2)',
                  border: '1px solid rgba(244, 109, 117,0.4)',
                  color: '#f9a3a8',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Giải trình / Gia hạn
              </button>
            )}
          </div>
        </div>

        {/* Hiển thị báo cáo trễ đã lưu nếu có */}
        {task.overdueNote && (
          <div style={{ marginLeft: '26px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(244, 109, 117,0.1)', border: '1px dashed rgba(244, 109, 117,0.35)', fontSize: '0.8rem', color: '#f9a3a8' }}>
            <strong>Báo cáo trễ hạn:</strong> {task.overdueNote}
          </div>
        )}

        {/* Form Báo cáo trễ hạn & Gia hạn */}
        {reportingTaskId === task.id && (
          <div style={{ marginLeft: '26px', marginTop: '6px', padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(244, 109, 117,0.35)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.8rem', color: '#f9a3a8', fontWeight: 700 }}>
              Báo cáo nguyên nhân trễ hạn & Đặt lại thời hạn mới (nếu cần):
            </div>
            <input
              value={overdueReason}
              onChange={e => setOverdueReason(e.target.value)}
              placeholder="Nguyên nhân trễ hạn & hướng khắc phục..."
              style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'var(--surface)', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Gia hạn đến (tùy chọn):</span>
              <input
                type="datetime-local"
                value={rescheduleDate}
                onChange={e => setRescheduleDate(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'var(--surface)', color: '#fff', fontSize: '0.82rem', colorScheme: 'dark' }}
              />
              <button
                type="button"
                onClick={() => handleOverdueSubmit(task.id)}
                disabled={loading || !overdueReason.trim()}
                style={{ background: '#f46d75', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Gửi Báo Cáo
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const filteredTodoTasks = tasks
    .filter(t => t.status !== 'DONE')
    .filter(t => matchesCategoryFilter(t.category, categoryFilter));

  const filteredDoneTasks = tasks
    .filter(t => t.status === 'DONE')
    .filter(t => matchesCategoryFilter(t.category, categoryFilter));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
      {/* ── Top navigation bar ── */}
      <div style={{ display: 'flex', gap: '4px', background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px 20px 0 0', padding: '6px', flexWrap: 'wrap' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '14px 8px',
                borderRadius: '14px',
                border: 'none',
                background: active ? `linear-gradient(135deg, ${tab.accent}22, ${tab.accent}10)` : 'transparent',
                borderBottom: active ? `2px solid ${tab.accent}` : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none',
              }}
            >
              <Icon size={18} color={active ? tab.accent : '#64748b'} strokeWidth={active ? 2.5 : 1.5} />
              <span style={{ fontSize: '0.75rem', fontWeight: active ? 700 : 500, color: active ? tab.accent : '#64748b' }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Breadcrumb strip ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px', background: 'rgba(15,23,42,0.5)', borderLeft: '1px solid rgba(255,255,255,0.06)', borderRight: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#475569' }}>Task & Schedule Hub</span>
          <ChevronRight size={12} color="#334155" />
          <span style={{ fontSize: '0.78rem', color: currentTab.accent, fontWeight: 600 }}>{currentTab.label}</span>
        </div>

        {/* Quick stats badges */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.78rem' }}>
          {overdueTasks.length > 0 && (
            <span style={{ background: 'rgba(244, 109, 117,0.18)', color: '#f46d75', border: '1px solid rgba(244, 109, 117,0.4)', padding: '3px 10px', borderRadius: '20px', fontWeight: 700 }}>
              {overdueTasks.length} mục trễ hạn cần báo cáo
            </span>
          )}
          {warningTasks.length > 0 && (
            <span style={{ background: 'rgba(245, 185, 74,0.18)', color: '#f5b94a', border: '1px solid rgba(245, 185, 74,0.4)', padding: '3px 10px', borderRadius: '20px', fontWeight: 700 }}>
              {warningTasks.length} mục sắp tới hạn
            </span>
          )}
        </div>
      </div>

      {/* ── Content panel ── */}
      <div style={{ flex: 1, background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', borderRadius: '0 0 20px 20px', padding: '24px', backdropFilter: 'blur(16px)' }}>
        {/* ── GLOBAL WARNING & OVERDUE REPORT ALERTS ── */}
        {(overdueTasks.length > 0 || warningTasks.length > 0) && activeTab !== 'smart' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {overdueTasks.length > 0 && (
              <div style={{ background: 'linear-gradient(135deg, rgba(244, 109, 117,0.14), var(--surface))', border: '1px solid rgba(244, 109, 117,0.4)', borderRadius: '16px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f46d75', fontWeight: 800, fontSize: '0.95rem' }}>
                  <FileWarning size={20} /> BÁO CÁO TRỄ HẠN ({overdueTasks.length} công việc/lịch trình)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                  {overdueTasks.map(t => {
                    const st = getTaskTimeStatus(t.startTime, t.deadline, t.status, now);
                    return (
                      <div key={t.id} style={{ fontSize: '0.83rem', color: '#fecaca', display: 'flex', justifyContent: 'space-between', gap: '8px', background: 'rgba(0,0,0,0.25)', padding: '6px 10px', borderRadius: '8px' }}>
                        <span style={{ fontWeight: 600 }}>{t.title}</span>
                        <span style={{ color: '#f46d75', fontWeight: 700, flexShrink: 0 }}>Trễ {st.overdueDurationText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {warningTasks.length > 0 && (
              <div style={{ background: 'linear-gradient(135deg, rgba(245, 185, 74,0.14), var(--surface))', border: '1px solid rgba(245, 185, 74,0.4)', borderRadius: '16px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f5b94a', fontWeight: 800, fontSize: '0.95rem' }}>
                  <AlertTriangle size={20} /> CẢNH BÁO SẮP TỚI ({warningTasks.length} mục trong 24h tới)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                  {warningTasks.map(t => {
                    const st = getTaskTimeStatus(t.startTime, t.deadline, t.status, now);
                    return (
                      <div key={t.id} style={{ fontSize: '0.83rem', color: '#f9d68a', display: 'flex', justifyContent: 'space-between', gap: '8px', background: 'rgba(0,0,0,0.25)', padding: '6px 10px', borderRadius: '8px' }}>
                        <span style={{ fontWeight: 600 }}>{t.title}</span>
                        <span style={{ color: '#f5b94a', fontWeight: 700, flexShrink: 0 }}>{st.badgeText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- ENERGY BOARD TAB --- */}
        {activeTab === 'energy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ background: 'rgba(91, 156, 255,0.1)', border: '1px solid rgba(91, 156, 255,0.3)', padding: '18px 20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ background: 'rgba(91, 156, 255,0.2)', padding: '12px', borderRadius: '50%' }}>
                  <Zap size={24} color="#5b9cff" />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: '#5b9cff', fontSize: '1.05rem' }}>
                    Mức năng lượng hiện tại: {currentEnergy}/10
                  </h3>
                  <p style={{ margin: 0, color: '#93c5fd', fontSize: '0.88rem' }}>
                    Gợi ý ưu tiên công việc mức <strong style={{ color: getEnergyColor(recEnergy) }}>[{recEnergy} Energy]</strong>
                  </p>
                </div>
              </div>

              {/* Filter by Category */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setCategoryFilter('ALL')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: categoryFilter === 'ALL' ? '#5b9cff' : 'rgba(255,255,255,0.04)',
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Tất cả ({todoTasks.length})
                </button>
                {TASK_CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCategoryFilter(c.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: `1px solid ${categoryFilter === c.id ? c.color : 'rgba(255,255,255,0.1)'}`,
                      background: categoryFilter === c.id ? `${c.color}33` : 'rgba(255,255,255,0.03)',
                      color: categoryFilter === c.id ? '#fff' : '#cbd5e1',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {/* CREATE FORM */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', alignSelf: 'start' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: '1.1rem' }}>
                  Thêm Task / Thời Khóa Biểu / Lịch Làm Việc / Lịch Hẹn
                </h4>
                <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '10px' }}>
                    <select
                      name="category"
                      defaultValue="SCHEDULE"
                      style={{ padding: '11px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff', outline: 'none', fontWeight: 600 }}
                    >
                      <option value="SCHEDULE">Thời khóa biểu & Lịch làm việc</option>
                      <option value="APPOINTMENT">Lịch hẹn & Sự kiện</option>
                      <option value="TASK">Công việc / Deadline</option>
                    </select>
                    <select
                      name="energyLevel"
                      defaultValue="Medium"
                      required
                      style={{ padding: '11px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff', outline: 'none' }}
                    >
                      <option value="Low">Low Energy (Dễ)</option>
                      <option value="Medium">Medium Energy (Vừa)</option>
                      <option value="High">High Energy (Khó)</option>
                    </select>
                  </div>

                  <input
                    name="title"
                    placeholder="Tên công việc, môn học, ca làm hoặc lịch hẹn..."
                    required
                    style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input
                      name="location"
                      placeholder="Phòng học / Địa điểm / Link..."
                      style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', fontSize: '0.88rem' }}
                    />
                    <input
                      name="description"
                      placeholder="Ghi chú chi tiết..."
                      style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', fontSize: '0.88rem' }}
                    />
                  </div>

                  {/* START TIME & END TIME (BOTH DATE AND TIME) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                        Bắt đầu (Ngày & Giờ) *
                      </label>
                      <input
                        name="startTime"
                        type="datetime-local"
                        required
                        defaultValue={defaultStartStr}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.4)', color: '#fff', outline: 'none', colorScheme: 'dark', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                        Kết thúc / Hạn chót (Ngày & Giờ) *
                      </label>
                      <input
                        name="deadline"
                        type="datetime-local"
                        required
                        defaultValue={defaultEndStr}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.4)', color: '#fff', outline: 'none', colorScheme: 'dark', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#cbd5e1', flexShrink: 0 }}>
                      <input type="checkbox" name="isCoreTask" /> Core Task (Ưu tiên)
                    </label>
                    <select
                      name="blockedById"
                      style={{ flex: 1, minWidth: '150px', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff', outline: 'none', fontSize: '0.82rem' }}
                    >
                      <option value="">Không bị block bởi task nào</option>
                      {tasks
                        .filter(t => t.status !== 'DONE')
                        .map(t => (
                          <option key={t.id} value={t.id}>
                            Bị block bởi: {t.title}
                          </option>
                        ))}
                    </select>
                  </div>

                  {sprints.length > 0 && (
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        Gắn vào Sprint (hiển thị trên Sprint & Calendar):
                      </label>
                      <select
                        name="sprintId"
                        defaultValue={activeSprint?.id || ''}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(245, 185, 74,0.3)', background: '#0f172a', color: '#f5b94a', outline: 'none', fontSize: '0.85rem' }}
                      >
                        <option value="">-- Không thuộc Sprint nào --</option>
                        {sprints.map(sp => (
                          <option key={sp.id} value={sp.id}>
                            {sp.name} ({new Date(sp.startDate).toLocaleDateString('vi-VN')} - {new Date(sp.endDate).toLocaleDateString('vi-VN')})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{ background: '#5b9cff', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', marginTop: '4px' }}
                  >
                    {loading ? 'Đang lưu...' : 'Tạo Lịch / Task Mới'}
                  </button>
                </form>
              </div>

              {/* TASK LIST */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Danh Sách Lịch Trình & Công Việc</span>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{filteredTodoTasks.length} đang mở</span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '560px', overflowY: 'auto', paddingRight: '4px' }}>
                  {filteredTodoTasks
                    .sort((a, b) => {
                      const stA = getTaskTimeStatus(a.startTime, a.deadline, a.status, now);
                      const stB = getTaskTimeStatus(b.startTime, b.deadline, b.status, now);
                      if (stA.isOverdue && !stB.isOverdue) return -1;
                      if (!stA.isOverdue && stB.isOverdue) return 1;
                      if (stA.isWarning && !stB.isWarning) return -1;
                      if (!stA.isWarning && stB.isWarning) return 1;
                      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                    })
                    .map(renderTask)}

                  {filteredDoneTasks.map(renderTask)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- SPRINT TAB --- */}
        {activeTab === 'sprint' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
              {/* CREATE SPRINT */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', alignSelf: 'start' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '1.1rem' }}>Tạo Sprint Mới</h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.83rem', color: '#94a3b8' }}>
                  Sprint tạo xong sẽ tự động đồng bộ và hiển thị trực tiếp trên <strong>Calendar View</strong>.
                </p>
                <form onSubmit={handleAddSprint} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    name="name"
                    placeholder="Tên Sprint (VD: Sprint 1 - Ôn thi & Hoàn thiện Đồ án)"
                    required
                    style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Bắt đầu (Ngày & Giờ)</label>
                      <input
                        name="startDate"
                        type="datetime-local"
                        required
                        defaultValue={defaultStartStr}
                        style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', colorScheme: 'dark', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Kết thúc (Ngày & Giờ)</label>
                      <input
                        name="endDate"
                        type="datetime-local"
                        required
                        defaultValue={toLocalISO(new Date(Date.now() + 7 * 86400000))}
                        style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', colorScheme: 'dark', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {/* Chọn các task có sẵn để đưa vào Sprint */}
                  {todoTasks.length > 0 && (
                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <label style={{ fontSize: '0.78rem', color: '#f5b94a', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                        Chọn công việc đưa vào Sprint này (tùy chọn):
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                        {todoTasks.map(t => (
                          <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#e2e8f0', cursor: 'pointer' }}>
                            <input type="checkbox" name="taskIds" value={t.id} />
                            <span>{t.title}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{ background: '#f5b94a', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', marginTop: '4px' }}
                  >
                    {loading ? 'Đang tạo...' : 'Bắt đầu Sprint & Hiện lên Calendar'}
                  </button>
                </form>
              </div>

              {/* SPRINT LIST */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {sprints.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 20px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                    Chưa có Sprint nào. Tạo một Sprint để quản lý tiến độ và theo dõi trên Calendar!
                  </div>
                ) : (
                  sprints.map(sprint => {
                    const sprintTasks = tasks.filter(t => t.sprintId === sprint.id);
                    const sprintTimeStatus = getTaskTimeStatus(sprint.startDate, sprint.endDate, 'TODO', now);
                    const total = sprintTasks.length;
                    const done = sprintTasks.filter(t => t.status === 'DONE').length;
                    const progress = total === 0 ? 0 : Math.round((done / total) * 100);
                    const unassignedTasks = todoTasks.filter(t => t.sprintId !== sprint.id);

                    return (
                      <div
                        key={sprint.id}
                        style={{
                          background: 'rgba(255,255,255,0.025)',
                          padding: '20px',
                          borderRadius: '16px',
                          border: `1px solid ${sprintTimeStatus.isOverdue ? 'rgba(244, 109, 117,0.4)' : 'rgba(245, 185, 74,0.35)'}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div>
                            <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {sprint.name}
                            </h4>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                              <Timer size={14} color="#f5b94a" />
                              {formatDateTimeRange(sprint.startDate, sprint.endDate)}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.78rem', background: sprintTimeStatus.bgColor, color: sprintTimeStatus.color, border: `1px solid ${sprintTimeStatus.borderColor}`, padding: '4px 10px', borderRadius: '8px', fontWeight: 700 }}>
                              {progress === 100 && total > 0 ? 'Đã hoàn thành 100%' : sprintTimeStatus.badgeText}
                            </span>
                            <button
                              onClick={() => deleteSprint(sprint.id)}
                              style={{ background: 'rgba(244, 109, 117,0.1)', border: 'none', color: '#f46d75', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}
                              title="Xóa Sprint"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#cbd5e1' }}>
                          <span>Tiến độ công việc ({done}/{total} tasks)</span>
                          <strong style={{ color: '#f5b94a' }}>{progress}%</strong>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${progress}%`, height: '100%', background: '#f5b94a', transition: 'width 0.3s' }} />
                        </div>

                        {sprintTasks.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                            {sprintTasks.map(t => {
                              const st = getTaskTimeStatus(t.startTime, t.deadline, t.status, now);
                              return (
                                <div key={t.id} style={{ fontSize: '0.84rem', color: t.status === 'DONE' ? '#64748b' : '#e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button
                                      onClick={() => updateTaskStatus(t.id, t.status === 'DONE' ? 'TODO' : 'DONE')}
                                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: t.status === 'DONE' ? '#3dd68c' : '#94a3b8', display: 'flex' }}
                                    >
                                      {t.status === 'DONE' ? <CheckCircle size={14} color="#3dd68c" /> : <Circle size={14} />}
                                    </button>
                                    <span style={{ textDecoration: t.status === 'DONE' ? 'line-through' : 'none' }}>{t.title}</span>
                                  </div>
                                  <span style={{ fontSize: '0.72rem', color: st.color }}>{st.badgeText}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                            Sprint này chưa có task nào. Bạn có thể thêm task bên dưới:
                          </div>
                        )}

                        {unassignedTasks.length > 0 && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <select
                              onChange={e => {
                                if (e.target.value) {
                                  assignTaskToSprint(e.target.value, sprint.id);
                                  e.target.value = '';
                                }
                              }}
                              defaultValue=""
                              style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#cbd5e1', fontSize: '0.8rem' }}
                            >
                              <option value="">+ Gán nhanh Task có sẵn vào Sprint này...</option>
                              {unassignedTasks.map(ut => (
                                <option key={ut.id} value={ut.id}>
                                  {ut.title}
                                </option>
                              ))}
                            </select>
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

        {/* --- CALENDAR TAB --- */}
        {activeTab === 'calendar' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.18rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={20} color="#7b8cff" /> Calendar: Thời Khóa Biểu & Lịch Làm Việc • Lịch Hẹn • Sprint
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                  Gộp chung Thời khóa biểu và Lịch làm việc theo cấu trúc Calendar 7 ngày, hỗ trợ import trực tiếp từ file schedule (.xlsx, .ics, .csv).
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  ref={scheduleFileRef}
                  type="file"
                  accept=".xlsx,.ics,.csv,.tsv,.json"
                  onChange={e => handleScheduleUpload(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  disabled={importingFile}
                  onClick={() => scheduleFileRef.current?.click()}
                  style={{
                    background: '#3dd68c',
                    color: '#09110d',
                    border: 'none',
                    padding: '7px 13px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: importingFile ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Upload size={14} />
                  {importingFile ? 'Đang import...' : 'Import File Schedule (.xlsx / .ics)'}
                </button>

                <a
                  href="/api/schedule/template?format=xlsx"
                  download="Mau_Lich_Calendar_GlowUp.xlsx"
                  style={{
                    background: 'rgba(123, 140, 255, 0.14)',
                    border: '1px solid rgba(123, 140, 255, 0.35)',
                    color: '#a5b1ff',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Download size={13} /> Mẫu Excel
                </a>

                <a
                  href="/api/schedule/template?format=ics"
                  download="Mau_Lich_Calendar_GlowUp.ics"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#cbd5e1',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Download size={13} /> Mẫu .ics
                </a>

                <button
                  onClick={() => setWeekOffset(prev => prev - 1)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <ChevronLeft size={16} /> Tuần trước
                </button>
                <button
                  onClick={() => setWeekOffset(0)}
                  style={{ background: 'rgba(123, 140, 255, 0.16)', border: '1px solid rgba(123, 140, 255, 0.38)', color: '#a5b1ff', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}
                >
                  Tuần này
                </button>
                <button
                  onClick={() => setWeekOffset(prev => prev + 1)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  Tuần tới <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {importMsg && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  background: importMsg.ok ? 'rgba(61, 214, 140, 0.12)' : 'rgba(244, 109, 117, 0.12)',
                  border: `1px solid ${importMsg.ok ? 'rgba(61, 214, 140, 0.35)' : 'rgba(244, 109, 117, 0.35)'}`,
                  color: importMsg.ok ? '#3dd68c' : '#f46d75',
                }}
              >
                {importMsg.text}
              </div>
            )}

            {/* BỘ LỌC NHANH TRÊN CALENDAR */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { id: 'ALL', label: 'Tất cả lịch trình' },
                { id: 'SCHEDULE', label: 'Thời khóa biểu & Làm việc' },
                { id: 'APPOINTMENT', label: 'Lịch hẹn & Sự kiện' },
                { id: 'TASK', label: 'Công việc / Deadline' },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCategoryFilter(f.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: categoryFilter === f.id ? '1px solid #7b8cff' : '1px solid rgba(255,255,255,0.08)',
                    background: categoryFilter === f.id ? 'rgba(123, 140, 255, 0.16)' : 'rgba(255,255,255,0.02)',
                    color: categoryFilter === f.id ? '#a5b1ff' : '#94a3b8',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* SPRINT TIMELINE BANNERS TRONG TUẦN */}
            {getWeekActiveSprints().length > 0 && (
              <div style={{ background: 'rgba(245, 185, 74,0.08)', border: '1px solid rgba(245, 185, 74,0.3)', borderRadius: '14px', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f5b94a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Sprints Đang Chạy Trong Tuần Này ({getWeekActiveSprints().length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {getWeekActiveSprints().map(sp => {
                    const spTasks = tasks.filter(t => t.sprintId === sp.id);
                    const spDone = spTasks.filter(t => t.status === 'DONE').length;
                    const pct = spTasks.length === 0 ? 0 : Math.round((spDone / spTasks.length) * 100);
                    return (
                      <div
                        key={sp.id}
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid rgba(245, 185, 74,0.4)',
                          borderRadius: '10px',
                          padding: '8px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          fontSize: '0.83rem',
                        }}
                      >
                        <strong style={{ color: '#fff' }}>{sp.name}</strong>
                        <span style={{ color: '#94a3b8' }}>
                          ({new Date(sp.startDate).toLocaleDateString('vi-VN')} → {new Date(sp.endDate).toLocaleDateString('vi-VN')})
                        </span>
                        <span style={{ background: 'rgba(245, 185, 74,0.2)', color: '#f5b94a', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                          {pct}% ({spDone}/{spTasks.length} tasks)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7-DAY CALENDAR GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(195px, 1fr))', gap: '14px', overflowX: 'auto', paddingBottom: '16px' }}>
              {weekDays.map((day, idx) => {
                const dayTasks = getTasksForDate(day);
                const daySprints = getSprintsForDate(day);
                const isToday = isSameDay(day, today);
                const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

                return (
                  <div
                    key={idx}
                    style={{
                      background: isToday ? 'rgba(61, 214, 140,0.05)' : 'rgba(255,255,255,0.02)',
                      border: isToday ? '1px solid rgba(61, 214, 140,0.35)' : '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: '400px',
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        padding: '14px',
                        borderBottom: isToday ? '1px solid rgba(61, 214, 140,0.2)' : '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: isToday ? 'rgba(61, 214, 140,0.12)' : 'transparent',
                        borderRadius: '16px 16px 0 0',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.78rem', color: isToday ? '#3dd68c' : '#94a3b8', fontWeight: 700 }}>
                          {dayNames[day.getDay()]} ({day.getDate()}/{day.getMonth() + 1})
                        </span>
                        <span style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 800 }}>
                          {isToday ? 'Hôm nay' : `Ngày ${day.getDate()}`}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '6px', color: '#cbd5e1', fontWeight: 600 }}>
                        {dayTasks.length} mục
                      </span>
                    </div>

                    {/* Sprint Badges Active on This Day */}
                    {daySprints.length > 0 && (
                      <div style={{ padding: '8px 10px 0 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {daySprints.map(sp => (
                          <div
                            key={sp.id}
                            style={{
                              background: 'linear-gradient(90deg, rgba(245, 185, 74,0.25), rgba(245, 185, 74,0.1))',
                              border: '1px solid rgba(245, 185, 74,0.4)',
                              color: '#f5b94a',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={`Sprint: ${sp.name} (${new Date(sp.startDate).toLocaleDateString('vi-VN')} - ${new Date(sp.endDate).toLocaleDateString('vi-VN')})`}
                          >
                            {sp.name}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Task / Schedule List */}
                    <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
                      {dayTasks.length === 0 && daySprints.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', marginTop: '24px', fontStyle: 'italic' }}>
                          Trống
                        </div>
                      ) : (
                        dayTasks.map(task => {
                          const isDone = task.status === 'DONE';
                          const st = getTaskTimeStatus(task.startTime, task.deadline, task.status, now);
                          const cat = getCategoryMeta(task.category);
                          const startT = task.startTime
                            ? new Date(task.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                            : '';
                          const endT = new Date(task.deadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

                          return (
                            <div
                              key={task.id}
                              style={{
                                background: st.isOverdue
                                  ? 'rgba(244, 109, 117,0.1)'
                                  : st.isWarning
                                  ? 'rgba(245, 185, 74,0.08)'
                                  : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${st.borderColor}`,
                                borderLeft: `3px solid ${cat.color}`,
                                borderRadius: '10px',
                                padding: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                                opacity: isDone ? 0.55 : 1,
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', fontWeight: 700 }}>
                                <span style={{ color: cat.color }}>
                                  {cat.icon} {cat.label}
                                </span>
                                <span style={{ color: '#cbd5e1', background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: '4px' }}>
                                  {startT ? `${startT} - ${endT}` : endT}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                <button
                                  onClick={() => updateTaskStatus(task.id, isDone ? 'TODO' : 'DONE')}
                                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: isDone ? '#3dd68c' : '#94a3b8', flexShrink: 0, marginTop: '2px' }}
                                >
                                  {isDone ? <CheckCircle size={14} /> : <Circle size={14} />}
                                </button>
                                <span style={{ fontSize: '0.84rem', color: '#fff', fontWeight: 600, lineHeight: 1.3, textDecoration: isDone ? 'line-through' : 'none', wordBreak: 'break-word' }}>
                                  {task.title}
                                </span>
                              </div>

                              {task.location && (
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '20px' }}>
                                  {task.location}
                                </div>
                              )}

                              <div style={{ display: 'flex', gap: '4px', marginLeft: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.65rem', color: st.color, background: st.bgColor, padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                  {st.badgeText}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- SMART GOALS TAB --- */}
        {activeTab === 'smart' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <SmartGoalBoard goals={smartGoals} />
          </div>
        )}
      </div>
    </div>
  );
}
