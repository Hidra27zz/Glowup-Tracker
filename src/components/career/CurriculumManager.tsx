'use client';

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';

const COLORS = ['#3dd68c', '#6cc4ff', '#7b8cff', '#f5b94a', '#ec4899', '#f46d75', '#14b8a6', '#a78bfa'];

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  zIndex: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
};

const panel: React.CSSProperties = {
  width: '100%',
  maxWidth: '480px',
  maxHeight: '90vh',
  overflowY: 'auto',
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '16px',
  padding: '22px',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

const field: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(0,0,0,0.25)',
  color: '#fff',
  fontSize: '0.88rem',
  outline: 'none',
  fontFamily: 'inherit',
};

const label: React.CSSProperties = { fontSize: '0.76rem', color: '#94a3b8', marginBottom: '5px', display: 'block' };

function Shell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={overlay} onClick={onClose}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.05rem' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: c,
            border: value === c ? '2px solid #fff' : '2px solid transparent',
            cursor: 'pointer',
          }}
        />
      ))}
    </div>
  );
}

function Actions({ busy, submitLabel, onClose }: { busy: boolean; submitLabel: string; onClose: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
      <button
        type="button"
        onClick={onClose}
        style={{ padding: '9px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#cbd5e1', cursor: 'pointer' }}
      >
        Hủy
      </button>
      <button
        type="submit"
        disabled={busy}
        style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#3dd68c', color: '#0f172a', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        {busy && <Loader2 size={14} className="animate-spin" />} {submitLabel}
      </button>
    </div>
  );
}

export interface SubjectFormValues {
  groupId: string;
  newGroupName: string;
  name: string;
  code: string;
  credits: number;
  color: string;
  kind: 'course' | 'self';
}

export function SubjectFormModal({
  mode,
  groups,
  initial,
  defaultGroupId,
  onClose,
  onSubmit,
}: {
  mode: 'create' | 'edit';
  groups: any[];
  initial?: any;
  defaultGroupId?: string;
  onClose: () => void;
  onSubmit: (v: SubjectFormValues) => Promise<void>;
}) {
  const [v, setV] = useState<SubjectFormValues>({
    groupId: initial?.groupId || defaultGroupId || groups[0]?.id || '',
    newGroupName: '',
    name: initial?.name || '',
    code: initial?.code || '',
    credits: initial?.credits ?? 0,
    color: initial?.color || COLORS[0],
    kind: initial ? ((initial.credits ?? 0) > 0 ? 'course' : 'self') : 'self',
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!v.name.trim()) return setErr('Vui lòng nhập tên môn / chủ đề.');
    if (v.groupId === '__new__' && !v.newGroupName.trim()) return setErr('Vui lòng nhập tên nhóm mới.');
    setBusy(true);
    try {
      await onSubmit({ ...v, credits: v.kind === 'self' ? 0 : v.credits });
      onClose();
    } catch (e: any) {
      setErr(e?.message || 'Có lỗi xảy ra.');
      setBusy(false);
    }
  };

  return (
    <Shell title={mode === 'create' ? 'Thêm môn học / chủ đề' : 'Chỉnh sửa môn học'} onClose={onClose}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <span style={label}>Loại</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {([
              { id: 'self', t: 'Tự học / Kỹ năng', d: 'Không cần mã môn, không tín chỉ' },
              { id: 'course', t: 'Môn học chính quy', d: 'Có thể nhập mã môn và tín chỉ' },
            ] as const).map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setV({ ...v, kind: k.id })}
                style={{
                  flex: 1,
                  textAlign: 'left',
                  padding: '9px 11px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: `1px solid ${v.kind === k.id ? '#3dd68c' : 'rgba(255,255,255,0.12)'}`,
                  background: v.kind === k.id ? 'rgba(61,214,140,0.1)' : 'transparent',
                  color: '#e2e8f0',
                }}
              >
                <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>{k.t}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{k.d}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <span style={label}>Tên môn / chủ đề *</span>
          <input
            autoFocus
            value={v.name}
            onChange={(e) => setV({ ...v, name: e.target.value })}
            placeholder="VD: Tiếng Nhật N3, Python cơ bản, Đầu tư tài chính"
            style={field}
          />
        </div>

        <div>
          <span style={label}>Nhóm</span>
          <select value={v.groupId} onChange={(e) => setV({ ...v, groupId: e.target.value })} style={{ ...field, background: '#0f172a' }}>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
            <option value="__new__">+ Tạo nhóm mới...</option>
          </select>
          {(v.groupId === '__new__' || groups.length === 0) && (
            <input
              value={v.newGroupName}
              onChange={(e) => setV({ ...v, newGroupName: e.target.value, groupId: '__new__' })}
              placeholder="Tên nhóm mới (VD: Tự học, Chuyên ngành, Sau tốt nghiệp)"
              style={{ ...field, marginTop: '8px' }}
            />
          )}
        </div>

        {v.kind === 'course' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <span style={label}>Mã môn (tùy chọn)</span>
              <input value={v.code} onChange={(e) => setV({ ...v, code: e.target.value })} placeholder="MKT101" style={field} />
            </div>
            <div style={{ width: '110px' }}>
              <span style={label}>Tín chỉ</span>
              <input
                type="number"
                min={0}
                max={20}
                value={v.credits}
                onChange={(e) => setV({ ...v, credits: parseInt(e.target.value || '0', 10) })}
                style={field}
              />
            </div>
          </div>
        )}

        <div>
          <span style={label}>Màu</span>
          <ColorPicker value={v.color} onChange={(c) => setV({ ...v, color: c })} />
        </div>

        {err && <div style={{ color: '#f9a3a8', fontSize: '0.82rem' }}>{err}</div>}
        <Actions busy={busy} submitLabel={mode === 'create' ? 'Tạo' : 'Lưu'} onClose={onClose} />
      </form>
    </Shell>
  );
}

