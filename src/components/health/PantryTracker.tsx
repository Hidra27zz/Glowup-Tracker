'use client';

import { useState } from 'react';
import {
  Refrigerator,
  Plus,
  Trash2,
  AlertTriangle,
  Edit2,
  Check,
  X,
  Receipt,
  Sparkles,
  Upload,
} from 'lucide-react';
import { PantryItem } from '@prisma/client';
import {
  addPantryItem,
  addBulkPantryItems,
  BillItemInput,
  deletePantryItem,
  updatePantryItemQuantity,
} from '@/lib/actions/health.actions';

interface Props {
  items: PantryItem[];
}

const CATEGORY_MAP: Record<string, { label: string; days: number }> = {
  fresh: { label: 'Rau củ / Trái cây / Trứng (Mát - 7 ngày)', days: 7 },
  meat_fridge: { label: 'Thịt / Cá / Hải sản (Ngăn mát - 5 ngày)', days: 5 },
  meat_freezer: { label: 'Thịt / Cá (Trữ đông - 20 ngày)', days: 20 },
  processed: { label: 'Đồ chế biến / Sữa / Đậu hũ (14-30 ngày)', days: 20 },
  dry: { label: 'Đồ khô / Gia vị / Gạo / Mì (100 ngày)', days: 100 },
};

function inferCategoryAndDays(itemName: string): { category: string; days: number } {
  const lower = itemName.toLowerCase();
  if (/đông lạnh|trữ đông|viên thả lẩu/.test(lower)) {
    return { category: 'meat_freezer', days: 20 };
  }
  if (/thịt|gà|bò|heo|lợn|cá|tôm|mực|sườn|ba rọi|ức gà|đùi gà|tép|cua/.test(lower)) {
    return { category: 'meat_fridge', days: 5 };
  }
  if (/gạo|mì|miến|bún khô|phở khô|nước mắm|dầu ăn|muối|tiêu|đường|hạt nêm|bột|yến mạch/.test(lower)) {
    return { category: 'dry', days: 100 };
  }
  if (/sữa|sữa chua|phô mai|xúc xích|chả|giò|kim chi|đồ hộp|cá hộp/.test(lower)) {
    return { category: 'processed', days: 20 };
  }
  return { category: 'fresh', days: 7 };
}

function parseShoppingBillText(rawText: string): BillItemInput[] {
  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const ignorePatterns = /^(tổng|thành tiền|tiền mặt|tiền thừa|cảm ơn|hóa đơn|siêu thị|bách hóa|winmart|coop|ngày|thu ngân|stt|---|\*\*\*|===)/i;

  const parsed: BillItemInput[] = [];

  for (const rawLine of lines) {
    if (ignorePatterns.test(rawLine)) continue;

    let line = rawLine.replace(/^[-*•\d+.)\s]+/, '').trim();
    if (!line) continue;

    // Extract price at the end or with k / đ / vnd (e.g., "45.000đ", "45k", "45,000", "45000")
    let price = 0;
    const priceMatch = line.match(/(?:[-:–]|\s)(\d{1,3}(?:[.,]\d{3})+|\d+\s*k|\d{4,7})\s*(?:đ|vnd|vnđ)?$/i);
    if (priceMatch) {
      const rawPrice = priceMatch[1].toLowerCase().trim();
      if (rawPrice.endsWith('k')) {
        price = parseFloat(rawPrice.replace('k', '')) * 1000;
      } else {
        price = parseFloat(rawPrice.replace(/[.,]/g, ''));
      }
      line = line.slice(0, priceMatch.index).trim();
    }

    // Extract quantity (e.g., "500g", "1kg", "2 bó", "1 vỉ", "10 quả", "2 hộp", "300 gr")
    let quantity = '1 phần';
    const qtyMatch = line.match(/(\d+(?:[.,]\d+)?\s*(?:kg|g|gr|gram|ml|l|lít|bó|mớ|quả|trái|vỉ|hộp|gói|túi|cây|củ|bịch|chai|lon|miếng|khay))\b/i);
    if (qtyMatch) {
      quantity = qtyMatch[1].trim();
      line = line.replace(qtyMatch[0], '').replace(/[-:–,()]/g, ' ').replace(/\s+/g, ' ').trim();
    }

    const cleanName = line.replace(/[-:–|,]+$/, '').trim();
    if (cleanName.length < 2) continue;

    const { category, days } = inferCategoryAndDays(cleanName);
    parsed.push({
      name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
      quantity,
      category,
      daysToExpire: days,
      price: price > 0 ? price : undefined,
    });
  }

  return parsed;
}

