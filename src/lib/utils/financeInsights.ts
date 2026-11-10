export interface TxLike {
  id: string;
  amount: number;
  category: string;
  type: string;
  date: Date | string;
  notes?: string | null;
}

export interface BudgetLike {
  id: string;
  category: string;
  monthlyLimit: number;
}

export interface GoalLike {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: Date | string | null;
}

export const EXPENSE_CATEGORIES = ['Ăn uống', 'Nhà ở', 'Đi lại', 'Giải trí', 'Sức khỏe', 'Mua sắm', 'Học tập', 'Khác'];
export const INCOME_CATEGORIES = ['Lương', 'Thưởng', 'Làm thêm', 'Đầu tư', 'Thu nhập khác'];

export const CATEGORY_COLORS: Record<string, string> = {
  'Ăn uống': '#5b9cff',
  'Nhà ở': '#3dd68c',
  'Đi lại': '#f5b94a',
  'Giải trí': '#7b8cff',
  'Sức khỏe': '#ec4899',
  'Mua sắm': '#f97316',
  'Học tập': '#14b8a6',
  'Subscriptions': '#a78bfa',
  'Khác': '#64748b',
};

const KEYWORD_RULES: { category: string; type: 'expense' | 'income'; words: string[] }[] = [
  { category: 'Lương', type: 'income', words: ['lương', 'salary'] },
  { category: 'Thưởng', type: 'income', words: ['thưởng', 'bonus'] },
  { category: 'Làm thêm', type: 'income', words: ['freelance', 'làm thêm', 'dạy kèm', 'ship'] },
  { category: 'Ăn uống', type: 'expense', words: ['cà phê', 'cafe', 'coffee', 'trà sữa', 'ăn', 'cơm', 'phở', 'bún', 'bánh', 'nhậu', 'đồ ăn', 'chợ', 'siêu thị', 'grocery', 'nước', 'highlands', 'grab food', 'shopeefood'] },
  { category: 'Đi lại', type: 'expense', words: ['xăng', 'grab', 'be ', 'taxi', 'xe buýt', 'bus', 'gửi xe', 'vé tàu', 'vé xe', 'máy bay'] },
  { category: 'Nhà ở', type: 'expense', words: ['tiền nhà', 'thuê nhà', 'điện', 'nước sinh hoạt', 'internet', 'wifi', 'chung cư'] },
  { category: 'Giải trí', type: 'expense', words: ['phim', 'game', 'netflix', 'spotify', 'karaoke', 'du lịch', 'bar'] },
  { category: 'Sức khỏe', type: 'expense', words: ['thuốc', 'khám', 'gym', 'bệnh viện', 'nha khoa', 'vitamin'] },
  { category: 'Mua sắm', type: 'expense', words: ['áo', 'quần', 'giày', 'shopee', 'lazada', 'tiki', 'mua', 'mỹ phẩm'] },
  { category: 'Học tập', type: 'expense', words: ['sách', 'khóa học', 'học phí', 'course', 'udemy', 'ielts'] },
];

/** Chuẩn hoá danh mục cũ (ví dụ "Grocery Bill") về nhóm chi tiêu chuẩn. */
export function normalizeCategory(cat: string): string {
  if (!cat) return 'Khác';
  if (/grocery/i.test(cat)) return 'Ăn uống';
  return cat;
}

function parseAmountToken(token: string): number | null {
  const m = token.toLowerCase().replace(/\s/g, '').match(/^(\d+(?:[.,]\d+)?)(k|tr|triệu|nghìn|ngàn|đ|vnd|vnđ)?$/);
  if (!m) return null;
  let num = parseFloat(m[1].replace(',', '.'));
  const unit = m[2];
  if (unit === 'k' || unit === 'nghìn' || unit === 'ngàn') num *= 1000;
  else if (unit === 'tr' || unit === 'triệu') num *= 1_000_000;
  else if (!unit && /^\d{1,3}([.]\d{3})+$/.test(m[1])) num = parseFloat(m[1].replace(/\./g, ''));
  return Math.round(num);
}

