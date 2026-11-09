'use client';

import { useTransition, useState } from 'react';
import { Circle, CheckCircle, Trash2, Plus, Clock } from 'lucide-react';
import { updateTaskStatus, deleteTask, addTask } from '@/app/tasks/actions';
import { getTaskTimeStatus, formatDateTimeRange, getCategoryMeta } from '@/lib/utils/timeFormat';

export default function InteractiveTasks({ tasks }: { tasks: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);

  const toLocalISO = (d: Date) =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const defaultStart = toLocalISO(new Date());
  const defaultEnd = toLocalISO(new Date(Date.now() + 2 * 60 * 60 * 1000));

  const handleToggle = (id: string, currentStatus: string) => {
    startTransition(async () => {
      await updateTaskStatus(id, currentStatus === 'DONE' ? 'TODO' : 'DONE');
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteTask(id);
    });
  };

  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      await addTask(formData);
      form.reset();
      setIsAdding(false);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {tasks.length === 0 ? (
        <div style={{ color: '#64748b', fontSize: '0.95rem', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', textAlign: 'center', fontStyle: 'italic' }}>
          Tuyệt vời, bạn không có task nào tồn đọng!
        </div>
      ) : (
        tasks.map(task => {
          const isDone = task.status === 'DONE';
          const timeStatus = getTaskTimeStatus(task.startTime, task.deadline, task.status);
          const catMeta = getCategoryMeta(task.category);

          return (
            <div
              key={task.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 18px',
                background: timeStatus.isOverdue
                  ? 'rgba(239,68,68,0.08)'
                  : timeStatus.isWarning
                  ? 'rgba(245,158,11,0.08)'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${timeStatus.borderColor}`,
                borderRadius: '16px',
                borderLeft: `4px solid ${timeStatus.color}`,
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                opacity: isDone ? 0.5 : 1,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 200px', overflow: 'hidden' }}>
                <button
                  onClick={() => handleToggle(task.id, task.status)}
                  disabled={isPending}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: isPending ? 'wait' : 'pointer',
                    color: isDone ? '#10b981' : timeStatus.color,
                    display: 'flex',
                    flexShrink: 0,
                  }}
                >
                  {isDone ? <CheckCircle size={20} /> : <Circle size={20} />}
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.7rem', padding: '1px 7px', borderRadius: '6px', background: `${catMeta.color}22`, color: catMeta.color, fontWeight: 700, flexShrink: 0 }}>
                      {catMeta.icon} {catMeta.label}
                    </span>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.96rem', textDecoration: isDone ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.title}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {formatDateTimeRange(task.startTime, task.deadline)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: '0.76rem',
                    color: timeStatus.color,
                    background: timeStatus.bgColor,
                    border: `1px solid ${timeStatus.borderColor}`,
                    padding: '4px 10px',
                    borderRadius: '10px',
                    fontWeight: 700,
                  }}
                >
                  {timeStatus.badgeText}
                </span>
                <button
                  onClick={() => handleDelete(task.id)}
                  disabled={isPending}
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: 'none',
                    padding: '6px',
                    borderRadius: '8px',
                    cursor: isPending ? 'wait' : 'pointer',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* QUICK ADD TASK FORM */}
      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          style={{
            marginTop: '4px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px dashed rgba(255,255,255,0.2)',
            padding: '12px',
            borderRadius: '14px',
            color: '#94a3b8',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Plus size={18} /> Thêm Nhanh Công Việc / Lịch Trình (Có Ngày & Giờ Bắt Đầu - Kết Thúc)
        </button>
      ) : (
        <form
          onSubmit={handleAddTask}
          style={{
            marginTop: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: 'rgba(0,0,0,0.35)',
            padding: '14px',
            borderRadius: '16px',
            border: '1px solid rgba(59,130,246,0.35)',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select
              name="category"
              defaultValue="TASK"
              disabled={isPending}
              style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff', outline: 'none', fontWeight: 600 }}
            >
              <option value="TASK">Công việc</option>
              <option value="TIMETABLE">Thời khóa biểu</option>
              <option value="WORK_SCHEDULE">Lịch làm việc</option>
              <option value="APPOINTMENT">Lịch hẹn</option>
            </select>
            <input
              name="title"
              autoFocus
              placeholder="Tên công việc / môn học / lịch hẹn..."
              required
              disabled={isPending}
              style={{ flex: 1, minWidth: '180px', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.92rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Bắt đầu (Ngày & Giờ)</label>
              <input
                name="startTime"
                type="datetime-local"
                required
                defaultValue={defaultStart}
                disabled={isPending}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none', colorScheme: 'dark', fontSize: '0.82rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Kết thúc (Ngày & Giờ)</label>
              <input
                name="deadline"
                type="datetime-local"
                required
                defaultValue={defaultEnd}
                disabled={isPending}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none', colorScheme: 'dark', fontSize: '0.82rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Năng lượng</label>
              <select
                name="energyLevel"
                defaultValue="Medium"
                disabled={isPending}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff', outline: 'none', fontSize: '0.82rem' }}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              type="submit"
              disabled={isPending}
              style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, cursor: isPending ? 'wait' : 'pointer' }}
            >
              Lưu Lịch / Task
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              disabled={isPending}
              style={{ background: 'transparent', color: '#94a3b8', border: 'none', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}
            >
              Hủy
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