export function GroupFormModal({
  initial,
  onClose,
  onSubmit,
}: {
  initial?: any;
  onClose: () => void;
  onSubmit: (v: { name: string; color: string }) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [color, setColor] = useState(initial?.color || COLORS[1]);
  const [busy, setBusy] = useState(false);

  return (
    <Shell title={initial ? 'Sửa nhóm' : 'Tạo nhóm mới'} onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          setBusy(true);
          await onSubmit({ name: name.trim(), color });
          onClose();
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <div>
          <span style={label}>Tên nhóm</span>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Tự học, Chuyên ngành, Sau tốt nghiệp" style={field} />
        </div>
        <div>
          <span style={label}>Màu</span>
          <ColorPicker value={color} onChange={setColor} />
        </div>
        <Actions busy={busy} submitLabel={initial ? 'Lưu' : 'Tạo'} onClose={onClose} />
      </form>
    </Shell>
  );
}

export function ChapterFormModal({
  initial,
  subjectName,
  onClose,
  onSubmit,
}: {
  initial?: any;
  subjectName: string;
  onClose: () => void;
  onSubmit: (v: { title: string; content: string }) => Promise<void>;
}) {
  const stripHtml = (h: string) =>
    h ? h.replace(/<\/p><p>/g, '\n').replace(/<[^>]+>/g, '') : '';
  const isHtmlRich = !!initial && /<(h\d|ul|ol|li|table|strong)\b/i.test(initial.coreConcept || '');
  const [title, setTitle] = useState(initial?.title || '');
  const [content, setContent] = useState(initial && !isHtmlRich ? stripHtml(initial.coreConcept || '') : '');
  const [busy, setBusy] = useState(false);

  return (
    <Shell title={initial ? 'Sửa chương' : `Thêm chương vào "${subjectName}"`} onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!title.trim()) return;
          setBusy(true);
          await onSubmit({ title: title.trim(), content });
          onClose();
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <div>
          <span style={label}>Tên chương / bài học</span>
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Bài 1 - Giới thiệu" style={field} />
        </div>
        <div>
          <span style={label}>
            Nội dung / ghi chú {isHtmlRich && '(giữ nguyên nội dung định dạng sẵn có nếu để trống)'}
          </span>
          <textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Nội dung tóm tắt, ghi chú..." style={field} />
        </div>
        <Actions busy={busy} submitLabel={initial ? 'Lưu' : 'Thêm'} onClose={onClose} />
      </form>
    </Shell>
  );
}
