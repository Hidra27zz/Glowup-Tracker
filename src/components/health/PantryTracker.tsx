'use client';

import { useState } from 'react';
import { Refrigerator, Plus, Trash2, AlertTriangle, Edit2, Check, X } from 'lucide-react';
import { PantryItem } from '@prisma/client';
import { addPantryItem, deletePantryItem, updatePantryItemQuantity } from '@/lib/actions/health.actions';

interface Props {
  items: PantryItem[];
}

export default function PantryTracker({ items }: Props) {
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const name = formData.get('name') as string;
    const quantity = formData.get('quantity') as string;
    const category = formData.get('category') as string;
    const purchaseDateStr = formData.get('purchaseDate') as string;
    
    let daysToAdd = 7;
    if (category === 'meat_fridge') daysToAdd = 5;
    else if (category === 'meat_freezer') daysToAdd = 20;
    else if (category === 'processed') daysToAdd = 30;
    else if (category === 'dry') daysToAdd = 100;

    const purchaseDate = purchaseDateStr ? new Date(purchaseDateStr) : new Date();
    const expiresAt = new Date(purchaseDate);
    expiresAt.setDate(expiresAt.getDate() + daysToAdd);
    
    await addPantryItem(name, quantity, expiresAt);
    
    form.reset();
    setShowInput(false);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    await deletePantryItem(id);
    setLoading(false);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editValue.trim()) return;
    setLoading(true);
    await updatePantryItemQuantity(id, editValue);
    setEditingId(null);
    setLoading(false);
  };

  const getDaysRemaining = (expiresAt: Date | null) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', color: '#fff' }}>
          <div style={{ background: 'rgba(16,185,129,0.15)', padding: '8px', borderRadius: '10px' }}>
            <Refrigerator size={22} color="#10b981" />
          </div>
          Grocery & Pantry
        </h3>
        <button 
          onClick={() => setShowInput(!showInput)}
          style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '8px 14px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <Plus size={16} /> Thêm món
        </button>
      </div>

      {showInput && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', animation: 'fadeIn 0.2s' }}>
          <input name="name" required placeholder="Tên thực phẩm (VD: Ức gà, Rau cải)" style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', fontSize: '0.9rem' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <input name="quantity" placeholder="Số lượng (VD: 500g)" style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', fontSize: '0.9rem' }} />
            <select name="category" style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', outline: 'none', fontSize: '0.9rem' }}>
              <option value="fresh">Rau củ (Mát) - 7d</option>
              <option value="meat_fridge">Thịt/Cá (Mát) - 5d</option>
              <option value="meat_freezer">Thịt/Cá (Đông) - 20d</option>
              <option value="processed">Đồ chế biến - 30d</option>
              <option value="dry">Gia vị/Khô - 100d</option>
            </select>
          </div>
          <input name="purchaseDate" type="date" title="Ngày mua" defaultValue={new Date().toISOString().split('T')[0]} style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', colorScheme: 'dark', fontSize: '0.9rem' }} />
          <button type="submit" disabled={loading} style={{ background: '#10b981', color: '#0f172a', fontWeight: 700, border: 'none', borderRadius: '10px', padding: '12px', fontSize: '0.9rem', cursor: 'pointer', marginTop: '4px' }}>
            {loading ? 'Đang lưu...' : 'Lưu vào tủ lạnh'}
          </button>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', padding: '40px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '14px' }}>Tủ lạnh đang trống. Thêm thực phẩm ngay.</div>
        ) : (
          items.map(item => {
            const days = getDaysRemaining(item.expiresAt);
            const isExpiringSoon = days !== null && days <= 2 && days >= 0;
            const isExpired = days !== null && days < 0;

            return (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', borderLeft: isExpired ? '4px solid #ef4444' : isExpiringSoon ? '4px solid #f59e0b' : '4px solid #10b981' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                    {item.name} 
                    {editingId === item.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input 
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(item.id)}
                          style={{ padding: '4px 8px', width: '90px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #3b82f6', background: 'rgba(0,0,0,0.5)', color: '#fff', outline: 'none' }}
                        />
                        <button onClick={() => handleSaveEdit(item.id)} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}><Check size={16}/></button>
                        <button onClick={() => setEditingId(null)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}><X size={16}/></button>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>
                        ({item.quantity})
                      </span>
                    )}
                  </div>
                  {item.expiresAt && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: isExpired ? '#ef4444' : isExpiringSoon ? '#f59e0b' : '#64748b', marginTop: '6px', fontWeight: (isExpired || isExpiringSoon) ? 600 : 400 }}>
                      {(isExpired || isExpiringSoon) && <AlertTriangle size={14} />}
                      {isExpired ? 'Đã hết hạn' : isExpiringSoon ? `Sắp hỏng (còn ${days} ngày)` : `Fresh (còn ${days} ngày)`}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setEditingId(item.id); setEditValue(item.quantity || ''); }} disabled={loading} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='#38bdf8'} onMouseLeave={e => e.currentTarget.style.color='#cbd5e1'}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} disabled={loading} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='#ef4444'} onMouseLeave={e => e.currentTarget.style.color='#cbd5e1'}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
