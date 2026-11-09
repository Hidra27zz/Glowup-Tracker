'use client';

import { useState, useTransition } from 'react';
import { Target, Plus, Trash2, CheckCircle2, AlertTriangle, Clock, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { createSmartGoal, updateSmartGoalProgress, deleteSmartGoal } from '@/app/tasks/actions';
import { getTaskTimeStatus } from '@/lib/utils/timeFormat';

export interface SmartGoalItem {
  id: string;
  title: string;
  category: string;
  specific: string;
  measurable: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  achievable: string;
  relevant: string;
  startDate: Date | string;
  deadline: Date | string;
  status: string;
}

const GOAL_TEMPLATES = [
  {
    label: 'Giảm mỡ / Body Recomp',
    title: 'Đạt vóc dáng Fit & Giảm mỡ cơ thể',
    category: 'Health',
    specific: 'Giảm mỡ thừa vùng bụng và tăng độ săn chắc cơ thể thông qua thâm hụt calo và tập kháng lực.',
    measurable: 'Theo dõi cân nặng hàng tuần trên hệ thống Body Metrics',
    currentValue: 0,
    targetValue: 5,
    unit: 'kg giảm',
    achievable: 'Tập 4 buổi/tuần (30p/buổi), ăn thâm hụt 300 kcal/ngày, uống đủ 2L nước.',
    relevant: 'Cải thiện sức khỏe thể chất, tăng sự tự tin và mức năng lượng làm việc mỗi ngày.',
    days: 60,
  },
  {
    label: 'Chinh phục Chứng chỉ / Môn học',
    title: 'Hoàn thành khóa học chuyên môn & Đạt điểm A',
    category: 'Study',
    specific: 'Nắm vững toàn bộ chương trình học và hoàn thành các bài tập thực hành + đề thi thử.',
    measurable: 'Số giờ học sâu (Deep Work) và số chương hoàn thành',
    currentValue: 0,
    targetValue: 40,
    unit: 'giờ Deep Work',
    achievable: 'Dành 1.5 giờ mỗi tối với Pomodoro, ôn tập bằng Flashcard Spaced Repetition.',
    relevant: 'Nền tảng kiến thức vững chắc để phát triển sự nghiệp và nâng cao năng lực cạnh tranh.',
    days: 30,
  },
  {
    label: 'Quỹ Dự Phòng Tài Chính',
    title: 'Xây dựng Quỹ Tiết Kiệm Cá Nhân',
    category: 'Finance',
    specific: 'Tích lũy quỹ dự phòng khẩn cấp bằng cách tối ưu chi tiêu đi chợ và cắt giảm mua sắm bốc đồng.',
    measurable: 'Số tiền tiết kiệm tích lũy được (triệu VNĐ)',
    currentValue: 0,
    targetValue: 10,
    unit: 'triệu VNĐ',
    achievable: 'Trích tự động 20% thu nhập và giới hạn quỹ ăn uống 400k/tuần bằng tủ lạnh thông minh.',
    relevant: 'Tự do tài chính và an tâm trước các rủi ro bất ngờ.',
    days: 90,
  },
];

const CATEGORY_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  Health: { color: '#3dd68c', bg: 'rgba(61, 214, 140,0.12)', label: 'Sức khỏe' },
  Study: { color: '#5b9cff', bg: 'rgba(91, 156, 255,0.12)', label: 'Học tập' },
  Career: { color: '#a5b1ff', bg: 'rgba(168,85,247,0.12)', label: 'Sự nghiệp' },
  Finance: { color: '#f5b94a', bg: 'rgba(245, 185, 74,0.12)', label: 'Tài chính' },
  Personal: { color: '#ec4899', bg: 'rgba(236,72,153,0.12)', label: 'Cá nhân' },
};

