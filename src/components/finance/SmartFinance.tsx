'use client';

import { useMemo, useState } from 'react';
import { Trash2, Target, Zap, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { Budget, FinancialTransaction, SavingsGoal } from '@prisma/client';
import {
  addQuickTransactionAction,
  setBudgetAction,
  deleteBudgetAction,
  addSavingsGoalAction,
  contributeSavingsGoalAction,
  deleteSavingsGoalAction,
} from '@/app/finance/smart-actions';
import { deleteTransaction } from '@/app/finance/actions';
import {
  CATEGORY_COLORS,
  EXPENSE_CATEGORIES,
  summarizeMonth,
  goalProgress,
  normalizeCategory,
} from '@/lib/utils/financeInsights';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Props {
  transactions: FinancialTransaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  subscriptionMonthly: number;
}

const money = (n: number) => `${Math.round(n).toLocaleString('vi-VN')}đ`;

const card: React.CSSProperties = {
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '18px',
};

const input: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text-primary)',
  outline: 'none',
  fontSize: '0.88rem',
};

const LEVEL_COLOR = { danger: '#f46d75', warning: '#f5b94a', info: '#5b9cff', success: '#3dd68c' } as const;

export default function SmartFinance({ transactions, budgets, savingsGoals, subscriptionMonthly }: Props) {
  const [quick, setQuick] = useState('');
  const [quickMsg, setQuickMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [budgetCat, setBudgetCat] = useState(EXPENSE_CATEGORIES[0]);
  const [budgetLimit, setBudgetLimit] = useState('');
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [contrib, setContrib] = useState<Record<string, string>>({});

  const s = useMemo(
    () => summarizeMonth(transactions, budgets, subscriptionMonthly),
    [transactions, budgets, subscriptionMonthly]
  );

  const monthTx = useMemo(() => {
    const n = new Date();
    return transactions
      .filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
      })
      .slice(0, 15);
  }, [transactions]);

  const pieData = s.categories.filter((c) => c.spent > 0).map((c) => ({ name: c.category, value: c.spent }));

  const submitQuick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quick.trim()) return;
    setBusy(true);
    const res = await addQuickTransactionAction(quick);
    setQuickMsg({ ok: res.success, text: res.success ? `Đã ghi: ${res.summary}` : res.error || 'Lỗi' });
    if (res.success) setQuick('');
    setBusy(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Nhập nhanh */}
      <form onSubmit={submitQuick} style={{ ...card, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-primary)' }}>
          <Zap size={16} color="#f5b94a" /> Nhập nhanh bằng câu thường
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            value={quick}
            onChange={(e) => setQuick(e.target.value)}
            placeholder='Ví dụ: "cà phê 30k", "grab 45.000", "lương 15tr"'
            style={{ ...input, flex: 1, minWidth: '220px' }}
          />
          <button
            type="submit"
            disabled={busy}
            style={{ background: '#5b9cff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
          >
            {busy ? 'Đang lưu...' : 'Ghi nhận'}
          </button>
        </div>
        {quickMsg && (
          <div style={{ fontSize: '0.82rem', color: quickMsg.ok ? '#3dd68c' : '#f46d75' }}>{quickMsg.text}</div>
        )}
        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
          Hệ thống tự nhận số tiền (k, tr, 45.000) và tự chọn danh mục theo từ khóa.
        </div>
      </form>

      {/* Tổng quan tháng */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' }}>
        <div style={card}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Thu nhập tháng này</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#3dd68c' }}>{money(s.income)}</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Chi tiêu (gồm subscription)</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f46d75' }}>{money(s.expense)}</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Còn lại / Tiết kiệm</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: s.net >= 0 ? '#5b9cff' : '#f46d75', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {s.net >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />} {money(s.net)}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Tỷ lệ tiết kiệm {s.savingsRate}%</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Được tiêu an toàn / ngày</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>{money(s.safePerDay)}</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Dự báo cuối tháng: {money(s.projectedExpense)}
          </div>
        </div>
      </div>

      {/* Cảnh báo thông minh */}
      <div style={card}>
        <div style={{ fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>Nhận định & cảnh báo</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {s.insights.length === 0 && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Chi tiêu đang ổn định, chưa có cảnh báo.</div>
          )}
          {s.insights.map((i, idx) => (
            <div
              key={idx}
              style={{
                borderLeft: `3px solid ${LEVEL_COLOR[i.level]}`,
                background: 'var(--surface)',
                padding: '8px 12px',
                borderRadius: '8px',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>{i.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{i.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Biểu đồ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        <div style={card}>
          <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Chi tiêu tích lũy theo ngày</div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <AreaChart data={s.dailySeries}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={42} />
                <Tooltip
                  formatter={(v: any) => money(Number(v))}
                  labelFormatter={(l) => `Ngày ${l}`}
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                />
                <Area type="monotone" dataKey="cumulative" stroke="#5b9cff" fill="#5b9cff33" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={card}>
          <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Cơ cấu chi tiêu</div>
          {pieData.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '60px 0', textAlign: 'center' }}>Chưa có dữ liệu chi tiêu.</div>
          ) : (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {pieData.map((d) => (
                      <Cell key={d.name} fill={CATEGORY_COLORS[d.name] || '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: any) => money(Number(v))}
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Quy tắc 50/30/20 */}
      <div style={card}>
        <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Quy tắc 50/30/20</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', fontSize: '0.84rem' }}>
          <div>Thiết yếu: <strong>{s.rule503020.needs}%</strong> <span style={{ color: 'var(--text-secondary)' }}>(mục tiêu ≤ 50%)</span></div>
          <div>Mong muốn: <strong>{s.rule503020.wants}%</strong> <span style={{ color: 'var(--text-secondary)' }}>(mục tiêu ≤ 30%)</span></div>
          <div>Tiết kiệm: <strong>{s.rule503020.savings}%</strong> <span style={{ color: 'var(--text-secondary)' }}>(mục tiêu ≥ 20%)</span></div>
        </div>
      </div>

      {/* Ngân sách */}
      <div style={card}>
        <div style={{ fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>Ngân sách theo danh mục</div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const v = parseFloat(budgetLimit);
            if (!(v > 0)) return;
            await setBudgetAction(budgetCat, v);
            setBudgetLimit('');
          }}
          style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}
        >
          <select value={budgetCat} onChange={(e) => setBudgetCat(e.target.value)} style={input}>
            {EXPENSE_CATEGORIES.concat(['Subscriptions']).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="number"
            value={budgetLimit}
            onChange={(e) => setBudgetLimit(e.target.value)}
            placeholder="Hạn mức / tháng (VNĐ)"
            style={{ ...input, flex: 1, minWidth: '160px' }}
          />
          <button type="submit" style={{ background: '#3dd68c', color: '#0f172a', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
            Đặt ngân sách
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {s.categories.length === 0 && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Chưa có danh mục nào. Đặt ngân sách hoặc ghi giao dịch để bắt đầu.</div>
          )}
          {s.categories.map((c) => {
            const pct = c.percentOfLimit ?? 0;
            const color = !c.limit ? CATEGORY_COLORS[c.category] || '#64748b' : pct >= 100 ? '#f46d75' : pct >= 80 ? '#f5b94a' : '#3dd68c';
            const budget = budgets.find((b) => b.category === c.category);
            return (
              <div key={c.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '4px', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {c.category}
                    {c.changeVsPrev !== null && (
                      <span style={{ marginLeft: 8, fontWeight: 400, fontSize: '0.74rem', color: c.changeVsPrev > 0 ? '#f46d75' : '#3dd68c' }}>
                        {c.changeVsPrev > 0 ? '+' : ''}{c.changeVsPrev}% so với tháng trước
                      </span>
                    )}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {money(c.spent)}{c.limit ? ` / ${money(c.limit)} (${pct}%)` : ` (${c.percentOfTotal}% tổng chi)`}
                    {budget && (
                      <button
                        onClick={() => deleteBudgetAction(budget.id)}
                        title="Xóa ngân sách"
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginLeft: 6 }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </span>
                </div>
                <div style={{ height: 8, background: 'var(--surface)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, c.limit ? pct : c.percentOfTotal)}%`, height: '100%', background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mục tiêu tiết kiệm */}
      <div style={card}>
        <div style={{ fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={16} color="#7b8cff" /> Mục tiêu tiết kiệm
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const t = parseFloat(goalTarget);
            if (!goalName.trim() || !(t > 0)) return;
            await addSavingsGoalAction(goalName, t, goalDeadline || undefined);
            setGoalName('');
            setGoalTarget('');
            setGoalDeadline('');
          }}
          style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}
        >
          <input value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="Tên mục tiêu (VD: Mua laptop)" style={{ ...input, flex: 2, minWidth: '160px' }} />
          <input type="number" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} placeholder="Số tiền cần (VNĐ)" style={{ ...input, flex: 1, minWidth: '140px' }} />
          <input type="date" value={goalDeadline} onChange={(e) => setGoalDeadline(e.target.value)} style={{ ...input, colorScheme: 'dark' }} />
          <button type="submit" style={{ background: '#7b8cff', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={15} /> Thêm
          </button>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {savingsGoals.length === 0 && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Chưa có mục tiêu nào.</div>
          )}
          {savingsGoals.map((g) => {
            const p = goalProgress(g);
            return (
              <div key={g.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{g.name}</strong>
                  <button onClick={() => deleteSavingsGoalAction(g.id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 8px' }}>
                  {money(g.savedAmount)} / {money(g.targetAmount)} ({p.percent}%)
                </div>
                <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${p.percent}%`, height: '100%', background: '#7b8cff' }} />
                </div>
                {p.monthlyNeeded !== null && p.remaining > 0 && (
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                    Cần để dành khoảng {money(p.monthlyNeeded)}/tháng trong {p.monthsLeft} tháng tới.
                  </div>
                )}
                {p.remaining === 0 && <div style={{ fontSize: '0.78rem', color: '#3dd68c', marginTop: 6 }}>Đã đạt mục tiêu.</div>}
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <input
                    type="number"
                    value={contrib[g.id] || ''}
                    onChange={(e) => setContrib((c) => ({ ...c, [g.id]: e.target.value }))}
                    placeholder="Góp thêm"
                    style={{ ...input, flex: 1, padding: '7px 10px' }}
                  />
                  <button
                    onClick={async () => {
                      const v = parseFloat(contrib[g.id] || '');
                      if (!(v > 0)) return;
                      await contributeSavingsGoalAction(g.id, v);
                      setContrib((c) => ({ ...c, [g.id]: '' }));
                    }}
                    style={{ background: '#3dd68c', color: '#0f172a', border: 'none', padding: '7px 12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Góp
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Giao dịch gần đây */}
      <div style={card}>
        <div style={{ fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>Giao dịch gần đây trong tháng</div>
        {monthTx.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Chưa có giao dịch.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {monthTx.map((t) => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.notes || normalizeCategory(t.category)}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    {normalizeCategory(t.category)} • {new Date(t.date).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong style={{ color: t.type === 'income' ? '#3dd68c' : '#f46d75', fontSize: '0.88rem' }}>
                    {t.type === 'income' ? '+' : '-'}{money(t.amount)}
                  </strong>
                  <button onClick={() => deleteTransaction(t.id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
