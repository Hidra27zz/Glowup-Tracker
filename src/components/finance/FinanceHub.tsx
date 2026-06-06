'use client';

import { useState } from 'react';
import { Wallet, PieChart, ShoppingCart, RefreshCw, ChevronRight, Plus, Trash2, Check, X, ShieldAlert, AlertTriangle } from 'lucide-react';
import { FinancialTransaction, ImpulseBuyItem, Subscription, InventoryItem } from '@prisma/client';
import { addTransaction, deleteTransaction, addImpulseBuy, updateImpulseBuyStatus, deleteImpulseBuy, addSubscription, deleteSubscription } from '@/app/finance/actions';
import InventoryTracker from './InventoryTracker';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface Props {
  transactions: FinancialTransaction[];
  impulseBuys: ImpulseBuyItem[];
  subscriptions: Subscription[];
  inventoryItems: InventoryItem[];
}

const TABS = [
  { id: 'dashboard', label: 'Burn Rate', icon: PieChart, accent: '#3b82f6' },
  { id: 'impulse', label: 'Impulse Blocker', icon: ShieldAlert, accent: '#f59e0b' },
  { id: 'inventory', label: 'Inventory & PAO', icon: ShoppingCart, accent: '#8b5cf6' },
  { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCw, accent: '#10b981' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const CATEGORY_COLORS: Record<string, string> = {
  'Ăn uống': '#3b82f6',
  'Nhà ở': '#10b981',
  'Đi lại': '#f59e0b',
  'Giải trí': '#8b5cf6',
  'Sức khỏe': '#ec4899',
  'Khác': '#64748b'
};

export default function FinanceHub({ transactions, impulseBuys, subscriptions, inventoryItems }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [loading, setLoading] = useState(false);
  const currentTab = TABS.find(t => t.id === activeTab)!;

  // -- Burn Rate Data --
  const expenses = transactions.filter(t => t.type === 'expense');
  const income = transactions.filter(t => t.type === 'income');
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
        
        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(16,185,129,0.05))', padding: '24px', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.2)' }}>
                <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '1.1rem' }}>
                  <Wallet size={20} color="#3b82f6" /> Monthly Burn Rate
                </h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                  {burnRate.toLocaleString()}đ
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#10b981' }}>Thu nhập: {totalIncome.toLocaleString()}đ</span>
                  <span style={{ color: '#ef4444' }}>Chi tiêu: {totalExpense.toLocaleString()}đ</span>
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
                  <button type="submit" disabled={loading} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
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
                        contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
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
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', padding: '20px', borderRadius: '16px', display: 'flex', gap: '16px' }}>
              <ShieldAlert size={28} color="#f59e0b" style={{ flexShrink: 0 }} />
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#f59e0b', fontSize: '1.1rem' }}>Impulse Buy Blocker (Cooling-off Rule)</h3>
                <p style={{ margin: 0, color: '#fcd34d', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Bất cứ món đồ nào không thiết yếu bạn muốn mua, hãy thêm vào đây. 
                  Luật: Bắt buộc đợi <strong>72 giờ</strong> trước khi ra quyết định xuống tiền. Hệ thống sẽ khóa nút Mua cho đến khi hết hạn.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddImpulse} style={{ display: 'flex', gap: '12px' }}>
              <input name="name" placeholder="Tên món đồ (VD: Bàn phím cơ)" required style={{ flex: 2, padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
              <input name="price" type="number" placeholder="Giá tiền (VNĐ)" required style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
              <button type="submit" disabled={loading} style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: `1px solid ${item.status === 'WAITING' ? 'rgba(255,255,255,0.05)' : item.status === 'BOUGHT' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
                      <div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {item.name} 
                          {item.status === 'BOUGHT' && <span style={{ fontSize: '0.7rem', background: '#ef4444', padding: '2px 8px', borderRadius: '12px', color: '#fff' }}>ĐÃ MUA</span>}
                          {item.status === 'PASSED' && <span style={{ fontSize: '0.7rem', background: '#10b981', padding: '2px 8px', borderRadius: '12px', color: '#fff' }}>BỎ QUA</span>}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Giá: {item.price.toLocaleString()}đ • Thêm ngày: {new Date(item.addedAt).toLocaleDateString()}</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.status === 'WAITING' && (
                          <>
                            {!isReady ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '0.85rem', background: 'rgba(245,158,11,0.1)', padding: '6px 12px', borderRadius: '8px' }}>
                                <AlertTriangle size={14} /> Chờ {hoursLeft}h
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => updateImpulseBuyStatus(item.id, 'BOUGHT')} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Quyết định mua</button>
                                <button onClick={() => updateImpulseBuyStatus(item.id, 'PASSED')} style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Tự hào bỏ qua</button>
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
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#10b981', fontSize: '1.1rem' }}>Subscription Audit</h3>
                <p style={{ margin: 0, color: '#6ee7b7', fontSize: '0.9rem' }}>Theo dõi các khoản phí đăng ký dịch vụ định kỳ.</p>
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
              <button type="submit" disabled={loading} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} /> Thêm gói
              </button>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {subscriptions.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#64748b', padding: '40px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>Không có subscription nào.</div>
              ) : (
                subscriptions.map(sub => (
                  <div key={sub.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{sub.name}</h4>
                      <button onClick={() => deleteSubscription(sub.id)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                      <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34d399' }}>{sub.cost.toLocaleString()}đ</div>
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
