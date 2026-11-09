'use client';

import { useState, useTransition } from 'react';
import { Calendar, Clock, Plus, CheckCircle, Circle, Trash2, MapPin, Kanban } from 'lucide-react';
import { addTask, updateTaskStatus, deleteTask } from '@/app/tasks/actions';
import { getTaskTimeStatus, formatDateTimeRange, TASK_CATEGORIES, getCategoryMeta } from '@/lib/utils/timeFormat';

interface Props {
  tasks: any[];
  sprints: any[];
}

export default function DashboardScheduleHub({ tasks, sprints }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [defaultCat, setDefaultCat] = useState<string>('TIMETABLE');
  const [isPending, startTransition] = useTransition();

  const toLocalISO = (d: Date) =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const openAddWithCat = (cat: string) => {
    setDefaultCat(cat);
    setShowAddModal(true);
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await addTask(fd);
      setShowAddModal(false);
    });
  };

  const activeTasks = tasks.filter(t => t.status !== 'DONE');
  const filteredItems = activeTasks.filter(t => activeFilter === 'ALL' || (t.category || 'TASK') === activeFilter);

  const timetableItems = activeTasks.filter(t => t.category === 'TIMETABLE');
  const workItems = activeTasks.filter(t => t.category === 'WORK_SCHEDULE' || !t.category || t.category === 'TASK');
  const appointmentItems = activeTasks.filter(t => t.category === 'APPOINTMENT');

  return (
    <section
      style={{
        background: 'rgba(15,23,42,0.85)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(16,185,129,0.18)', padding: '10px', borderRadius: '14px', border: '1px solid rgba(16,185,129,0.3)' }}>
            <Calendar size={24} color="#10b981" />
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.3rem', fontWeight: 800 }}>
              Thời Khóa Biểu • Lịch Làm Việc • Lịch Hẹn & Sprint
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Quản lý toàn bộ thời gian biểu bắt đầu - kết thúc (Ngày & Giờ), tự động cảnh báo khi sắp tới và báo cáo khi trễ hạn
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => openAddWithCat('TIMETABLE')}
            style={{ background: 'rgba(168,85,247,0.18)', border: '1px solid rgba(168,85,247,0.4)', color: '#d8b4fe', padding: '8px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} /> 📚 Thêm Thời khóa biểu
          </button>
          <button
            onClick={() => openAddWithCat('WORK_SCHEDULE')}
            style={{ background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(16,185,129,0.4)', color: '#6ee7b7', padding: '8px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} /> 💼 Thêm Lịch làm việc
          </button>
          <button
            onClick={() => openAddWithCat('APPOINTMENT')}
            style={{ background: 'rgba(236,72,153,0.18)', border: '1px solid rgba(236,72,153,0.4)', color: '#f9a8d4', padding: '8px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} /> 📅 Thêm Lịch hẹn
          </button>
        </div>
      </div>

      {/* FORM THÊM LỊCH TRÌNH NHANH */}
      {showAddModal && (
        <form
          onSubmit={handleCreate}
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(16,185,129,0.35)',
            borderRadius: '16px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '10px' }}>
            <select
              name="category"
              value={defaultCat}
              onChange={e => setDefaultCat(e.target.value)}
              style={{ padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: '#0f172a', color: '#fff', fontWeight: 700 }}
            >
              <option value="TIMETABLE">📚 Thời khóa biểu</option>
              <option value="WORK_SCHEDULE">💼 Lịch làm việc</option>
              <option value="APPOINTMENT">📅 Lịch hẹn</option>
              <option value="TASK">⚡ Công việc (Task)</option>
            </select>
            <input
              name="title"
              required
              placeholder="Tên môn học / Ca làm việc / Cuộc hẹn..."
              style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(15,23,42,0.9)', color: '#fff', outline: 'none' }}
            />
            <input
              name="location"
              placeholder="Phòng / Địa điểm / Link..."
              style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(15,23,42,0.9)', color: '#fff', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Bắt đầu (Ngày & Giờ) *</label>
              <input
                name="startTime"
                type="datetime-local"
                required
                defaultValue={toLocalISO(new Date())}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(15,23,42,0.9)', color: '#fff', colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Kết thúc (Ngày & Giờ) *</label>
              <input
                name="deadline"
                type="datetime-local"
                required
                defaultValue={toLocalISO(new Date(Date.now() + 2 * 3600000))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(15,23,42,0.9)', color: '#fff', colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Mức năng lượng</label>
              <select
                name="energyLevel"
                defaultValue="Medium"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: '#0f172a', color: '#fff' }}
              >
                <option value="Low">🪫 Low</option>
                <option value="Medium">🔋 Medium</option>
                <option value="High">⚡ High</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                disabled={isPending}
                style={{ background: '#10b981', color: '#0f172a', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 3 BẢNG CHUYÊN BIỆT: THỜI KHÓA BIỂU | LỊCH LÀM VIỆC | LỊCH HẸN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '16px' }}>
        {[
          { title: '📚 Thời Khóa Biểu (Lịch Học)', accent: '#a855f7', items: timetableItems, emptyText: 'Chưa có lịch học nào.' },
          { title: '💼 Lịch Làm Việc & Công Việc', accent: '#10b981', items: workItems, emptyText: 'Chưa có ca làm việc/task nào.' },
          { title: '📅 Lịch Hẹn & Sự Kiện', accent: '#ec4899', items: appointmentItems, emptyText: 'Chưa có lịch hẹn nào.' },
        ].map((col, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderTop: `3px solid ${col.accent}`,
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, color: '#fff', fontSize: '0.98rem', fontWeight: 700 }}>{col.title}</h4>
              <span style={{ fontSize: '0.75rem', color: col.accent, background: `${col.accent}22`, padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                {col.items.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              {col.items.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '0.82rem', fontStyle: 'italic', padding: '16px 0', textAlign: 'center' }}>
                  {col.emptyText}
                </div>
              ) : (
                col.items.slice(0, 6).map(item => {
                  const st = getTaskTimeStatus(item.startTime, item.deadline, item.status);
                  return (
                    <div
                      key={item.id}
                      style={{
                        background: st.isOverdue ? 'rgba(239,68,68,0.08)' : st.isWarning ? 'rgba(245,158,11,0.08)' : 'rgba(0,0,0,0.25)',
                        border: `1px solid ${st.borderColor}`,
                        borderRadius: '10px',
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>
                          <button
                            onClick={() => startTransition(() => updateTaskStatus(item.id, 'DONE'))}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: st.color, display: 'flex' }}
                          >
                            <Circle size={15} />
                          </button>
                          <span>{item.title}</span>
                        </div>
                        <button
                          onClick={() => startTransition(() => deleteTask(item.id))}
                          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {item.location && (
                        <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginLeft: '21px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={11} color="#38bdf8" /> {item.location}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: '21px', fontSize: '0.72rem', flexWrap: 'wrap', gap: '4px' }}>
                        <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={11} /> {formatDateTimeRange(item.startTime, item.deadline)}
                        </span>
                        <span style={{ color: st.color, fontWeight: 700 }}>{st.badgeText}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ACTIVE SPRINTS TRÊN DASHBOARD */}
      {sprints.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Kanban size={16} /> Sprints Đang Theo Dõi
            </span>
            <a href="/tasks" style={{ fontSize: '0.8rem', color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>
              Mở Calendar & Sprint Manager →
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {sprints.slice(0, 3).map(sp => {
              const total = sp.tasks?.length || 0;
              const done = sp.tasks?.filter((t: any) => t.status === 'DONE').length || 0;
              const pct = total === 0 ? 0 : Math.round((done / total) * 100);
              return (
                <div key={sp.id} style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '12px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem' }}>🏃 {sp.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                      {new Date(sp.startDate).toLocaleDateString('vi-VN')} → {new Date(sp.endDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.85rem' }}>{pct}% ({done}/{total})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
