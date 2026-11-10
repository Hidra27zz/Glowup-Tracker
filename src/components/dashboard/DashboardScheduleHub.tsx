'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle,
  Circle,
  Trash2,
  MapPin,
  Kanban,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Columns,
  Pencil,
} from 'lucide-react';
import { addTask, updateTask, updateTaskStatus, deleteTask } from '@/app/tasks/actions';
import {
  getTaskTimeStatus,
  formatDateTimeRange,
  getCategoryMeta,
  normalizeScheduleCategory,
  matchesCategoryFilter,
} from '@/lib/utils/timeFormat';

interface Props {
  tasks: any[];
  sprints: any[];
}

type ViewMode = 'week' | 'month' | 'columns';

export default function DashboardScheduleHub({ tasks, sprints }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [monthOffset, setMonthOffset] = useState<number>(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [defaultCat, setDefaultCat] = useState<string>('SCHEDULE');
  const [selectedStartISO, setSelectedStartISO] = useState<string>('');
  const [selectedEndISO, setSelectedEndISO] = useState<string>('');

  const [importing, setImporting] = useState(false);
  const [importFeedback, setImportFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const toLocalISO = (d: Date) =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const openAddForm = (cat: string = 'SCHEDULE', targetDate?: Date) => {
    const base = targetDate ? new Date(targetDate) : new Date();
    if (targetDate) {
      base.setHours(8, 0, 0, 0);
    }
    const end = new Date(base.getTime() + 2 * 3600000);
    setEditingTask(null);
    setDefaultCat(cat);
    setSelectedStartISO(toLocalISO(base));
    setSelectedEndISO(toLocalISO(end));
    setShowAddModal(true);
  };

  const openEditTaskForm = (task: any) => {
    setEditingTask(task);
    setDefaultCat(task.category || 'SCHEDULE');
    setSelectedStartISO(task.startTime ? toLocalISO(new Date(task.startTime)) : toLocalISO(new Date(task.deadline)));
    setSelectedEndISO(toLocalISO(new Date(task.deadline)));
    setShowAddModal(true);
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      if (editingTask) {
        await updateTask(editingTask.id, fd);
      } else {
        await addTask(fd);
      }
      setEditingTask(null);
      setShowAddModal(false);
    });
  };

  const handleScheduleFileUpload = async (file: File | null) => {
    if (!file) return;
    setImporting(true);
    setImportFeedback(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/schedule/import', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setImportFeedback({
          ok: false,
          text: data.error || 'Không thể đọc file lịch trình.',
        });
      } else {
        setImportFeedback({
          ok: true,
          text: data.message,
        });
        router.refresh();
      }
    } catch (err: any) {
      setImportFeedback({
        ok: false,
        text: err?.message || 'Lỗi kết nối khi tải file lịch.',
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // -- Date Helpers --
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);
  const dow = startOfWeek.getDay();
  const diffToMon = startOfWeek.getDate() - dow + (dow === 0 ? -6 : 1) + weekOffset * 7;
  startOfWeek.setDate(diffToMon);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  // Month Grid calculation
  const currentMonthDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthStartDay = currentMonthDate.getDay(); // 0=Sun..6=Sat
  const monthGridStart = new Date(currentMonthDate);
  monthGridStart.setDate(1 - (monthStartDay === 0 ? 6 : monthStartDay - 1));
  const monthCells = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(monthGridStart);
    d.setDate(monthGridStart.getDate() + i);
    return d;
  });

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const isDateInRange = (date: Date, startRaw: Date | string, endRaw: Date | string) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    const s = new Date(startRaw);
    const e = new Date(endRaw);
    return s <= dayEnd && e >= dayStart;
  };

  const getEventsForDate = (date: Date) => {
    return tasks
      .filter(t => {
        if (!matchesCategoryFilter(t.category, activeFilter)) return false;
        const start = t.startTime ? new Date(t.startTime) : new Date(t.deadline);
        const end = new Date(t.deadline);
        return isSameDay(start, date) || isSameDay(end, date) || isDateInRange(date, start, end);
      })
      .sort((a, b) => new Date(a.startTime || a.deadline).getTime() - new Date(b.startTime || b.deadline).getTime());
  };

  const getSprintsForDate = (date: Date) =>
    sprints.filter(s => isDateInRange(date, s.startDate, s.endDate));

  // Filtered groups for column view
  const activeTasks = tasks.filter(t => t.status !== 'DONE');
  const scheduleAndWorkItems = activeTasks.filter(t => normalizeScheduleCategory(t.category) === 'SCHEDULE');
  const appointmentItems = activeTasks.filter(t => normalizeScheduleCategory(t.category) === 'APPOINTMENT');
  const taskDeadlineItems = activeTasks.filter(t => normalizeScheduleCategory(t.category) === 'TASK');

  const dayNamesShort = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '18px',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
    >
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              background: 'rgba(123, 140, 255, 0.12)',
              padding: '10px',
              borderRadius: '12px',
              border: '1px solid rgba(123, 140, 255, 0.28)',
              display: 'flex',
            }}
          >
            <Calendar size={22} color="#7b8cff" />
          </div>
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.18rem', fontWeight: 700 }}>
              Calendar: Thời Khóa Biểu & Lịch Làm Việc • Lịch Hẹn • Sprint
            </h3>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Đồng bộ chung Thời khóa biểu và Lịch làm việc theo cấu trúc Calendar (Tuần / Tháng) và hỗ trợ import trực tiếp từ file lịch (.xlsx, .ics, .csv)
            </p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowImportPanel(prev => !prev)}
            style={{
              background: showImportPanel ? 'rgba(61, 214, 140, 0.18)' : 'rgba(61, 214, 140, 0.1)',
              border: '1px solid rgba(61, 214, 140, 0.35)',
              color: '#3dd68c',
              padding: '8px 13px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Upload size={14} /> Import File Schedule (.xlsx / .ics)
          </button>

          <button
            type="button"
            onClick={() => openAddForm('SCHEDULE')}
            style={{
              background: '#7b8cff',
              border: '1px solid #7b8cff',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={15} /> Thêm Lịch Học / Làm Việc
          </button>

          <button
            type="button"
            onClick={() => openAddForm('APPOINTMENT')}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '8px 13px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={14} /> Thêm Lịch Hẹn
          </button>
        </div>
      </div>

      {/* PANEL IMPORT FILE SCHEDULE VÀO CALENDAR */}
      {showImportPanel && (
        <div
          style={{
            background: 'var(--surface-elevated)',
            border: '1px solid rgba(61, 214, 140, 0.3)',
            borderRadius: '14px',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.92rem' }}>
                Tự động thêm Lịch vào Calendar từ File Schedule (.xlsx, .ics, .csv, .json)
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '2px' }}>
                Hỗ trợ file Excel thời khóa biểu / ca làm theo Thứ (Thứ 2..CN) hoặc ngày cụ thể, và file .ics xuất từ Google Calendar / Apple Calendar / Outlook.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a
                href="/api/schedule/template?format=xlsx"
                download="Mau_Lich_Calendar_GlowUp.xlsx"
                style={{
                  background: 'rgba(123, 140, 255, 0.12)',
                  border: '1px solid rgba(123, 140, 255, 0.3)',
                  color: '#a5b1ff',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Download size={13} /> Tải Mẫu Excel (.xlsx)
              </a>

              <a
                href="/api/schedule/template?format=ics"
                download="Mau_Lich_Calendar_GlowUp.ics"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Download size={13} /> Tải Mẫu iCalendar (.ics)
              </a>

              <button
                type="button"
                onClick={() => setShowImportPanel(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                Thu nhỏ
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.ics,.csv,.tsv,.json"
              onChange={e => handleScheduleFileUpload(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: '#3dd68c',
                color: '#09110d',
                border: 'none',
                padding: '9px 16px',
                borderRadius: '9px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: importing ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Upload size={14} />
              {importing ? 'Đang phân tích & thêm vào Calendar...' : 'Chọn File Schedule để Import ngay'}
            </button>

            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Định dạng nhận diện: .xlsx (Excel), .ics (Google/Apple Calendar), .csv, .json
            </span>
          </div>

          {importFeedback && (
            <div
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: importFeedback.ok ? 'rgba(61, 214, 140, 0.12)' : 'rgba(244, 109, 117, 0.12)',
                border: `1px solid ${importFeedback.ok ? 'rgba(61, 214, 140, 0.35)' : 'rgba(244, 109, 117, 0.35)'}`,
                color: importFeedback.ok ? '#3dd68c' : '#f46d75',
              }}
            >
              {importFeedback.text}
            </div>
          )}
        </div>
      )}

      {/* FORM THÊM LỊCH TRÌNH NHANH */}
      {showAddModal && (
        <form
          onSubmit={handleCreate}
          style={{
            background: 'var(--surface-elevated)',
            border: '1px solid rgba(123, 140, 255, 0.35)',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <select
              name="category"
              value={defaultCat}
              onChange={e => setDefaultCat(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '9px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-color)',
                color: 'var(--text-primary)',
                fontWeight: 600,
              }}
            >
              <option value="SCHEDULE">Thời khóa biểu & Lịch làm việc</option>
              <option value="APPOINTMENT">Lịch hẹn & Sự kiện</option>
              <option value="TASK">Công việc / Deadline</option>
            </select>
            <input
              key={editingTask?.id || 'new-title'}
              name="title"
              defaultValue={editingTask?.title || ''}
              required
              placeholder="Tên môn học / Ca làm việc / Cuộc hẹn..."
              style={{
                padding: '10px 12px',
                borderRadius: '9px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-color)',
                color: 'var(--text-primary)',
              }}
            />
            <input
              key={editingTask?.id ? `${editingTask.id}-loc` : 'new-loc'}
              name="location"
              defaultValue={editingTask?.location || ''}
              placeholder="Phòng học / Văn phòng / Link họp..."
              style={{
                padding: '10px 12px',
                borderRadius: '9px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-color)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Bắt đầu (Ngày & Giờ) *
              </label>
              <input
                name="startTime"
                type="datetime-local"
                required
                value={selectedStartISO}
                onChange={e => setSelectedStartISO(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 11px',
                  borderRadius: '9px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-color)',
                  color: 'var(--text-primary)',
                  colorScheme: 'dark',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Kết thúc (Ngày & Giờ) *
              </label>
              <input
                name="deadline"
                type="datetime-local"
                required
                value={selectedEndISO}
                onChange={e => setSelectedEndISO(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 11px',
                  borderRadius: '9px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-color)',
                  color: 'var(--text-primary)',
                  colorScheme: 'dark',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Mức năng lượng
              </label>
              <select
                name="energyLevel"
                defaultValue="Medium"
                style={{
                  width: '100%',
                  padding: '9px 11px',
                  borderRadius: '9px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-color)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  background: '#7b8cff',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '9px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {editingTask ? 'Lưu chỉnh sửa' : 'Lưu vào Calendar'}
              </button>
              <button
                type="button"
                onClick={() => { setShowAddModal(false); setEditingTask(null); }}
                style={{
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: '9px 13px',
                  borderRadius: '9px',
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TOOLBAR: CHẾ ĐỘ XEM (TUẦN / THÁNG / PHÂN LOẠI) + BỘ LỌC + ĐIỀU HƯỚNG NGÀY */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '10px 14px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
        }}
      >
        {/* View Switcher & Category Filter */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setViewMode('week')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: viewMode === 'week' ? '1px solid #7b8cff' : '1px solid var(--border-color)',
              background: viewMode === 'week' ? 'rgba(123, 140, 255, 0.16)' : 'transparent',
              color: viewMode === 'week' ? '#a5b1ff' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Calendar size={13} /> Lịch Tuần (7 Ngày)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('month')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: viewMode === 'month' ? '1px solid #7b8cff' : '1px solid var(--border-color)',
              background: viewMode === 'month' ? 'rgba(123, 140, 255, 0.16)' : 'transparent',
              color: viewMode === 'month' ? '#a5b1ff' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <LayoutGrid size={13} /> Lịch Tháng
          </button>
          <button
            type="button"
            onClick={() => setViewMode('columns')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: viewMode === 'columns' ? '1px solid #7b8cff' : '1px solid var(--border-color)',
              background: viewMode === 'columns' ? 'rgba(123, 140, 255, 0.16)' : 'transparent',
              color: viewMode === 'columns' ? '#a5b1ff' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Columns size={13} /> Bảng Phân Loại
          </button>

          <span style={{ width: '1px', height: '18px', background: 'var(--border-color)', margin: '0 4px' }} />

          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'SCHEDULE', label: 'Thời khóa biểu & Làm việc' },
            { id: 'APPOINTMENT', label: 'Lịch hẹn' },
            { id: 'TASK', label: 'Task / Deadline' },
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              style={{
                padding: '5px 10px',
                borderRadius: '7px',
                border: activeFilter === f.id ? '1px solid rgba(61, 214, 140, 0.4)' : '1px solid transparent',
                background: activeFilter === f.id ? 'rgba(61, 214, 140, 0.12)' : 'transparent',
                color: activeFilter === f.id ? '#3dd68c' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Date Navigation */}
        {viewMode === 'week' && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setWeekOffset(p => p - 1)}
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '5px 10px',
                borderRadius: '7px',
                fontSize: '0.76rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ChevronLeft size={14} /> Tuần trước
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              style={{
                background: 'rgba(123, 140, 255, 0.12)',
                border: '1px solid rgba(123, 140, 255, 0.3)',
                color: '#a5b1ff',
                padding: '5px 11px',
                borderRadius: '7px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Tuần này ({weekDays[0].getDate()}/{weekDays[0].getMonth() + 1} - {weekDays[6].getDate()}/{weekDays[6].getMonth() + 1})
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset(p => p + 1)}
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '5px 10px',
                borderRadius: '7px',
                fontSize: '0.76rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Tuần sau <ChevronRight size={14} />
            </button>
          </div>
        )}

        {viewMode === 'month' && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setMonthOffset(p => p - 1)}
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '5px 10px',
                borderRadius: '7px',
                fontSize: '0.76rem',
                cursor: 'pointer',
              }}
            >
              ← Tháng trước
            </button>
            <button
              type="button"
              onClick={() => setMonthOffset(0)}
              style={{
                background: 'rgba(123, 140, 255, 0.12)',
                border: '1px solid rgba(123, 140, 255, 0.3)',
                color: '#a5b1ff',
                padding: '5px 11px',
                borderRadius: '7px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Tháng {currentMonthDate.getMonth() + 1}/{currentMonthDate.getFullYear()}
            </button>
            <button
              type="button"
              onClick={() => setMonthOffset(p => p + 1)}
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '5px 10px',
                borderRadius: '7px',
                fontSize: '0.76rem',
                cursor: 'pointer',
              }}
            >
              Tháng sau →
            </button>
          </div>
        )}
      </div>

      {/* 1. VIEW MODE: LỊCH TUẦN 7 NGÀY (WEEKLY CALENDAR GRID - 7 CỘT TRÊN CÙNG 1 HÀNG) */}
      {viewMode === 'week' && (
        <div className="calendar-week-7col">
          {weekDays.map((day, idx) => {
            const isToday = isSameDay(day, today);
            const dayEvents = getEventsForDate(day);
            const daySprints = getSprintsForDate(day);

            return (
              <div
                key={idx}
                style={{
                  background: isToday ? 'rgba(123, 140, 255, 0.05)' : 'var(--bg-color)',
                  border: isToday ? '1px solid rgba(123, 140, 255, 0.4)' : '1px solid var(--border-color)',
                  borderRadius: '13px',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '270px',
                  overflow: 'hidden',
                }}
              >
                {/* Day Header */}
                <div
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid var(--border-color)',
                    background: isToday ? 'rgba(123, 140, 255, 0.12)' : 'rgba(255,255,255,0.015)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: isToday ? '#a5b1ff' : 'var(--text-secondary)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {dayNamesShort[day.getDay()]}
                    </div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {day.getDate()}/{day.getMonth() + 1}
                      {isToday && (
                        <span
                          style={{
                            marginLeft: '6px',
                            fontSize: '0.68rem',
                            padding: '1px 6px',
                            borderRadius: '5px',
                            background: '#7b8cff',
                            color: '#fff',
                          }}
                        >
                          Hôm nay
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openAddForm('SCHEDULE', day)}
                    title="Thêm lịch vào ngày này"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      width: '26px',
                      height: '26px',
                      borderRadius: '7px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Sprints active on this day */}
                {daySprints.length > 0 && (
                  <div style={{ padding: '6px 8px 0 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {daySprints.map(sp => (
                      <div
                        key={sp.id}
                        style={{
                          background: 'rgba(245, 185, 74, 0.12)',
                          border: '1px solid rgba(245, 185, 74, 0.32)',
                          color: '#f5b94a',
                          padding: '3px 7px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={`Sprint: ${sp.name}`}
                      >
                        Sprint: {sp.name}
                      </div>
                    ))}
                  </div>
                )}

                {/* Events inside Day */}
                <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '7px', flex: 1 }}>
                  {dayEvents.length === 0 ? (
                    <div
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.76rem',
                        textAlign: 'center',
                        margin: 'auto 0',
                        padding: '16px 4px',
                      }}
                    >
                      Trống lịch
                    </div>
                  ) : (
                    dayEvents.map(item => {
                      const isDone = item.status === 'DONE';
                      const st = getTaskTimeStatus(item.startTime, item.deadline, item.status);
                      const catMeta = getCategoryMeta(item.category);
                      const startStr = item.startTime
                        ? new Date(item.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                        : '';
                      const endStr = new Date(item.deadline).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <div
                          key={item.id}
                          style={{
                            background: 'var(--surface)',
                            border: `1px solid ${st.borderColor}`,
                            borderLeft: `3px solid ${catMeta.color}`,
                            borderRadius: '8px',
                            padding: '8px 9px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            opacity: isDone ? 0.55 : 1,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: catMeta.color }}>
                              {startStr ? `${startStr} - ${endStr}` : endStr}
                            </span>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                              <button
                                type="button"
                                onClick={() => openEditTaskForm(item)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: 0, cursor: 'pointer' }}
                                title="Sửa lịch"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => startTransition(() => deleteTask(item.id))}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--text-muted)',
                                  padding: 0,
                                  cursor: 'pointer',
                                }}
                                title="Xóa lịch"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() =>
                                startTransition(() => updateTaskStatus(item.id, isDone ? 'TODO' : 'DONE'))
                              }
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                marginTop: '2px',
                                cursor: 'pointer',
                                color: isDone ? '#3dd68c' : st.color,
                                display: 'flex',
                              }}
                            >
                              {isDone ? <CheckCircle size={13} /> : <Circle size={13} />}
                            </button>
                            <span
                              style={{
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                textDecoration: isDone ? 'line-through' : 'none',
                                lineHeight: 1.3,
                                wordBreak: 'break-word',
                              }}
                            >
                              {item.title}
                            </span>
                          </div>

                          {item.location && (
                            <div
                              style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-secondary)',
                                marginLeft: '19px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                            >
                              <MapPin size={10} color="#7b8cff" /> {item.location}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. VIEW MODE: LỊCH THÁNG (MONTHLY CALENDAR GRID) */}
      {viewMode === 'month' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="calendar-week-7col">
            {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'].map(label => (
              <div
                key={label}
                style={{
                  padding: '6px 8px',
                  textAlign: 'center',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '7px',
                }}
              >
                {label}
              </div>
            ))}

            {monthCells.map((cellDate, idx) => {
              const inCurrentMonth = cellDate.getMonth() === currentMonthDate.getMonth();
              const isToday = isSameDay(cellDate, today);
              const cellEvents = getEventsForDate(cellDate);

              return (
                <div
                  key={idx}
                  style={{
                    minHeight: '105px',
                    background: isToday ? 'rgba(123, 140, 255, 0.06)' : 'var(--bg-color)',
                    border: isToday ? '1px solid rgba(123, 140, 255, 0.45)' : '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '7px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    opacity: inCurrentMonth ? 1 : 0.4,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: isToday ? '#a5b1ff' : 'var(--text-secondary)',
                      }}
                    >
                      {cellDate.getDate()}/{cellDate.getMonth() + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => openAddForm('SCHEDULE', cellDate)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      title="Thêm lịch"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto', maxHeight: '76px' }}>
                    {cellEvents.slice(0, 3).map(ev => {
                      const catMeta = getCategoryMeta(ev.category);
                      const timeStr = ev.startTime
                        ? new Date(ev.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                        : '';
                      return (
                        <div
                          key={ev.id}
                          style={{
                            fontSize: '0.68rem',
                            padding: '2px 5px',
                            borderRadius: '5px',
                            background: 'var(--surface)',
                            borderLeft: `2px solid ${catMeta.color}`,
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={`${timeStr ? timeStr + ' - ' : ''}${ev.title}`}
                        >
                          {timeStr ? `${timeStr} ` : ''}
                          {ev.title}
                        </div>
                      );
                    })}
                    {cellEvents.length > 3 && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        +{cellEvents.length - 3} mục khác
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. VIEW MODE: BẢNG PHÂN LOẠI GỘP CHUNG THỜI KHÓA BIỂU & LỊCH LÀM VIỆC */}
      {viewMode === 'columns' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {[
            {
              title: 'Thời Khóa Biểu & Lịch Làm Việc',
              accent: '#7b8cff',
              items: scheduleAndWorkItems,
              emptyText: 'Chưa có thời khóa biểu hoặc ca làm việc nào.',
            },
            {
              title: 'Lịch Hẹn & Sự Kiện',
              accent: '#3dd68c',
              items: appointmentItems,
              emptyText: 'Chưa có lịch hẹn nào.',
            },
            {
              title: 'Công Việc & Deadline',
              accent: '#5b9cff',
              items: taskDeadlineItems,
              emptyText: 'Chưa có task cần xử lý.',
            },
          ].map((col, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-color)',
                border: '1px solid var(--border-color)',
                borderTop: `3px solid ${col.accent}`,
                borderRadius: '14px',
                padding: '15px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.94rem', fontWeight: 700 }}>
                  {col.title}
                </h4>
                <span
                  style={{
                    fontSize: '0.74rem',
                    color: col.accent,
                    background: `${col.accent}1f`,
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontWeight: 700,
                  }}
                >
                  {col.items.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {col.items.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '16px 0', textAlign: 'center' }}>
                    {col.emptyText}
                  </div>
                ) : (
                  col.items.slice(0, 8).map(item => {
                    const st = getTaskTimeStatus(item.startTime, item.deadline, item.status);
                    return (
                      <div
                        key={item.id}
                        style={{
                          background: 'var(--surface)',
                          border: `1px solid ${st.borderColor}`,
                          borderRadius: '10px',
                          padding: '10px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.86rem' }}>
                            <button
                              type="button"
                              onClick={() => startTransition(() => updateTaskStatus(item.id, 'DONE'))}
                              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: st.color, display: 'flex' }}
                            >
                              <Circle size={14} />
                            </button>
                            <span>{item.title}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => openEditTaskForm(item)}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                              title="Sửa"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => startTransition(() => deleteTask(item.id))}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                              title="Xóa"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {item.location && (
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={11} color="#7b8cff" /> {item.location}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: '20px', fontSize: '0.72rem', flexWrap: 'wrap', gap: '4px' }}>
                          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
      )}

      {/* ACTIVE SPRINTS TRÊN CALENDAR */}
      {sprints.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.83rem', fontWeight: 700, color: '#f5b94a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Kanban size={15} /> Sprints Đang Chạy Trên Calendar
            </span>
            <a href="/tasks" style={{ fontSize: '0.78rem', color: '#a5b1ff', textDecoration: 'none', fontWeight: 600 }}>
              Mở trang Quản lý Calendar & Sprint đầy đủ →
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
            {sprints.slice(0, 3).map(sp => {
              const total = sp.tasks?.length || 0;
              const done = sp.tasks?.filter((t: any) => t.status === 'DONE').length || 0;
              const pct = total === 0 ? 0 : Math.round((done / total) * 100);
              return (
                <div
                  key={sp.id}
                  style={{
                    background: 'rgba(245, 185, 74, 0.08)',
                    border: '1px solid rgba(245, 185, 74, 0.25)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem' }}>{sp.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
                      {new Date(sp.startDate).toLocaleDateString('vi-VN')} → {new Date(sp.endDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <span style={{ color: '#f5b94a', fontWeight: 700, fontSize: '0.82rem' }}>
                    {pct}% ({done}/{total})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
