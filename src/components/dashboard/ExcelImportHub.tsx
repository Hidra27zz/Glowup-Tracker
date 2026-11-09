'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const SHEET_DESCRIPTIONS = [
  {
    sheet: '1_Muc_Tieu_SMART',
    icon: '🎯',
    title: 'Mục tiêu SMART',
    cols: 'Tiêu đề • Specific • Measurable • Achievable • Relevant • Time-bound • Hiện tại • Mục tiêu • Đơn vị • Hạn chót',
  },
  {
    sheet: '2_Lich_Trinh_Task',
    icon: '📅',
    title: 'Lịch trình & Task',
    cols: 'Tiêu đề • Phân loại (TIMETABLE / WORK_SCHEDULE / APPOINTMENT / GENERAL) • Giờ bắt đầu • Hạn kết thúc • Địa điểm • Năng lượng • Trạng thái',
  },
  {
    sheet: '3_Tu_Lanh_Dinh_Duong',
    icon: '🥗',
    title: 'Tủ lạnh & Bữa ăn',
    cols: 'Loại (PANTRY / MEAL) • Tên nguyên liệu/Món • Danh mục • Số lượng • Hạn dùng • Calo • Protein • Carbs • Fat',
  },
  {
    sheet: '4_Tai_Chinh',
    icon: '💳',
    title: 'Tài chính Thu/Chi',
    cols: 'Loại (expense / income) • Số tiền (VND) • Danh mục • Ghi chú chi tiết',
  },
  {
    sheet: '5_Suc_Khoe_Tap_Luyen',
    icon: '💪',
    title: 'Chỉ số Cơ thể & Tập luyện',
    cols: 'Loại (BODY / WORKOUT) • Cân nặng • % Mỡ • Ngực • Eo • Hông • Tên bài tập • Nhóm tập • Thời lượng (phút)',
  },
  {
    sheet: '6_Hoc_Tap_Su_Nghiep',
    icon: '🚀',
    title: 'Kỹ năng, Flashcard & Ứng tuyển',
    cols: 'Loại (SKILL / FLASHCARD / JOB) • Tên kỹ năng/Bộ thẻ/Công ty • Danh mục/Mặt trước/Vị trí • Cấp độ/Mặt sau/Trạng thái',
  },
  {
    sheet: '7_CRM_Moi_Quan_He',
    icon: '🤝',
    title: 'CRM & Mối quan hệ',
    cols: 'Họ và tên • Nhóm quan hệ (Mentor / Đồng nghiệp / Bạn bè) • Chu kỳ liên lạc (ngày) • Ghi chú',
  },
];

export default function ExcelImportHub() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setErrorMsg(null);
    setImportResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/excel/import', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Lỗi khi import file Excel');
      } else {
        setImportResult(data);
        router.refresh();
      }
    } catch {
      setErrorMsg('Không thể kết nối máy chủ để import.');
    } finally {
      setUploading(false);
    }
  };

  const handleLoadSampleData = async () => {
    setUploading(true);
    setErrorMsg(null);
    setImportResult(null);
    try {
      const res = await fetch('/api/excel/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useTemplateSample: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Lỗi khi nạp dữ liệu mẫu');
      } else {
        setImportResult(data);
        router.refresh();
      }
    } catch {
      setErrorMsg('Lỗi kết nối khi nạp dữ liệu mẫu.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '18px 22px',
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        borderRadius: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            }}
          >
            📊
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
              Nhập Liệu Hàng Loạt Bằng Excel (7 Sheets Toàn Hệ Thống)
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Tải file Excel mẫu có sẵn 7 Sheet phân theo từng chức năng, điền trên Excel/Google Sheets rồi tải lên 1 lần.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Download 7-Sheet .xlsx Template */}
          <a
            href="/api/excel/template"
            download="GlowUp_OS_Mau_Nhap_Lieu_7_Sheets.xlsx"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.16)',
              border: '1px solid rgba(16, 185, 129, 0.45)',
              color: '#10b981',
              fontWeight: 700,
              fontSize: '0.82rem',
              textDecoration: 'none',
            }}
          >
            📥 Tải File Excel Mẫu (.xlsx)
          </a>

          {/* Upload Edited .xlsx File */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.csv,.tsv"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '9px 16px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: uploading ? 'wait' : 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            }}
          >
            {uploading ? '⏳ Đang xử lý...' : '📤 Import File Excel Lên Hệ Thống'}
          </button>

          <button
            type="button"
            disabled={uploading}
            onClick={handleLoadSampleData}
            title="Nạp thử ngay bộ dữ liệu mẫu của 7 Sheet mà không cần mở Excel"
            style={{
              padding: '9px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              background: 'rgba(139, 92, 246, 0.14)',
              color: '#c4b5fd',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            ⚡ Nạp Nhanh Dữ Liệu Mẫu
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            style={{
              padding: '9px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isExpanded ? 'Ẩn cấu trúc 7 Sheet ▲' : 'Xem cấu trúc 7 Sheet ▼'}
          </button>
        </div>
      </div>

      {/* Expandable 7-Sheet Structure Guide */}
      {isExpanded && (
        <div
          style={{
            marginTop: '16px',
            paddingTop: '14px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '10px',
          }}
        >
          {SHEET_DESCRIPTIONS.map((item) => (
            <div
              key={item.sheet}
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span>{item.icon}</span>
                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fff' }}>{item.title}</span>
                <code
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.68rem',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                  }}
                >
                  {item.sheet}
                </code>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {item.cols}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.14)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}
        >
          ❌ {errorMsg}
        </div>
      )}

      {/* Import Success Summary */}
      {importResult?.stats && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.82rem', color: '#e2e8f0' }}>
            <span style={{ fontWeight: 700, color: '#10b981' }}>✅ Đã import thành công:</span>
            <span>🎯 {importResult.stats.smartGoals} Mục tiêu SMART</span>
            <span>📅 {importResult.stats.tasks} Lịch trình/Task</span>
            <span>🧊 {importResult.stats.pantryItems} Nguyên liệu tủ lạnh</span>
            <span>🥗 {importResult.stats.meals} Bữa ăn</span>
            <span>💳 {importResult.stats.transactions} Giao dịch tài chính</span>
            <span>💪 {importResult.stats.healthLogs} Bản ghi sức khỏe</span>
            <span>🚀 {importResult.stats.careerItems} Mục học tập/sự nghiệp</span>
            <span>🤝 {importResult.stats.crmContacts} Liên hệ CRM</span>
          </div>
          <button
            onClick={() => setImportResult(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.75rem',
            }}
          >
            Đóng ✕
          </button>
        </div>
      )}
    </div>
  );
}
