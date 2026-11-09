export type TaskTimeState = 'DONE' | 'OVERDUE' | 'WARNING' | 'ACTIVE' | 'UPCOMING';

export interface TimeStatusInfo {
  state: TaskTimeState;
  badgeText: string;
  detailText: string;
  color: string;
  bgColor: string;
  borderColor: string;
  isOverdue: boolean;
  isWarning: boolean;
  overdueDurationText?: string;
}

export function formatDateTimeRange(startTime?: Date | string | null, endTime?: Date | string | null): string {
  if (!endTime) return '';
  const end = new Date(endTime);
  const start = startTime ? new Date(startTime) : null;

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  const fmtDate = (d: Date) =>
    d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (!start || isNaN(start.getTime())) {
    return `${fmtTime(end)} ${fmtDate(end)}`;
  }

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    return `${fmtTime(start)} - ${fmtTime(end)} (${fmtDate(end)})`;
  }

  return `${fmtTime(start)} ${fmtDate(start)} → ${fmtTime(end)} ${fmtDate(end)}`;
}

export function formatDurationDiff(ms: number): string {
  const absMs = Math.abs(ms);
  const totalMinutes = Math.max(1, Math.floor(absMs / (1000 * 60)));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return hours > 0 ? `${days} ngày ${hours} giờ` : `${days} ngày`;
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`;
  }
  return `${minutes} phút`;
}

export function getTaskTimeStatus(
  startTime: Date | string | null | undefined,
  deadline: Date | string,
  status: string,
  now: Date = new Date()
): TimeStatusInfo {
  if (status === 'DONE') {
    return {
      state: 'DONE',
      badgeText: 'Đã hoàn thành',
      detailText: formatDateTimeRange(startTime, deadline),
      color: '#3dd68c',
      bgColor: 'rgba(61, 214, 140,0.12)',
      borderColor: 'rgba(61, 214, 140,0.35)',
      isOverdue: false,
      isWarning: false,
    };
  }

  const end = new Date(deadline);
  const start = startTime ? new Date(startTime) : end;
  const diffToEnd = end.getTime() - now.getTime();
  const diffToStart = start.getTime() - now.getTime();

  // 1. OVERDUE: Đã quá hạn kết thúc -> Báo cáo trễ hạn chứ không hiện số âm (-3)
  if (diffToEnd < 0) {
    const overdueDuration = formatDurationDiff(diffToEnd);
    return {
      state: 'OVERDUE',
      badgeText: `BÁO CÁO TRỄ: Quá hạn ${overdueDuration}`,
      detailText: formatDateTimeRange(startTime, deadline),
      color: '#f46d75',
      bgColor: 'rgba(244, 109, 117,0.15)',
      borderColor: 'rgba(244, 109, 117,0.45)',
      isOverdue: true,
      isWarning: false,
      overdueDurationText: overdueDuration,
    };
  }

  // 2. WARNING: Sắp đến hạn (<= 24 giờ) hoặc sắp tới giờ bắt đầu (<= 2 giờ)
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  const TWO_HOURS = 2 * 60 * 60 * 1000;

  if (diffToEnd <= TWENTY_FOUR_HOURS) {
    const remaining = formatDurationDiff(diffToEnd);
    return {
      state: 'WARNING',
      badgeText: `Sắp tới hạn (còn ${remaining})`,
      detailText: formatDateTimeRange(startTime, deadline),
      color: '#f5b94a',
      bgColor: 'rgba(245, 185, 74,0.15)',
      borderColor: 'rgba(245, 185, 74,0.45)',
      isOverdue: false,
      isWarning: true,
    };
  }

  if (diffToStart > 0 && diffToStart <= TWO_HOURS) {
    const untilStart = formatDurationDiff(diffToStart);
    return {
      state: 'WARNING',
      badgeText: `Sắp bắt đầu sau ${untilStart}`,
      detailText: formatDateTimeRange(startTime, deadline),
      color: '#f5b94a',
      bgColor: 'rgba(245, 185, 74,0.15)',
      borderColor: 'rgba(245, 185, 74,0.45)',
      isOverdue: false,
      isWarning: true,
    };
  }

  // 3. ACTIVE: Đang trong khoảng thời gian từ startTime -> deadline
  if (diffToStart <= 0 && diffToEnd > 0) {
    const remaining = formatDurationDiff(diffToEnd);
    return {
      state: 'ACTIVE',
      badgeText: `Đang diễn ra • Còn ${remaining}`,
      detailText: formatDateTimeRange(startTime, deadline),
      color: '#6cc4ff',
      bgColor: 'rgba(108, 196, 255,0.12)',
      borderColor: 'rgba(108, 196, 255,0.35)',
      isOverdue: false,
      isWarning: false,
    };
  }

  // 4. UPCOMING: Còn xa
  const remaining = formatDurationDiff(diffToEnd);
  return {
    state: 'UPCOMING',
    badgeText: `Còn ${remaining}`,
    detailText: formatDateTimeRange(startTime, deadline),
    color: '#94a3b8',
    bgColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.12)',
    isOverdue: false,
    isWarning: false,
  };
}

export const TASK_CATEGORIES = [
  { id: 'SCHEDULE', label: 'Thời khóa biểu & Làm việc', color: '#7b8cff', icon: '' },
  { id: 'APPOINTMENT', label: 'Lịch hẹn & Sự kiện', color: '#3dd68c', icon: '' },
  { id: 'TASK', label: 'Công việc / Deadline', color: '#5b9cff', icon: '' },
] as const;

export function normalizeScheduleCategory(category?: string | null): 'SCHEDULE' | 'APPOINTMENT' | 'TASK' {
  if (!category) return 'TASK';
  const upper = category.toUpperCase().trim();
  if (upper === 'TIMETABLE' || upper === 'WORK_SCHEDULE' || upper === 'SCHEDULE') {
    return 'SCHEDULE';
  }
  if (upper === 'APPOINTMENT') {
    return 'APPOINTMENT';
  }
  return 'TASK';
}

export function matchesCategoryFilter(taskCategory?: string | null, filter?: string): boolean {
  if (!filter || filter === 'ALL') return true;
  return normalizeScheduleCategory(taskCategory) === normalizeScheduleCategory(filter);
}

export function getCategoryMeta(category?: string | null) {
  const norm = normalizeScheduleCategory(category);
  return TASK_CATEGORIES.find(c => c.id === norm) || TASK_CATEGORIES[0];
}