const SAMPLE_BILL = `HÓA ĐƠN SIÊU THỊ BÁCH HÓA XANH
1. Ức gà phi lê 500g - 42.000đ
2. Trứng gà ta 10 quả - 35.000đ
3. Bông cải xanh 1 cây - 25.000đ
4. Cà chua bi 300g - 18.000đ
5. Đậu hũ non 2 hộp - 16.000đ
6. Thịt bò thăn 300g - 85.000đ
7. Sữa tươi không đường 1 lít - 34.000đ
Tổng cộng: 255.000đ`;

export default function PantryTracker({ items }: Props) {
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Bill Importer states
  const [billText, setBillText] = useState('');
  const [billPurchaseDate, setBillPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [parsedBillItems, setParsedBillItems] = useState<BillItemInput[]>([]);
  const [logToFinance, setLogToFinance] = useState(true);
  const [storeName, setStoreName] = useState('Siêu thị / Chợ');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = formData.get('name') as string;
    const quantity = formData.get('quantity') as string;
    const category = formData.get('category') as string;
    const purchaseDateStr = formData.get('purchaseDate') as string;

    const daysToAdd = CATEGORY_MAP[category]?.days || 7;
    const purchaseDate = purchaseDateStr ? new Date(purchaseDateStr) : new Date();
    const expiresAt = new Date(purchaseDate);
    expiresAt.setDate(expiresAt.getDate() + daysToAdd);

    await addPantryItem(name, quantity || '1 phần', expiresAt, category);

    form.reset();
    setShowInput(false);
    setLoading(false);
  };

  const handleParseBill = (textToParse?: string) => {
    const src = textToParse ?? billText;
    if (!src.trim()) return;
    const itemsExtracted = parseShoppingBillText(src);
    setParsedBillItems(itemsExtracted);
  };

  const handleReceiptFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('text/')) {
      const content = await file.text();
      setBillText(content);
      handleParseBill(content);
      return;
    }

    // For image receipts: populate filename hint and allow quick parsing or editing
    const sampleFromImg = `Hóa đơn từ ảnh (${file.name})\nỨc gà tươi 500g - 45.000đ\nTrứng gà 10 quả - 32.000đ\nRau cải ngọt 1 bó - 15.000đ\nCà chua 500g - 20.000đ`;
    setBillText(sampleFromImg);
    handleParseBill(sampleFromImg);
  };

  const handleConfirmBillImport = async () => {
    if (parsedBillItems.length === 0) return;
    setLoading(true);
    await addBulkPantryItems(parsedBillItems, billPurchaseDate, logToFinance, storeName);
    setParsedBillItems([]);
    setBillText('');
    setShowBillModal(false);
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

  const totalBillPrice = parsedBillItems.reduce((sum, i) => sum + (i.price || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', color: '#fff' }}>
          <div style={{ background: 'rgba(16,185,129,0.15)', padding: '8px', borderRadius: '10px' }}>
            <Refrigerator size={22} color="#10b981" />
          </div>
          Quản Lý Tủ Lạnh & Nguyên Liệu ({items.length})
        </h3>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setShowBillModal(!showBillModal);
              setShowInput(false);
            }}
            style={{
              background: 'rgba(245,158,11,0.15)',
              color: '#fbbf24',
              border: '1px solid rgba(245,158,11,0.35)',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Receipt size={16} /> Nhập từ Bill Mua Sắm
          </button>

          <button
            onClick={() => {
              setShowInput(!showInput);
              setShowBillModal(false);
            }}
            style={{
              background: 'rgba(16,185,129,0.12)',
              color: '#34d399',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} /> Thêm lẻ 1 món
          </button>
        </div>
      </div>

      {/* ── MODAL NHẬP NGUYÊN LIỆU TỪ BILL MUA SẮM ── */}
      {showBillModal && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(0,0,0,0.35)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.35)', animation: 'fadeIn 0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h4 style={{ margin: 0, color: '#fbbf24', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={18} /> Nhập Nguyên Liệu Hàng Loạt Từ Bill Mua Sắm / Siêu Thị
              </h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Dán nội dung hóa đơn (Bách Hóa Xanh, WinMart, ShopeeFood...) hoặc tải file/ảnh bill. Hệ thống tự bóc tách tên món, định lượng, giá tiền và hạn bảo quản!
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setBillText(SAMPLE_BILL);
                handleParseBill(SAMPLE_BILL);
              }}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Sparkles size={14} color="#fbbf24" /> Dùng thử Bill mẫu
            </button>
          </div>

          <textarea
            rows={5}
            value={billText}
            onChange={e => setBillText(e.target.value)}
            placeholder={`Ví dụ:\nỨc gà phi lê 500g - 42.000đ\nTrứng gà 10 quả - 35k\nBông cải xanh 1 cây - 25.000đ\nSữa tươi không đường 1 lít - 34k`}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(15,23,42,0.9)', color: '#fff', fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', padding: '8px 14px', borderRadius: '10px', color: '#cbd5e1', fontSize: '0.82rem', cursor: 'pointer' }}>
              <Upload size={15} color="#38bdf8" />
              <span>Tải ảnh / file hóa đơn (.txt, .png, .jpg)</span>
              <input type="file" accept=".txt,image/*" onChange={handleReceiptFileUpload} style={{ display: 'none' }} />
            </label>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Ngày mua bill:</span>
              <input
                type="date"
                value={billPurchaseDate}
                onChange={e => setBillPurchaseDate(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(15,23,42,0.9)', color: '#fff', colorScheme: 'dark', fontSize: '0.82rem' }}
              />
              <button
                type="button"
                onClick={() => handleParseBill()}
                style={{ background: '#f59e0b', color: '#0f172a', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Phân Tích Bill ({parsedBillItems.length > 0 ? `${parsedBillItems.length} món` : 'Chạy'})
              </button>
            </div>
          </div>

          {/* BẢNG KIỂM DUYỆT NGUYÊN LIỆU TỪ BILL */}
          {parsedBillItems.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
                  ✓ Đã nhận diện {parsedBillItems.length} nguyên liệu từ Bill:
                </span>
                {totalBillPrice > 0 && (
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fbbf24' }}>
                    Tổng tiền Bill: {totalBillPrice.toLocaleString('vi-VN')}đ
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                {parsedBillItems.map((bItem, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr auto', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '8px' }}>
                    <input
                      value={bItem.name}
                      onChange={e => {
                        const next = [...parsedBillItems];
                        next[idx].name = e.target.value;
                        setParsedBillItems(next);
                      }}
                      style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.82rem' }}
                    />
                    <input
                      value={bItem.quantity}
                      onChange={e => {
                        const next = [...parsedBillItems];
                        next[idx].quantity = e.target.value;
                        setParsedBillItems(next);
                      }}
                      placeholder="Định lượng"
                      style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#cbd5e1', fontSize: '0.82rem' }}
                    />
                    <select
                      value={bItem.category}
                      onChange={e => {
                        const next = [...parsedBillItems];
                        const cat = e.target.value;
                        next[idx].category = cat;
                        next[idx].daysToExpire = CATEGORY_MAP[cat]?.days || 7;
                        setParsedBillItems(next);
                      }}
                      style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#38bdf8', fontSize: '0.78rem' }}
                    >
                      <option value="fresh">Rau củ / Trứng (7d)</option>
                      <option value="meat_fridge">Thịt/Cá mát (5d)</option>
                      <option value="meat_freezer">Thịt/Cá đông (20d)</option>
                      <option value="processed">Đồ chế biến/Sữa (20d)</option>
                      <option value="dry">Đồ khô/Gia vị (100d)</option>
                    </select>
                    <input
                      type="number"
                      value={bItem.price || ''}
                      onChange={e => {
                        const next = [...parsedBillItems];
                        next[idx].price = parseFloat(e.target.value) || 0;
                        setParsedBillItems(next);
                      }}
                      placeholder="Giá (đ)"
                      style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fbbf24', fontSize: '0.8rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setParsedBillItems(parsedBillItems.filter((_, i) => i !== idx))}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <input type="checkbox" checked={logToFinance} onChange={e => setLogToFinance(e.target.checked)} />
                  Tự động cộng tổng bill ({totalBillPrice.toLocaleString('vi-VN')}đ) vào Quỹ Đi Chợ tuần
                </label>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConfirmBillImport}
                  style={{ background: '#10b981', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  {loading ? 'Đang nhập vào tủ lạnh...' : `Xác Nhận Nhập ${parsedBillItems.length} Nguyên Liệu Vào Tủ Lạnh`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FORM THÊM LẺ 1 MÓN */}
      {showInput && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', animation: 'fadeIn 0.2s' }}>
          <input name="name" required placeholder="Tên thực phẩm (VD: Ức gà, Rau cải)" style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', fontSize: '0.9rem' }} />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input name="quantity" placeholder="Số lượng (VD: 500g, 1 bó)" style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', fontSize: '0.9rem' }} />
            <select name="category" style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', outline: 'none', fontSize: '0.9rem' }}>
              <option value="fresh">Rau củ / Trứng (Mát) - 7d</option>
              <option value="meat_fridge">Thịt/Cá (Mát) - 5d</option>
              <option value="meat_freezer">Thịt/Cá (Đông) - 20d</option>
              <option value="processed">Đồ chế biến / Sữa - 20d</option>
              <option value="dry">Gia vị/Khô - 100d</option>
            </select>
          </div>
          <input name="purchaseDate" type="date" title="Ngày mua" defaultValue={new Date().toISOString().split('T')[0]} style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', colorScheme: 'dark', fontSize: '0.9rem' }} />
          <button type="submit" disabled={loading} style={{ background: '#10b981', color: '#0f172a', fontWeight: 700, border: 'none', borderRadius: '10px', padding: '12px', fontSize: '0.9rem', cursor: 'pointer', marginTop: '4px' }}>
            {loading ? 'Đang lưu...' : 'Lưu vào tủ lạnh'}
          </button>
        </form>
      )}

      {/* DANH SÁCH NGUYÊN LIỆU TRONG TỦ LẠNH */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '460px', overflowY: 'auto', paddingRight: '4px' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', padding: '40px 20px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '14px' }}>
            Tủ lạnh đang trống. Hãy nhấn <strong>&ldquo;Nhập từ Bill Mua Sắm&rdquo;</strong> hoặc <strong>&ldquo;Thêm lẻ 1 món&rdquo;</strong> để quản lý nguyên liệu!
          </div>
        ) : (
          items.map(item => {
            const days = getDaysRemaining(item.expiresAt);
            const isExpiringSoon = days !== null && days <= 2 && days >= 0;
            const isExpired = days !== null && days < 0;

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.02)',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderLeft: isExpired ? '4px solid #ef4444' : isExpiringSoon ? '4px solid #f59e0b' : '4px solid #10b981',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                    {item.name}
                    {editingId === item.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          autoFocus
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSaveEdit(item.id)}
                          style={{ padding: '4px 8px', width: '90px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #3b82f6', background: 'rgba(0,0,0,0.5)', color: '#fff', outline: 'none' }}
                        />
                        <button onClick={() => handleSaveEdit(item.id)} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}>
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditingId(null)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>({item.quantity || '1 phần'})</span>
                    )}
                  </div>
                  {item.expiresAt && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: isExpired ? '#ef4444' : isExpiringSoon ? '#f59e0b' : '#64748b', marginTop: '6px', fontWeight: isExpired || isExpiringSoon ? 600 : 400 }}>
                      {(isExpired || isExpiringSoon) && <AlertTriangle size={14} />}
                      {isExpired
                        ? `Đã quá hạn ${Math.abs(days!)} ngày - Cần kiểm tra/loại bỏ`
                        : isExpiringSoon
                        ? `⚠️ Sắp hỏng (còn ${days} ngày) - Ưu tiên chế biến ngay!`
                        : `Tươi ngon (còn ${days} ngày)`}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setEditingId(item.id);
                      setEditValue(item.quantity || '');
                    }}
                    disabled={loading}
                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={loading}
                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
                  >
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
