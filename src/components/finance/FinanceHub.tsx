'use client';

import { useState } from 'react';
import { Wallet, PieChart, ShoppingCart, RefreshCw, ChevronRight, Plus, Trash2, Check, X, ShieldAlert, AlertTriangle, Pencil } from 'lucide-react';
import { FinancialTransaction, ImpulseBuyItem, Subscription, InventoryItem, Budget, SavingsGoal } from '@prisma/client';
import { addTransaction, deleteTransaction, addImpulseBuy, updateImpulseBuyStatus, deleteImpulseBuy, addSubscription, updateSubscription, deleteSubscription } from '@/app/finance/actions';
import InventoryTracker from './InventoryTracker';
import SmartFinance from './SmartFinance';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface Props {
  transactions: FinancialTransaction[];
  impulseBuys: ImpulseBuyItem[];
  subscriptions: Subscription[];
  inventoryItems: InventoryItem[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
}

const TABS = [
  { id: 'smart', label: 'Quản lý thông minh', icon: Wallet, accent: '#5b9cff' },
  { id: 'dashboard', label: 'Nhập thủ công', icon: PieChart, accent: '#5b9cff' },
  { id: 'impulse', label: 'Impulse Blocker', icon: ShieldAlert, accent: '#f5b94a' },
  { id: 'inventory', label: 'Inventory & PAO', icon: ShoppingCart, accent: '#7b8cff' },
  { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCw, accent: '#3dd68c' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const CATEGORY_COLORS: Record<string, string> = {
  'Ăn uống': '#5b9cff',
  'Nhà ở': '#3dd68c',
  'Đi lại': '#f5b94a',
  'Giải trí': '#7b8cff',
  'Sức khỏe': '#ec4899',
  'Khác': '#64748b'
};

export default function FinanceHub({ transactions, impulseBuys, subscriptions, inventoryItems, budgets, savingsGoals }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('smart');
  const [loading, setLoading] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [subEditForm, setSubEditForm] = useState({ name: '', cost: '', frequency: 'monthly' });
  const currentTab = TABS.find(t => t.id === activeTab)!;

  // -- Burn Rate Data --
  const nowD = new Date();
  const monthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === nowD.getMonth() && d.getFullYear() === nowD.getFullYear();
  });
  const expenses = monthTransactions.filter(t => t.type === 'expense');
  const income = monthTransactions.filter(t => t.type === 'income');
  const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = income.reduce((acc, t) => acc + t.amount, 0);
  const monthlySubCost = subscriptions.reduce((acc, s) => acc + (s.frequency === 'yearly' ? s.cost / 12 : s.cost), 0);
  
  const burnRate = totalExpense + monthlySubCost;
  
  const expensesByCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const pieData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  }));
  
  // Add subscriptions to pie chart as a category
  if (monthlySubCost > 0) {
    pieData.push({ name: 'Subscriptions', value: monthlySubCost });
    CATEGORY_COLORS['Subscriptions'] = '#14b8a6';
  }

  // -- Handlers --
  const handleAddTx = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await addTransaction(new FormData(e.currentTarget));
    e.currentTarget.reset();
    setLoading(false);
  };

  const handleAddImpulse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await addImpulseBuy(new FormData(e.currentTarget));
    e.currentTarget.reset();
    setLoading(false);
  };

  const handleAddSub = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await addSubscription(new FormData(e.currentTarget));
    e.currentTarget.reset();
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
      
      {/* ── Top navigation bar ── */}
      <div style={{ display: 'flex', gap: '4px', background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px 20px 0 0', padding: '6px' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '14px 8px', borderRadius: '14px', border: 'none', background: active ? `linear-gradient(135deg, ${tab.accent}22, ${tab.accent}10)` : 'transparent', borderBottom: active ? `2px solid ${tab.accent}` : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s', outline: 'none' }}
            >
              <Icon size={18} color={active ? tab.accent : '#64748b'} strokeWidth={active ? 2.5 : 1.5} />
              <span style={{ fontSize: '0.75rem', fontWeight: active ? 700 : 500, color: active ? tab.accent : '#64748b' }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Breadcrumb strip ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: 'rgba(15,23,42,0.5)', borderLeft: '1px solid rgba(255,255,255,0.06)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: '0.78rem', color: '#475569' }}>Finance Hub</span>
        <ChevronRight size={12} color="#334155" />
        <span style={{ fontSize: '0.78rem', color: currentTab.accent, fontWeight: 600 }}>{currentTab.label}</span>
      </div>

      {/* ── Content panel ── */}
      <div style={{ flex: 1, background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', borderRadius: '0 0 20px 20px', padding: '24px', backdropFilter: 'blur(16px)' }}>
        
        {/* --- SMART TAB --- */}
        {activeTab === 'smart' && (
          <SmartFinance
            transactions={transactions}
            budgets={budgets}
            savingsGoals={savingsGoals}
            subscriptionMonthly={monthlySubCost}
          />
        )}

        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(91, 156, 255,0.1), rgba(61, 214, 140,0.05))', padding: '24px', borderRadius: '16px', border: '1px solid rgba(91, 156, 255,0.2)' }}>
                <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '1.1rem' }}>
                  <Wallet size={20} color="#5b9cff" /> Monthly Burn Rate
                </h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                  {burnRate.toLocaleString()}đ
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#3dd68c' }}>Thu nhập: {totalIncome.toLocaleString()}đ</span>
                  <span style={{ color: '#f46d75' }}>Chi tiêu: {totalExpense.toLocaleString()}đ</span>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#fff' }}>Ghi nhận giao dịch mới</h4>
                <form onSubmit={handleAddTx} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input name="amount" type="number" placeholder="Số tiền (VNĐ)" required style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
                    <select name="type" style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff', outline: 'none' }}>
                      <option value="expense">Chi tiêu</option>
                      <option value="income">Thu nhập</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <select name="category" required style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff', outline: 'none' }}>
                      <option value="">Chọn danh mục...</option>
                      {Object.keys(CATEGORY_COLORS).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', colorScheme: 'dark' }} />
                  </div>
                  <input name="notes" placeholder="Ghi chú (VD: Mua cafe)" style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
                  <button type="submit" disabled={loading} style={{ background: '#5b9cff', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                    {loading ? 'Đang lưu...' : 'Thêm giao dịch'}
                  </button>
                </form>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#fff', alignSelf: 'flex-start' }}>Cơ cấu chi tiêu</h4>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPie>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#64748b'} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                        itemStyle={{ color: '#fff' }} 
                        formatter={(value: any) => Number(value).toLocaleString() + 'đ'}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Chưa có dữ liệu chi tiêu.</div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                  {pieData.map(entry => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: CATEGORY_COLORS[entry.name] || '#64748b' }} />
                      {entry.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* --- IMPULSE BUY BLOCKER TAB --- */}
        {activeTab === 'impulse' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ background: 'rgba(245, 185, 74,0.1)', border: '1px solid rgba(245, 185, 74,0.3)', padding: '20px', borderRadius: '16px', display: 'flex', gap: '16px' }}>
              <ShieldAlert size={28} color="#f5b94a" style={{ flexShrink: 0 }} />
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#f5b94a', fontSize: '1.1rem' }}>Impulse Buy Blocker (Cooling-off Rule)</h3>
                <p style={{ margin: 0, color: '#fcd34d', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Bất cứ món đồ nào không thiết yếu bạn muốn mua, hãy thêm vào đây. 
                  Luật: Bắt buộc đợi <strong>72 giờ</strong> trước khi ra quyết định xuống tiền. Hệ thống sẽ khóa nút Mua cho đến khi hết hạn.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddImpulse} style={{ display: 'flex', gap: '12px' }}>
              <input name="name" placeholder="Tên món đồ (VD: Bàn phím cơ)" required style={{ flex: 2, padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
              <input name="price" type="number" placeholder="Giá tiền (VNĐ)" required style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
              <button type="submit" disabled={loading} style={{ background: '#f5b94a', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} /> Thêm vào danh sách chờ
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {impulseBuys.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>Không có món đồ nào trong danh sách chờ. Tuyệt vời!</div>
              ) : (
                impulseBuys.map(item => {
                  const addedTime = new Date(item.addedAt).getTime();
                  const now = new Date().getTime();
                  const hoursPassed = (now - addedTime) / (1000 * 60 * 60);
                  const isReady = hoursPassed >= 72;
                  const hoursLeft = Math.max(0, 72 - hoursPassed).toFixed(1);

                  return (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: `1px solid ${item.status === 'WAITING' ? 'rgba(255,255,255,0.05)' : item.status === 'BOUGHT' ? 'rgba(244, 109, 117,0.2)' : 'rgba(61, 214, 140,0.2)'}` }}>
                      <div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {item.name} 
                          {item.status === 'BOUGHT' && <span style={{ fontSize: '0.7rem', background: '#f46d75', padding: '2px 8px', borderRadius: '12px', color: '#fff' }}>ĐÃ MUA</span>}
                          {item.status === 'PASSED' && <span style={{ fontSize: '0.7rem', background: '#3dd68c', padding: '2px 8px', borderRadius: '12px', color: '#fff' }}>BỎ QUA</span>}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Giá: {item.price.toLocaleString()}đ • Thêm ngày: {new Date(item.addedAt).toLocaleDateString()}</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.status === 'WAITING' && (
                          <>
                            {!isReady ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f5b94a', fontSize: '0.85rem', background: 'rgba(245, 185, 74,0.1)', padding: '6px 12px', borderRadius: '8px' }}>
                                <AlertTriangle size={14} /> Chờ {hoursLeft}h
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => updateImpulseBuyStatus(item.id, 'BOUGHT')} style={{ background: 'rgba(244, 109, 117,0.1)', color: '#f46d75', border: '1px solid rgba(244, 109, 117,0.3)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Quyết định mua</button>
                                <button onClick={() => updateImpulseBuyStatus(item.id, 'PASSED')} style={{ background: 'rgba(61, 214, 140,0.1)', color: '#3dd68c', border: '1px solid rgba(61, 214, 140,0.3)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Tự hào bỏ qua</button>
                              </div>
                            )}
                          </>
                        )}
                        <button onClick={() => deleteImpulseBuy(item.id)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '8px' }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* --- SUBSCRIPTIONS TAB --- */}
        {activeTab === 'subscriptions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ background: 'rgba(61, 214, 140,0.1)', border: '1px solid rgba(61, 214, 140,0.3)', padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#3dd68c', fontSize: '1.1rem' }}>Subscription Audit</h3>
                <p style={{ margin: 0, color: '#8ae8b8', fontSize: '0.9rem' }}>Theo dõi các khoản phí đăng ký dịch vụ định kỳ.</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Tổng phí trung bình tháng</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{monthlySubCost.toLocaleString()}đ</div>
              </div>
            </div>

            <form onSubmit={handleAddSub} style={{ display: 'flex', gap: '12px' }}>
              <input name="name" placeholder="Tên dịch vụ (VD: Netflix, Spotify)" required style={{ flex: 2, padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
              <input name="cost" type="number" placeholder="Giá (VNĐ)" required style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
              <select name="frequency" required style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff', outline: 'none' }}>
                <option value="monthly">Hàng tháng</option>
                <option value="yearly">Hàng năm</option>
              </select>
              <input name="renewalDate" type="date" required style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', colorScheme: 'dark' }} />
              <button type="submit" disabled={loading} style={{ background: '#3dd68c', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} /> Thêm gói
              </button>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {subscriptions.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#64748b', padding: '40px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>Không có subscription nào.</div>
              ) : (
                subscriptions.map(sub => (
                  <div key={sub.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {editingSubId === sub.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input value={subEditForm.name} onChange={e => setSubEditForm({ ...subEditForm, name: e.target.value })} placeholder="Tên gói" style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: '0.85rem' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <input type="number" value={subEditForm.cost} onChange={e => setSubEditForm({ ...subEditForm, cost: e.target.value })} placeholder="Chi phí" style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: '0.85rem' }} />
                          <select value={subEditForm.frequency} onChange={e => setSubEditForm({ ...subEditForm, frequency: e.target.value })} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: '#0f172a', color: '#fff', fontSize: '0.85rem' }}>
                            <option value="monthly">Hàng tháng</option>
                            <option value="yearly">Hàng năm</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button type="button" onClick={async () => { await updateSubscription(sub.id, { name: subEditForm.name, cost: Number(subEditForm.cost), frequency: subEditForm.frequency }); setEditingSubId(null); }} style={{ background: '#3dd68c', color: '#0f172a', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>Lưu</button>
                          <button type="button" onClick={() => setEditingSubId(null)} style={{ background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '0.78rem', cursor: 'pointer' }}>Hủy</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{sub.name}</h4>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => { setEditingSubId(sub.id); setSubEditForm({ name: sub.name, cost: String(sub.cost), frequency: sub.frequency }); }} title="Sửa" style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Pencil size={15} /></button>
                          <button onClick={() => deleteSubscription(sub.id)} title="Xóa" style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                      <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#3dd68c' }}>{sub.cost.toLocaleString()}đ</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/ {sub.frequency === 'yearly' ? 'năm' : 'tháng'}</div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px' }}>
                        Gia hạn: {new Date(sub.renewalDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- INVENTORY & PAO TAB --- */}
        {activeTab === 'inventory' && (
          <InventoryTracker items={inventoryItems} />
        )}

      </div>
    </div>
  );
}
