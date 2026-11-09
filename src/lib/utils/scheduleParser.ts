import { SheetData, generateXlsxBuffer, parseXlsxOrCsvBuffer } from './excelWorkbook';

export interface ParsedScheduleEvent {
  title: string;
  category: 'SCHEDULE' | 'APPOINTMENT' | 'TASK';
  startTime: Date;
  endTime: Date;
  location?: string;
  description?: string;
  energyLevel?: 'Low' | 'Medium' | 'High';
}

export interface ParsedSprintItem {
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface ParsedScheduleResult {
  events: ParsedScheduleEvent[];
  sprints: ParsedSprintItem[];
}

function fmtDateYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getMondayOfCurrentWeek(ref: Date = new Date()): Date {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun, 1=Mon
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

export function buildScheduleTemplateSheets(refDate: Date = new Date()): SheetData[] {
  const mon = getMondayOfCurrentWeek(refDate);
  const tue = new Date(mon);
  tue.setDate(mon.getDate() + 1);
  const wed = new Date(mon);
  wed.setDate(mon.getDate() + 2);
  const thu = new Date(mon);
  thu.setDate(mon.getDate() + 3);
  const fri = new Date(mon);
  fri.setDate(mon.getDate() + 4);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);

  return [
    {
      name: '1_Lich_Hoc_Lam_Viec_Calendar',
      headers: [
        'Tiêu đề (Môn học / Ca làm / Lịch hẹn)',
        'Phân loại (SCHEDULE / APPOINTMENT / TASK)',
        'Thứ hoặc Ngày (Thứ 2..CN hoặc YYYY-MM-DD)',
        'Giờ bắt đầu (HH:mm)',
        'Giờ kết thúc (HH:mm)',
        'Số tuần lặp lại (1-16)',
        'Phòng / Địa điểm / Link',
        'Ghi chú chi tiết',
        'Năng lượng (High/Medium/Low)',
      ],
      rows: [
        [
          'Chuyên đề Kỹ năng & Ngoại ngữ',
          'SCHEDULE',
          'Thứ 2',
          '08:00',
          '10:30',
          2,
          'Phòng A204',
          'Thời khóa biểu cố định sáng thứ 2',
          'High',
        ],
        [
          'Ca làm việc chiều / Deep Work Dự án',
          'SCHEDULE',
          'Thứ 2',
          '13:30',
          '17:30',
          2,
          'Văn phòng Tầng 5',
          'Lịch làm việc cố định',
          'High',
        ],
        [
          'Họp đồng bộ tiến độ tuần (Weekly Sync)',
          'APPOINTMENT',
          fmtDateYMD(wed),
          '10:00',
          '11:15',
          1,
          'Google Meet',
          'Review KPI & phân bổ công việc',
          'Medium',
        ],
        [
          'Lớp thực hành / Ca làm việc Thứ 5',
          'SCHEDULE',
          'Thứ 5',
          '09:00',
          '11:30',
          2,
          'Phòng Lab B102',
          'Mang theo laptop cá nhân',
          'High',
        ],
        [
          'Hoàn thiện báo cáo & bàn giao tuần',
          'TASK',
          fmtDateYMD(fri),
          '14:00',
          '17:00',
          1,
          'Tại nhà / Văn phòng',
          'Gửi trước 17:00 chiều thứ 6',
          'Medium',
        ],
      ],
    },
    {
      name: '2_Sprint_Ke_Hoach',
      headers: [
        'Tên Sprint / Giai đoạn',
        'Ngày bắt đầu (YYYY-MM-DD HH:mm)',
        'Ngày kết thúc (YYYY-MM-DD HH:mm)',
      ],
      rows: [
        [
          'Sprint Tuần Này: Tối ưu hiệu suất & Học tập',
          `${fmtDateYMD(mon)} 08:00`,
          `${fmtDateYMD(sun)} 22:00`,
        ],
      ],
    },
  ];
}

export function buildScheduleTemplateBuffer(refDate: Date = new Date()): Buffer {
  return generateXlsxBuffer(buildScheduleTemplateSheets(refDate));
}

export function buildSampleIcsContent(refDate: Date = new Date()): string {
  const mon = getMondayOfCurrentWeek(refDate);
  const wed = new Date(mon);
  wed.setDate(mon.getDate() + 2);

  const fmtIcsLocal = (d: Date, hh: number, mm: number) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(hh).padStart(2, '0');
    const min = String(mm).padStart(2, '0');
    return `${y}${m}${day}T${h}${min}00`;
  };

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GlowUp OS//Unified Calendar//VI',
    'BEGIN:VEVENT',
    `DTSTART:${fmtIcsLocal(mon, 8, 0)}`,
    `DTEND:${fmtIcsLocal(mon, 10, 30)}`,
    'SUMMARY:Lịch học & Làm việc sáng Thứ 2',
    'LOCATION:Phòng A204 / Văn phòng',
    'DESCRIPTION:Thời khóa biểu và lịch làm việc đồng bộ trên Calendar',
    'CATEGORIES:SCHEDULE',
    'END:VEVENT',
    'BEGIN:VEVENT',
    `DTSTART:${fmtIcsLocal(wed, 14, 0)}`,
    `DTEND:${fmtIcsLocal(wed, 16, 0)}`,
    'SUMMARY:Họp Review Dự Án & Lịch Hẹn',
    'LOCATION:Google Meet',
    'DESCRIPTION:Lịch hẹn quan trọng trong tuần',
    'CATEGORIES:APPOINTMENT',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

// Map Vietnamese / English day-of-week strings to offset from Monday (0 = Mon ... 6 = Sun)
function parseDayOfWeekOffset(raw: string): number | null {
  const s = raw.toLowerCase().trim();
  if (!s) return null;
  if (s === 'thứ 2' || s === 'thu 2' || s === 't2' || s === 'monday' || s === 'mon' || s === 'thứ hai') return 0;
  if (s === 'thứ 3' || s === 'thu 3' || s === 't3' || s === 'tuesday' || s === 'tue' || s === 'thứ ba') return 1;
  if (s === 'thứ 4' || s === 'thu 4' || s === 't4' || s === 'wednesday' || s === 'wed' || s === 'thứ tư') return 2;
  if (s === 'thứ 5' || s === 'thu 5' || s === 't5' || s === 'thursday' || s === 'thu' || s === 'thứ năm') return 3;
  if (s === 'thứ 6' || s === 'thu 6' || s === 't6' || s === 'friday' || s === 'fri' || s === 'thứ sáu') return 4;
  if (s === 'thứ 7' || s === 'thu 7' || s === 't7' || s === 'saturday' || s === 'sat' || s === 'thứ bảy') return 5;
  if (s === 'chủ nhật' || s === 'chu nhat' || s === 'cn' || s === 'sunday' || s === 'sun') return 6;
  return null;
}

function parseTimeHM(raw: string, fallbackH = 8, fallbackM = 0): { h: number; m: number } {
  if (!raw) return { h: fallbackH, m: fallbackM };
  const s = raw.trim();
  // Match HH:mm or HhMM
  const m = s.match(/(\d{1,2})[:hH](\d{1,2})?/);
  if (m) {
    const hh = Math.min(23, Math.max(0, parseInt(m[1], 10)));
    const mm = m[2] ? Math.min(59, Math.max(0, parseInt(m[2], 10))) : 0;
    return { h: hh, m: mm };
  }
  // Excel fractional day number (e.g. 0.333333 -> 08:00)
  const num = Number(s);
  if (!Number.isNaN(num) && num >= 0 && num < 1) {
    const totalMinutes = Math.round(num * 24 * 60);
    return { h: Math.floor(totalMinutes / 60) % 24, m: totalMinutes % 60 };
  }
  return { h: fallbackH, m: fallbackM };
}

function parseFlexibleDate(raw: string, refMonday: Date): Date | null {
  if (!raw) return null;
  const s = raw.trim();
  const dow = parseDayOfWeekOffset(s);
  if (dow !== null) {
    const d = new Date(refMonday);
    d.setDate(refMonday.getDate() + dow);
    return d;
  }
  // DD/MM/YYYY
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const month = parseInt(dmy[2], 10) - 1;
    const year = parseInt(dmy[3], 10);
    const hh = dmy[4] ? parseInt(dmy[4], 10) : 0;
    const mm = dmy[5] ? parseInt(dmy[5], 10) : 0;
    return new Date(year, month, day, hh, mm, 0);
  }
  // YYYY-MM-DD [HH:mm]
  const ymd = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2}))?/);
  if (ymd) {
    const year = parseInt(ymd[1], 10);
    const month = parseInt(ymd[2], 10) - 1;
    const day = parseInt(ymd[3], 10);
    const hh = ymd[4] ? parseInt(ymd[4], 10) : 0;
    const mm = ymd[5] ? parseInt(ymd[5], 10) : 0;
    return new Date(year, month, day, hh, mm, 0);
  }
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  return null;
}