export default function SmartGoalBoard({ goals }: { goals: SmartGoalItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(goals[0]?.id || null);
  const [progressInputs, setProgressInputs] = useState<Record<string, string>>({});

  // Form controlled states for template filling
  const [formState, setFormState] = useState({
    title: '',
    category: 'Health',
    specific: '',
    measurable: '',
    currentValue: '0',
    targetValue: '100',
    unit: '%',
    achievable: '',
    relevant: '',
    startDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    deadline: new Date(Date.now() + 30 * 86400000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
  });

  const applyTemplate = (tpl: (typeof GOAL_TEMPLATES)[number]) => {
    const start = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const end = new Date(Date.now() + tpl.days * 86400000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setFormState({
      title: tpl.title,
      category: tpl.category,
      specific: tpl.specific,
      measurable: tpl.measurable,
      currentValue: String(tpl.currentValue),
      targetValue: String(tpl.targetValue),
      unit: tpl.unit,
      achievable: tpl.achievable,
      relevant: tpl.relevant,
      startDate: start,
      deadline: end,
    });
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createSmartGoal(fd);
      setShowForm(false);
    });
  };

  const handleUpdateProgress = (id: string, valStr: string) => {
    const num = parseFloat(valStr);
    if (isNaN(num)) return;
    startTransition(async () => {
      await updateSmartGoalProgress(id, num);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteSmartGoal(id);
    });
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.25)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(91, 156, 255,0.25), rgba(168,85,247,0.25))', padding: '10px', borderRadius: '14px', border: '1px solid rgba(96,165,250,0.3)' }}>
            <Target size={24} color="#7db2ff" />
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '0.5px' }}>
              Hệ Thống Mục Tiêu SMART
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Specific (Cụ thể) • Measurable (Đo lường) • Achievable (Khả thi) • Relevant (Thực tế) • Time-bound (Thời hạn)
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: showForm ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #5b9cff, #7b8cff)',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: showForm ? 'none' : '0 4px 15px rgba(91, 156, 255,0.35)',
          }}
        >
          <Plus size={18} /> {showForm ? 'Đóng Form' : 'Thiết lập Mục tiêu SMART'}
        </button>
      </div>

      {/* FORM TẠO MỤC TIÊU SMART */}
      {showForm && (
        <form onSubmit={handleCreate} style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(91, 156, 255,0.3)', borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <Sparkles size={14} color="#f5b94a" /> Mẫu gợi ý nhanh:
            </span>
            {GOAL_TEMPLATES.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyTemplate(tpl)}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', padding: '5px 12px', borderRadius: '20px', fontSize: '0.78rem', cursor: 'pointer' }}
              >
                {tpl.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Tên mục tiêu tổng quát *</label>
              <input
                name="title"
                required
                value={formState.title}
                onChange={e => setFormState({ ...formState, title: e.target.value })}
                placeholder="VD: Giảm 5kg mỡ thừa trong 2 tháng"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(15,23,42,0.8)', color: '#fff', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Lĩnh vực</label>
              <select
                name="category"
                value={formState.category}
                onChange={e => setFormState({ ...formState, category: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: '#0f172a', color: '#fff', outline: 'none' }}
              >
                <option value="Health">Sức khỏe & Thể chất</option>
                <option value="Study">Học tập & Kỹ năng</option>
                <option value="Career">Sự nghiệp & Công việc</option>
                <option value="Finance">Tài chính & Tiết kiệm</option>
                <option value="Personal">Phát triển cá nhân</option>
              </select>
            </div>
          </div>

          {/* S - SPECIFIC */}
          <div style={{ background: 'rgba(91, 156, 255,0.06)', borderLeft: '3px solid #5b9cff', padding: '12px', borderRadius: '0 10px 10px 0' }}>
            <label style={{ fontSize: '0.82rem', color: '#7db2ff', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              [S] Specific — Cụ thể mục tiêu cần đạt là gì? *
            </label>
            <input
              name="specific"
              required
              value={formState.specific}
              onChange={e => setFormState({ ...formState, specific: e.target.value })}
              placeholder="Mô tả rõ ràng, không chung chung (Ai, làm gì, ở đâu, kết quả cụ thể nào?)"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>

          {/* M - MEASURABLE */}
          <div style={{ background: 'rgba(61, 214, 140,0.06)', borderLeft: '3px solid #3dd68c', padding: '12px', borderRadius: '0 10px 10px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.82rem', color: '#3dd68c', fontWeight: 700 }}>
              [M] Measurable — Đo lường bằng con số nào? *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '8px' }}>
              <input
                name="measurable"
                required
                value={formState.measurable}
                onChange={e => setFormState({ ...formState, measurable: e.target.value })}
                placeholder="Chỉ số đo lường (VD: Số giờ học / Cân nặng)"
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', fontSize: '0.88rem' }}
              />
              <input
                name="currentValue"
                type="number"
                step="any"
                required
                value={formState.currentValue}
                onChange={e => setFormState({ ...formState, currentValue: e.target.value })}
                placeholder="Hiện tại (0)"
                title="Giá trị hiện tại"
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', fontSize: '0.88rem' }}
              />
              <input
                name="targetValue"
                type="number"
                step="any"
                required
                value={formState.targetValue}
                onChange={e => setFormState({ ...formState, targetValue: e.target.value })}
                placeholder="Mục tiêu (100)"
                title="Giá trị mục tiêu cần đạt"
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', fontSize: '0.88rem' }}
              />
              <input
                name="unit"
                required
                value={formState.unit}
                onChange={e => setFormState({ ...formState, unit: e.target.value })}
                placeholder="Đơn vị (kg, giờ, %)"
                title="Đơn vị đo"
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          {/* A - ACHIEVABLE & R - RELEVANT */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'rgba(245, 185, 74,0.06)', borderLeft: '3px solid #f5b94a', padding: '12px', borderRadius: '0 10px 10px 0' }}>
              <label style={{ fontSize: '0.82rem', color: '#f5b94a', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                [A] Achievable — Kế hoạch khả thi để đạt được *
              </label>
              <input
                name="achievable"
                required
                value={formState.achievable}
                onChange={e => setFormState({ ...formState, achievable: e.target.value })}
                placeholder="Chia nhỏ thành thói quen/hành động hàng ngày..."
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ background: 'rgba(168,85,247,0.06)', borderLeft: '3px solid #a5b1ff', padding: '12px', borderRadius: '0 10px 10px 0' }}>
              <label style={{ fontSize: '0.82rem', color: '#c084fc', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                [R] Relevant — Tại sao mục tiêu này quan trọng? *
              </label>
              <input
                name="relevant"
                required
                value={formState.relevant}
                onChange={e => setFormState({ ...formState, relevant: e.target.value })}
                placeholder="Ý nghĩa thực tế đối với cuộc sống/sự nghiệp của bạn..."
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          {/* T - TIME-BOUND */}
          <div style={{ background: 'rgba(236,72,153,0.06)', borderLeft: '3px solid #ec4899', padding: '12px', borderRadius: '0 10px 10px 0' }}>
            <label style={{ fontSize: '0.82rem', color: '#f472b6', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              [T] Time-bound — Thời gian bắt đầu & Hạn chót hoàn thành (Ngày & Giờ) *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Bắt đầu từ:</span>
                <input
                  name="startDate"
                  type="datetime-local"
                  required
                  value={formState.startDate}
                  onChange={e => setFormState({ ...formState, startDate: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', colorScheme: 'dark' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Hạn chót (Deadline):</span>
                <input
                  name="deadline"
                  type="datetime-local"
                  required
                  value={formState.deadline}
                  onChange={e => setFormState({ ...formState, deadline: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', colorScheme: 'dark' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>
              Hủy
            </button>
            <button type="submit" disabled={isPending} style={{ background: '#3dd68c', border: 'none', color: '#0f172a', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 800 }}>
              {isPending ? 'Đang lưu...' : 'Lưu Mục Tiêu SMART'}
            </button>
          </div>
        </form>
      )}

      {/* DANH SÁCH MỤC TIÊU SMART */}
      {goals.length === 0 ? (
        <div style={{ padding: '28px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)', color: '#94a3b8' }}>
          Chưa có mục tiêu SMART nào. Hãy nhấn <strong>&ldquo;Thiết lập Mục tiêu SMART&rdquo;</strong> để định hình mục tiêu Cụ thể - Đo lường được - Khả thi - Thực tế - Có thời hạn!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          {goals.map(goal => {
            const cat = CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.Personal;
            const pct = goal.targetValue > 0 ? Math.min(100, Math.max(0, Math.round((goal.currentValue / goal.targetValue) * 100))) : 0;
            const isCompleted = goal.status === 'COMPLETED' || pct >= 100;
            const timeInfo = getTaskTimeStatus(goal.startDate, goal.deadline, isCompleted ? 'DONE' : 'TODO');
            const isExpanded = expandedGoalId === goal.id;

            return (
              <div
                key={goal.id}
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: `1px solid ${timeInfo.isOverdue ? 'rgba(244, 109, 117,0.4)' : timeInfo.isWarning ? 'rgba(245, 185, 74,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '18px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', color: cat.color, background: cat.bg }}>
                        {cat.label}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', color: timeInfo.color, background: timeInfo.bgColor, border: `1px solid ${timeInfo.borderColor}` }}>
                        {timeInfo.badgeText}
                      </span>
                    </div>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isCompleted && <CheckCircle2 size={18} color="#3dd68c" />}
                      {goal.title}
                    </h4>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}
                      title="Xem chi tiết 5 tiêu chí SMART"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      disabled={isPending}
                      style={{ background: 'rgba(244, 109, 117,0.1)', border: 'none', color: '#f46d75', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}
                      title="Xóa mục tiêu"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Thanh đo lường tiến độ (Measurable) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ color: '#cbd5e1', fontWeight: 600 }}>
                      Tiến độ: <strong style={{ color: cat.color }}>{goal.currentValue}</strong> / {goal.targetValue} {goal.unit}
                    </span>
                    <span style={{ fontWeight: 800, color: isCompleted ? '#3dd68c' : '#fff' }}>{pct}%</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: isCompleted ? '#3dd68c' : cat.color,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>

                  {/* Cập nhật nhanh chỉ số */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <input
                      type="number"
                      step="any"
                      placeholder={`Cập nhật số ${goal.unit}...`}
                      value={progressInputs[goal.id] ?? ''}
                      onChange={e => setProgressInputs({ ...progressInputs, [goal.id]: e.target.value })}
                      style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
                    />
                    <button
                      type="button"
                      disabled={isPending || !progressInputs[goal.id]}
                      onClick={() => {
                        handleUpdateProgress(goal.id, progressInputs[goal.id]);
                        setProgressInputs({ ...progressInputs, [goal.id]: '' });
                      }}
                      style={{ background: 'rgba(91, 156, 255,0.2)', border: '1px solid rgba(91, 156, 255,0.4)', color: '#7db2ff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Cập nhật
                    </button>
                  </div>
                </div>

                {/* Thời gian Bắt đầu -> Hạn chót */}
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={13} color={timeInfo.color} />
                  <span>{timeInfo.detailText}</span>
                </div>

                {/* Chi tiết S-M-A-R-T */}
                {isExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.83rem' }}>
                    <div><strong style={{ color: '#7db2ff' }}>[S] Cụ thể:</strong> <span style={{ color: '#cbd5e1' }}>{goal.specific}</span></div>
                    <div><strong style={{ color: '#3dd68c' }}>[M] Đo lường:</strong> <span style={{ color: '#cbd5e1' }}>{goal.measurable} ({goal.currentValue}/{goal.targetValue} {goal.unit})</span></div>
                    <div><strong style={{ color: '#f5b94a' }}>[A] Khả thi:</strong> <span style={{ color: '#cbd5e1' }}>{goal.achievable}</span></div>
                    <div><strong style={{ color: '#c084fc' }}>[R] Ý nghĩa:</strong> <span style={{ color: '#cbd5e1' }}>{goal.relevant}</span></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