/** Phân tích câu nhập nhanh: "cà phê 30k", "lương 15tr", "grab 45.000". */
export function parseQuickEntry(text: string): { amount: number; category: string; type: 'expense' | 'income'; note: string } | null {
  const raw = text.trim();
  if (!raw) return null;
  const tokens = raw.split(/\s+/);
  let amount: number | null = null;
  let amountIdx = -1;
  for (let i = tokens.length - 1; i >= 0; i--) {
    const v = parseAmountToken(tokens[i]);
    if (v && v > 0) {
      amount = v;
      amountIdx = i;
      break;
    }
  }
  if (!amount) return null;
  const note = tokens.filter((_, i) => i !== amountIdx).join(' ').trim() || 'Giao dịch';
  const lower = ` ${note.toLowerCase()} `;
  for (const rule of KEYWORD_RULES) {
    if (rule.words.some((w) => lower.includes(w))) {
      return { amount, category: rule.category, type: rule.type, note };
    }
  }
  return { amount, category: 'Khác', type: 'expense', note };
}

function inMonth(d: Date | string, year: number, month: number) {
  const x = new Date(d);
  return x.getFullYear() === year && x.getMonth() === month;
}

export interface CategoryStat {
  category: string;
  spent: number;
  prevSpent: number;
  limit: number | null;
  percentOfLimit: number | null;
  percentOfTotal: number;
  changeVsPrev: number | null;
}

export interface Insight {
  level: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  detail: string;
}

export interface MonthSummary {
  income: number;
  expense: number;
  net: number;
  savingsRate: number;
  daysInMonth: number;
  dayOfMonth: number;
  dailyAvg: number;
  projectedExpense: number;
  totalBudget: number;
  budgetRemaining: number;
  safePerDay: number;
  categories: CategoryStat[];
  insights: Insight[];
  rule503020: { needs: number; wants: number; savings: number };
  dailySeries: { day: number; spent: number; cumulative: number }[];
}

const NEEDS = ['Nhà ở', 'Ăn uống', 'Đi lại', 'Sức khỏe'];

const fmt = (n: number) => `${Math.round(n).toLocaleString('vi-VN')}đ`;