function normalizeCategoryInput(raw?: string): 'SCHEDULE' | 'APPOINTMENT' | 'TASK' {
  if (!raw) return 'SCHEDULE';
  const u = raw.toUpperCase().trim();
  if (
    u.includes('APPOINTMENT') ||
    u.includes('HẸN') ||
    u.includes('HEN') ||
    u.includes('MEETING') ||
    u.includes('EVENT') ||
    u.includes('SỰ KIỆN')
  ) {
    return 'APPOINTMENT';
  }
  if (u === 'TASK' || u === 'GENERAL' || u.includes('DEADLINE') || u.includes('CÔNG VIỆC')) {
    return 'TASK';
  }
  return 'SCHEDULE';
}

function normalizeEnergyInput(raw?: string): 'Low' | 'Medium' | 'High' {
  if (!raw) return 'Medium';
  const u = raw.toUpperCase().trim();
  if (u.startsWith('H') || u.includes('CAO')) return 'High';
  if (u.startsWith('L') || u.includes('THẤP')) return 'Low';
  return 'Medium';
}

function parseIcsDateTime(rawVal: string): Date | null {
  const clean = rawVal.trim();
  const m = clean.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?/);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const month = parseInt(m[2], 10) - 1;
  const day = parseInt(m[3], 10);
  const hh = m[4] ? parseInt(m[4], 10) : 8;
  const mm = m[5] ? parseInt(m[5], 10) : 0;
  const ss = m[6] ? parseInt(m[6], 10) : 0;
  if (m[7] === 'Z') {
    return new Date(Date.UTC(year, month, day, hh, mm, ss));
  }
  return new Date(year, month, day, hh, mm, ss);
}

