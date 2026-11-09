'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const SHEETS = [
  { sheet: '1_Muc_Tieu_SMART', title: 'Mục tiêu SMART', cols: 'Tiêu đề, Specific, Measurable, Achievable, Relevant, Phân loại, Hiện tại, Mục tiêu, Đơn vị, Hạn chót' },
  { sheet: '2_Lich_Trinh_Task', title: 'Lịch trình và công việc', cols: 'Tiêu đề, Phân loại (TIMETABLE / WORK_SCHEDULE / APPOINTMENT / GENERAL), Giờ bắt đầu, Hạn kết thúc, Địa điểm, Năng lượng, Trạng thái' },
  { sheet: '3_Tu_Lanh_Dinh_Duong', title: 'Tủ lạnh và bữa ăn', cols: 'Loại (PANTRY / MEAL), Tên, Danh mục, Số lượng, Hạn dùng, Calo, Protein, Carbs, Fat' },
  { sheet: '4_Tai_Chinh', title: 'Tài chính', cols: 'Loại (expense / income), Số tiền, Danh mục, Ghi chú' },
  { sheet: '5_Suc_Khoe_Tap_Luyen', title: 'Sức khỏe và tập luyện', cols: 'Loại (BODY / WORKOUT), Cân nặng, % mỡ, Ngực, Eo, Hông, Tên bài tập, Nhóm tập, Thời lượng' },
  { sheet: '6_Hoc_Tap_Su_Nghiep', title: 'Học tập và sự nghiệp', cols: 'Loại (SKILL / FLASHCARD / JOB), Tên, Danh mục / Mặt trước, Cấp độ / Mặt sau, Ghi chú' },
  { sheet: '7_CRM_Moi_Quan_He', title: 'Mối quan hệ', cols: 'Họ tên, Nhóm quan hệ, Chu kỳ liên lạc, Ghi chú' },
];

const STAT_LABELS: Record<string, string> = {
  smartGoals: 'mục tiêu',
  tasks: 'lịch/việc',
  pantryItems: 'nguyên liệu',
  meals: 'bữa ăn',
  transactions: 'giao dịch',
  healthLogs: 'bản ghi sức khỏe',
  careerItems: 'mục học tập',
  crmContacts: 'liên hệ',
};

export default function ExcelImportHub() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const send = async (init: RequestInit) => {
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/excel/import', init);
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Không thể import dữ liệu.');
      else {
        setResult(data);
        router.refresh();
      }
    } catch {
      setError('Không thể kết nối máy chủ.');
    } finally {
      setUploading(false);
    }
  };

  const upload = (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    send({ method: 'POST', body: fd });
  };

  const loadSample = () =>
    send({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ useTemplateSample: true }),
    });

  return (
    <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Nhập dữ liệu từ Excel</h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.84rem' }}>
            Tải file mẫu 7 sheet, điền dữ liệu rồi tải lên một lần.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <a href="/api/excel/template" download="GlowUp_OS_Mau_Nhap_Lieu_7_Sheets.xlsx" className="btn">
            Tải file mẫu
          </a>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.csv,.tsv"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = '';
            }}
          />
          <button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()} className="btn btn-primary">
            {uploading ? 'Đang xử lý...' : 'Tải file lên'}
          </button>
          <button type="button" disabled={uploading} onClick={loadSample} className="btn">
            Nạp dữ liệu mẫu
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          alignSelf: 'flex-start',
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          fontSize: '0.8rem',
          cursor: 'pointer',
          padding: 0,
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
        }}
      >
        {open ? 'Ẩn cấu trúc các sheet' : 'Xem cấu trúc các sheet'}
      </button>

      {open && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
          {SHEETS.map((s) => (
            <div key={s.sheet} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{s.title}</div>
              <code style={{ fontSize: '0.72rem', color: 'var(--accent-color)' }}>{s.sheet}</code>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>{s.cols}</div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ borderLeft: '3px solid var(--danger-color)', background: 'var(--surface-2)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.84rem' }}>
          {error}
        </div>
      )}

      {result?.stats && (
        <div style={{ borderLeft: '3px solid var(--success-color)', background: 'var(--surface-2)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.84rem' }}>
          <strong style={{ color: 'var(--success-color)' }}>Đã import: </strong>
          {Object.entries(result.stats)
            .filter(([, v]) => Number(v) > 0)
            .map(([k, v]) => `${v} ${STAT_LABELS[k] || k}`)
            .join(' · ') || 'không có dòng dữ liệu hợp lệ'}
        </div>
      )}
    </section>
  );
}