export function summarizeMonth(
  txs: TxLike[],
  budgets: BudgetLike[],
  subscriptionMonthly: number,
  now = new Date()
): MonthSummary {
  const y = now.getFullYear();
  const m = now.getMonth();
  const prev = new Date(y, m - 1, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const dayOfMonth = now.getDate();

  const cur = txs.filter((t) => inMonth(t.date, y, m));
  const prv = txs.filter((t) => inMonth(t.date, prev.getFullYear(), prev.getMonth()));

  const income = cur.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const txExpense = cur.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const expense = txExpense + subscriptionMonthlyOrZero(subscriptionMonthly);

  const spentBy: Record<string, number> = {};
  const prevBy: Record<string, number> = {};
  for (const t of cur) {
    if (t.type !== 'expense') continue;
    const c = normalizeCategory(t.category);
    spentBy[c] = (spentBy[c] || 0) + t.amount;
  }
  if (subscriptionMonthly > 0) spentBy['Subscriptions'] = (spentBy['Subscriptions'] || 0) + subscriptionMonthly;
  for (const t of prv) {
    if (t.type !== 'expense') continue;
    const c = normalizeCategory(t.category);
    prevBy[c] = (prevBy[c] || 0) + t.amount;
  }

  const limitBy: Record<string, number> = {};
  budgets.forEach((b) => (limitBy[b.category] = b.monthlyLimit));

  const allCats = Array.from(new Set([...Object.keys(spentBy), ...Object.keys(limitBy)]));
  const categories: CategoryStat[] = allCats
    .map((category) => {
      const spent = spentBy[category] || 0;
      const prevSpent = prevBy[category] || 0;
      const limit = limitBy[category] ?? null;
      return {
        category,
        spent,
        prevSpent,
        limit,
        percentOfLimit: limit ? Math.round((spent / limit) * 100) : null,
        percentOfTotal: expense > 0 ? Math.round((spent / expense) * 100) : 0,
        changeVsPrev: prevSpent > 0 ? Math.round(((spent - prevSpent) / prevSpent) * 100) : null,
      };
    })
    .sort((a, b) => b.spent - a.spent);

  const dailyAvg = dayOfMonth > 0 ? expense / dayOfMonth : 0;
  const projectedExpense = dailyAvg * daysInMonth;
  const totalBudget = budgets.reduce((a, b) => a + b.monthlyLimit, 0);
  const budgetRemaining = totalBudget - expense;
  const daysLeft = Math.max(1, daysInMonth - dayOfMonth + 1);
  const baseline = totalBudget > 0 ? budgetRemaining : income - expense;
  const safePerDay = Math.max(0, baseline / daysLeft);
  const net = income - expense;
  const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0;

  const needs = NEEDS.reduce((a, c) => a + (spentBy[c] || 0), 0);
  const wants = expense - needs;
  const rule503020 = {
    needs: income > 0 ? Math.round((needs / income) * 100) : 0,
    wants: income > 0 ? Math.round((wants / income) * 100) : 0,
    savings: income > 0 ? Math.round((net / income) * 100) : 0,
  };

  const dailyMap: Record<number, number> = {};
  for (const t of cur) {
    if (t.type !== 'expense') continue;
    const d = new Date(t.date).getDate();
    dailyMap[d] = (dailyMap[d] || 0) + t.amount;
  }
  let cumulative = 0;
  const dailySeries = Array.from({ length: dayOfMonth }, (_, i) => {
    const day = i + 1;
    const spent = dailyMap[day] || 0;
    cumulative += spent;
    return { day, spent, cumulative };
  });

  const insights: Insight[] = [];
  for (const c of categories) {
    if (c.limit && c.percentOfLimit !== null) {
      if (c.percentOfLimit >= 100) {
        insights.push({ level: 'danger', title: `Vượt ngân sách ${c.category}`, detail: `Đã chi ${fmt(c.spent)} / ${fmt(c.limit)} (${c.percentOfLimit}%). Nên dừng chi ở mục này trong tháng.` });
      } else if (c.percentOfLimit >= 80) {
        insights.push({ level: 'warning', title: `${c.category} sắp chạm trần`, detail: `Đã dùng ${c.percentOfLimit}% ngân sách, còn ${fmt(c.limit - c.spent)}.` });
      }
    }
    if (c.changeVsPrev !== null && c.changeVsPrev >= 40 && c.spent >= 100000) {
      insights.push({ level: 'warning', title: `${c.category} tăng ${c.changeVsPrev}% so với tháng trước`, detail: `Tháng trước ${fmt(c.prevSpent)}, tháng này ${fmt(c.spent)}.` });
    }
  }
  if (totalBudget > 0 && projectedExpense > totalBudget) {
    insights.push({ level: 'danger', title: 'Dự báo vượt tổng ngân sách', detail: `Với tốc độ hiện tại, cuối tháng bạn sẽ chi khoảng ${fmt(projectedExpense)} trong khi ngân sách là ${fmt(totalBudget)}.` });
  } else if (income > 0 && projectedExpense > income) {
    insights.push({ level: 'danger', title: 'Dự báo chi vượt thu nhập', detail: `Dự kiến chi ${fmt(projectedExpense)} so với thu nhập ${fmt(income)} của tháng.` });
  }
  if (income > 0 && savingsRate >= 20) {
    insights.push({ level: 'success', title: `Tiết kiệm ${savingsRate}% thu nhập`, detail: 'Bạn đang đạt mức tiết kiệm tốt (từ 20% trở lên).' });
  } else if (income > 0 && savingsRate < 10) {
    insights.push({ level: 'warning', title: 'Tỷ lệ tiết kiệm thấp', detail: `Hiện chỉ ${savingsRate}%. Thử đặt ngân sách cho nhóm "Mua sắm" và "Giải trí".` });
  }
  if (cur.length === 0) {
    insights.push({ level: 'info', title: 'Chưa có giao dịch tháng này', detail: 'Nhập nhanh ví dụ "cà phê 30k" hoặc "lương 15tr" để bắt đầu theo dõi.' });
  }
  if (totalBudget === 0 && cur.length > 0) {
    insights.push({ level: 'info', title: 'Chưa đặt ngân sách', detail: 'Đặt hạn mức theo danh mục để hệ thống cảnh báo khi sắp vượt.' });
  }

  return {
    income,
    expense,
    net,
    savingsRate,
    daysInMonth,
    dayOfMonth,
    dailyAvg,
    projectedExpense,
    totalBudget,
    budgetRemaining,
    safePerDay,
    categories,
    insights,
    rule503020,
    dailySeries,
  };
}

function subscriptionMonthlyOrZero(n: number) {
  return n > 0 ? n : 0;
}

export function goalProgress(goal: GoalLike, now = new Date()) {
  const percent = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100)) : 0;
  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
  let monthlyNeeded: number | null = null;
  let monthsLeft: number | null = null;
  if (goal.deadline) {
    const dl = new Date(goal.deadline);
    monthsLeft = Math.max(1, (dl.getFullYear() - now.getFullYear()) * 12 + (dl.getMonth() - now.getMonth()));
    monthlyNeeded = remaining / monthsLeft;
  }
  return { percent, remaining, monthlyNeeded, monthsLeft };
}