export function parseIcsSchedule(icsText: string): ParsedScheduleResult {
  const events: ParsedScheduleEvent[] = [];
  const sprints: ParsedSprintItem[] = [];

  // Unfold RFC 5545 folded lines
  const unfolded = icsText.replace(/\r?\n[ \t]/g, '');
  const veventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/gi;
  let match: RegExpExecArray | null;

  while ((match = veventRegex.exec(unfolded)) !== null) {
    const block = match[1];
    const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let summary = '';
    let dtStart: Date | null = null;
    let dtEnd: Date | null = null;
    let location = '';
    let description = '';
    let categories = '';
    let rruleCount = 1;

    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;
      const keyPart = line.slice(0, colonIdx).toUpperCase();
      const valPart = line
        .slice(colonIdx + 1)
        .replace(/\\n/g, ' ')
        .replace(/\\,/g, ',')
        .replace(/\\;/g, ';')
        .trim();

      if (keyPart.startsWith('SUMMARY')) summary = valPart;
      else if (keyPart.startsWith('DTSTART')) dtStart = parseIcsDateTime(valPart);
      else if (keyPart.startsWith('DTEND')) dtEnd = parseIcsDateTime(valPart);
      else if (keyPart.startsWith('LOCATION')) location = valPart;
      else if (keyPart.startsWith('DESCRIPTION')) description = valPart;
      else if (keyPart.startsWith('CATEGORIES')) categories = valPart;
      else if (keyPart.startsWith('RRULE')) {
        const countMatch = valPart.match(/COUNT=(\d+)/i);
        if (countMatch) {
          rruleCount = Math.min(16, Math.max(1, parseInt(countMatch[1], 10)));
        } else if (/FREQ=WEEKLY/i.test(valPart)) {
          rruleCount = 4;
        }
      }
    }

    if (!summary || !dtStart) continue;
    if (!dtEnd || dtEnd <= dtStart) {
      dtEnd = new Date(dtStart.getTime() + 2 * 3600000);
    }

    const durationDays = (dtEnd.getTime() - dtStart.getTime()) / (24 * 3600000);
    if (categories.toUpperCase().includes('SPRINT') || summary.toUpperCase().includes('SPRINT') || durationDays >= 3) {
      sprints.push({
        name: summary,
        startDate: dtStart,
        endDate: dtEnd,
      });
      continue;
    }

    const cat = normalizeCategoryInput(categories);
    for (let w = 0; w < rruleCount; w++) {
      const st = new Date(dtStart.getTime() + w * 7 * 86400000);
      const en = new Date(dtEnd.getTime() + w * 7 * 86400000);
      events.push({
        title: summary,
        category: cat,
        startTime: st,
        endTime: en,
        location: location || undefined,
        description: description || undefined,
        energyLevel: 'Medium',
      });
    }
  }

  return { events, sprints };
}

