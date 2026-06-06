'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, Plus, Trash2, Smartphone, BookOpen } from 'lucide-react';
import { InformationDietLog } from '@prisma/client';
import { logInformationDiet } from '@/app/mental/actions';

interface Props {
  logs: InformationDietLog[];
}

export default function InformationDiet({ logs }: Props) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await logInformationDiet(new FormData(e.currentTarget));
    e.currentTarget.reset();
    setLoading(false);
  };

  // Tính tổng số phút cho hôm nay (hoặc tổng thể)
  const totalJunk = logs.reduce((acc, log) => acc + log.junkTime, 0);
  const totalValue = logs.reduce((acc, log) => acc + log.valuableTime, 0);
  
  const pieData = [
    { name: 'Junk Content', value: totalJunk, color: '#ef4444' },
    { name: 'Value Content', value: totalValue, color: '#10b981' },
  ];

  const ratio = totalValue === 0 ? 0 : (totalJunk / totalValue).toFixed(1);

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h3 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', color: '#fff' }}>
        <div style={{ background: 'rgba(236,72,153,0.15)', padding: '8px', borderRadius: '10px' }}>
          <Activity size={22} color="#ec4899" />
        </div>
        Information Diet
      </h3>
      <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>
        Ăn kiêng thông tin. Ghi nhận thời gian tiêu thụ nội dung rác (MXH) so với nội dung giá trị (tài liệu/học tập).
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginTop: '12px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#fca5a5', fontWeight: 600 }}>
              <Smartphone size={16} /> Junk Time (phút)
            </label>
            <input type="number" name="junkTime" placeholder="VD: 60" required style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#fff', outline: 'none' }} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#6ee7b7', fontWeight: 600 }}>
              <BookOpen size={16} /> Value Time (phút)
            </label>
            <input type="number" name="valuableTime" placeholder="VD: 120" required style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.05)', color: '#fff', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>Ghi chú nhanh</label>
            <input name="notes" placeholder="VD: Cuốn quá lướt TikTok mất 1 tiếng" style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
          </div>

          <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s', marginTop: '8px' }}>
            {loading ? 'Đang lưu...' : <><Plus size={18} /> Ghi log hôm nay</>}
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px' }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: '1rem' }}>Tỷ lệ tiêu thụ (Junk / Value)</h4>
          {totalJunk === 0 && totalValue === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>Chưa có dữ liệu cho biểu đồ.</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                    itemStyle={{ color: '#fff' }} 
                    formatter={(value: any) => value + ' phút'}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '16px', fontSize: '0.9rem', color: '#cbd5e1', textAlign: 'center', lineHeight: 1.6 }}>
                Bạn dành <strong>{ratio}x</strong> thời gian cho thông tin rác so với thông tin giá trị.<br/>
                {Number(ratio) > 1 ? (
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>Cảnh báo: Cần giảm tải giải trí ngay!</span>
                ) : (
                  <span style={{ color: '#10b981', fontWeight: 600 }}>Tuyệt vời: Bạn đang hấp thụ tri thức tốt.</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
