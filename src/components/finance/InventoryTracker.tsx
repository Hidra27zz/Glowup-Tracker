'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Trash2, ArrowUpCircle, AlertTriangle, EyeOff, Pencil } from 'lucide-react';
import { InventoryItem } from '@prisma/client';
import { addInventoryItem, updateInventoryItem, incrementItemUse, deleteInventoryItem } from '@/app/finance/actions';

interface Props {
  items: InventoryItem[];
}

export default function InventoryTracker({ items }: Props) {
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', cost: '', uses: '' });

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await addInventoryItem(new FormData(e.currentTarget));
    e.currentTarget.reset();
    setLoading(false);
  };

  const handleIncrementUse = async (id: string) => {
    setLoading(true);
    await incrementItemUse(id);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xóa item này?')) {
      setLoading(true);
      await deleteInventoryItem(id);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
      
      <div style={{ background: 'rgba(123, 140, 255,0.1)', border: '1px solid rgba(123, 140, 255,0.3)', padding: '24px', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ background: 'rgba(123, 140, 255,0.2)', padding: '10px', borderRadius: '12px' }}>
          <ShoppingCart size={24} color="#7b8cff" />
        </div>
        <div>
          <h3 style={{ margin: '0 0 8px 0', color: '#7b8cff', fontSize: '1.1rem' }}>Cost-Per-Use & PAO Tracker</h3>
          <p style={{ margin: 0, color: '#bcc5ff', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Theo dõi giá trị chia cho số lần sử dụng của đồ đạc để thấy rõ ROI.
            Tính toán Period After Opening (PAO) cho mỹ phẩm để tránh dùng đồ hết hạn.
          </p>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input name="name" placeholder="Tên sản phẩm (VD: Retinol 1%, Áo khoác da)" required style={{ flex: '1 1 200px', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
          <input name="cost" type="number" placeholder="Giá mua (VNĐ)" required style={{ flex: '1 1 120px', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} />
          <input name="paoMonths" type="number" placeholder="PAO (số tháng, VD: 12)" style={{ flex: '1 1 120px', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none' }} title="Hạn sử dụng sau khi mở nắp (tháng)" />
          <button type="submit" disabled={loading} style={{ background: '#7b8cff', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Thêm đồ
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {items.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#64748b', padding: '40px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>Chưa có món đồ nào.</div>
        ) : (
          items.map(item => {
            const costPerUse = item.uses > 0 ? (item.cost / item.uses) : item.cost;
            let isExpired = false;
            let isExpiringSoon = false;
            let expirationDateStr = '';

            if (item.openedAt && item.paoMonths) {
              const openedDate = new Date(item.openedAt);
              const expiryDate = new Date(openedDate);
              expiryDate.setMonth(expiryDate.getMonth() + item.paoMonths);
              
              expirationDateStr = expiryDate.toLocaleDateString();
              const now = new Date();
              const diffMs = expiryDate.getTime() - now.getTime();
              const diffDays = diffMs / (1000 * 60 * 60 * 24);

              if (diffDays <= 0) {
                isExpired = true;
              } else if (diffDays <= 30) {
                isExpiringSoon = true;
              }
            }

            return (
              <div key={item.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {editingId === item.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Tên sản phẩm" style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: '0.85rem' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <input type="number" value={editForm.cost} onChange={e => setEditForm({ ...editForm, cost: e.target.value })} placeholder="Giá mua" style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: '0.85rem' }} />
                      <input type="number" value={editForm.uses} onChange={e => setEditForm({ ...editForm, uses: e.target.value })} placeholder="Số lần dùng" style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: '0.85rem' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button type="button" onClick={async () => { await updateInventoryItem(item.id, { name: editForm.name, cost: Number(editForm.cost), uses: Number(editForm.uses) }); setEditingId(null); }} style={{ background: '#3dd68c', color: '#0f172a', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>Lưu</button>
                      <button type="button" onClick={() => setEditingId(null)} style={{ background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '0.78rem', cursor: 'pointer' }}>Hủy</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '1.05rem' }}>{item.name}</h4>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => { setEditingId(item.id); setEditForm({ name: item.name, cost: String(item.cost), uses: String(item.uses) }); }} title="Sửa" style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(item.id)} title="Xóa" style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Giá: {item.cost.toLocaleString()}đ
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#e2e8f0', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '8px' }}>
                    Số lần dùng: <strong>{item.uses}</strong>
                    <button onClick={() => handleIncrementUse(item.id)} style={{ background: 'none', border: 'none', color: '#3dd68c', cursor: 'pointer', padding: '0 0 0 6px', display: 'flex' }}>
                      <ArrowUpCircle size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ background: 'rgba(123, 140, 255,0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(123, 140, 255,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#bcc5ff' }}>Cost Per Use (CPU)</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#7b8cff' }}>{costPerUse.toLocaleString(undefined, { maximumFractionDigits: 0 })}đ / lần</span>
                </div>

                {item.paoMonths && item.openedAt && (
                  <div style={{ marginTop: '4px', fontSize: '0.85rem', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', background: isExpired ? 'rgba(244, 109, 117,0.1)' : isExpiringSoon ? 'rgba(245, 185, 74,0.1)' : 'rgba(255,255,255,0.03)', color: isExpired ? '#f46d75' : isExpiringSoon ? '#f5b94a' : '#94a3b8', border: `1px solid ${isExpired ? 'rgba(244, 109, 117,0.3)' : isExpiringSoon ? 'rgba(245, 185, 74,0.3)' : 'transparent'}` }}>
                    {isExpired ? <EyeOff size={16} /> : isExpiringSoon ? <AlertTriangle size={16} /> : null}
                    {isExpired ? (
                      `Đã hết hạn PAO từ ${expirationDateStr}`
                    ) : (
                      `Hạn PAO: ${expirationDateStr} (${item.paoMonths} tháng)`
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