export function parseScheduleFileBuffer(buf: Buffer, fileName: string, refDate: Date = new Date()): ParsedScheduleResult {
  const lower = (fileName || '').toLowerCase();
  const refMonday = getMondayOfCurrentWeek(refDate);

  // 1. iCalendar (.ics)
  if (lower.endsWith('.ics') || buf.subarray(0, 64).toString('utf8').includes('BEGIN:VCALENDAR')) {
    return parseIcsSchedule(buf.toString('utf8'));
  }

  // 2. JSON (.json)
  if (lower.endsWith('.json')) {
    try {
      const parsed = JSON.parse(buf.toString('utf8'));
      const list = Array.isArray(parsed) ? parsed : parsed.events || parsed.schedule || [];
      const events: ParsedScheduleEvent[] = [];
      const sprints: ParsedSprintItem[] = [];
      for (const item of list) {
        const title = String(item.title || item.name || item.summary || '').trim();
        if (!title) continue;
        const st = parseFlexibleDate(String(item.startTime || item.start || item.date || ''), refMonday) || new Date();
        const en =
          parseFlexibleDate(String(item.endTime || item.end || item.deadline || ''), refMonday) ||
          new Date(st.getTime() + 2 * 3600000);
        if (String(item.type || item.category || '').toUpperCase() === 'SPRINT') {
          sprints.push({ name: title, startDate: st, endDate: en });
        } else {
          events.push({
            title,
            category: normalizeCategoryInput(item.category || item.type),
            startTime: st,
            endTime: en,
            location: item.location || item.room || undefined,
            description: item.description || item.note || undefined,
            energyLevel: normalizeEnergyInput(item.energyLevel),
          });
        }
      }
      return { events, sprints };
    } catch {
      return { events: [], sprints: [] };
    }
  }

  // 3. Excel (.xlsx) or CSV/TSV (.csv / .txt)
  const sheets = parseXlsxOrCsvBuffer(buf, fileName);
  const events: ParsedScheduleEvent[] = [];
  const sprints: ParsedSprintItem[] = [];

  for (const sheet of sheets) {
    const sName = sheet.name.toLowerCase();

    // Check if Sprint sheet
    if (sName.includes('sprint') || (sheet.headers[0] || '').toLowerCase().includes('sprint')) {
      for (const row of sheet.rows) {
        const name = String(row[0] || '').trim();
        if (!name) continue;
        const st = parseFlexibleDate(String(row[1] || ''), refMonday) || refMonday;
        const en =
          parseFlexibleDate(String(row[2] || ''), refMonday) ||
          new Date(st.getTime() + 7 * 86400000);
        sprints.push({ name, startDate: st, endDate: en });
      }
      continue;
    }

    // Standard Schedule / Timetable / Task sheet
    // Detect format:
    // Format A (9-col schedule template):
    // [0] Tiêu đề, [1] Phân loại, [2] Thứ hoặc Ngày, [3] Giờ bắt đầu, [4] Giờ kết thúc, [5] Số tuần lặp lại, [6] Địa điểm, [7] Ghi chú, [8] Năng lượng
    // Format B (7-col general template `2_Lich_Trinh_Task`):
    // [0] Tiêu đề, [1] Phân loại, [2] Giờ bắt đầu (YYYY-MM-DD HH:mm), [3] Hạn kết thúc (YYYY-MM-DD HH:mm), [4] Địa điểm, [5] Năng lượng, [6] Trạng thái
    const h2 = String(sheet.headers[2] || '').toLowerCase();
    const h3 = String(sheet.headers[3] || '').toLowerCase();
    const isDayPlusTimeFormat =
      h2.includes('thứ') ||
      h2.includes('ngày') ||
      h3.includes('giờ bắt đầu') ||
      sheet.headers.length >= 8;

    for (const row of sheet.rows) {
      const title = String(row[0] || '').trim();
      if (!title) continue;
      const rawCat = String(row[1] || 'SCHEDULE').trim();

      if (rawCat.toUpperCase() === 'SPRINT') {
        const st = parseFlexibleDate(String(row[2] || ''), refMonday) || refMonday;
        const en = parseFlexibleDate(String(row[3] || ''), refMonday) || new Date(st.getTime() + 7 * 86400000);
        sprints.push({ name: title, startDate: st, endDate: en });
        continue;
      }

      const category = normalizeCategoryInput(rawCat);

      // Check if row[2] is a Day-of-week or Date without time and row[3]/row[4] are HH:mm
      const col2 = String(row[2] || '').trim();
      const col3 = String(row[3] || '').trim();
      const col4 = String(row[4] || '').trim();
      const looksLikeTimeOnly = /^\d{1,2}[:hH]\d{0,2}$/.test(col3) || (!Number.isNaN(Number(col3)) && Number(col3) < 1);

      if (isDayPlusTimeFormat || parseDayOfWeekOffset(col2) !== null || looksLikeTimeOnly) {
        const baseDate = parseFlexibleDate(col2, refMonday) || refMonday;
        const startHM = parseTimeHM(col3, 8, 0);
        const endHM = parseTimeHM(col4, Math.min(23, startHM.h + 2), startHM.m);
        const repeatWeeks = Math.min(16, Math.max(1, parseInt(String(row[5] || '1'), 10) || 1));
        const location = String(row[6] || '').trim();
        const description = String(row[7] || '').trim();
        const energyLevel = normalizeEnergyInput(String(row[8] || 'Medium'));

        for (let w = 0; w < repeatWeeks; w++) {
          const st = new Date(baseDate);
          st.setDate(baseDate.getDate() + w * 7);
          st.setHours(startHM.h, startHM.m, 0, 0);

          const en = new Date(baseDate);
          en.setDate(baseDate.getDate() + w * 7);
          en.setHours(endHM.h, endHM.m, 0, 0);
          if (en <= st) {
            en.setTime(st.getTime() + 90 * 60000);
          }

          events.push({
            title,
            category,
            startTime: st,
            endTime: en,
            location: location || undefined,
            description: description || undefined,
            energyLevel,
          });
        }
      } else {
        // Full datetime in col2 & col3
        const st = parseFlexibleDate(col2, refMonday) || new Date();
        const en = parseFlexibleDate(col3, refMonday) || new Date(st.getTime() + 2 * 3600000);
        const location = String(row[4] || '').trim();
        const energyLevel = normalizeEnergyInput(String(row[5] || 'Medium'));
        events.push({
          title,
          category,
          startTime: st,
          endTime: en <= st ? new Date(st.getTime() + 90 * 60000) : en,
          location: location || undefined,
          energyLevel,
        });
      }
    }
  }

  return { events, sprints };
}
