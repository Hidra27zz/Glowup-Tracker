'use client';

import { useState, useMemo } from 'react';
import {
  ChefHat,
  ShoppingBasket,
  Clock,
  Flame,
  ChevronRight,
  Video,
  Play,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Utensils,
} from 'lucide-react';
import { PantryItem } from '@prisma/client';
import PantryTracker from '@/components/health/PantryTracker';
import { searchYoutubeRecipes, DynamicYoutubeWorkout } from '@/lib/actions/youtube.actions';
import { logNutrition } from '@/lib/actions/health.actions';

interface Props {
  pantryItems: PantryItem[];
}

interface RecipeSuggestion {
  id: string;
  title: string;
  tag: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number;
  keywords: string[];
  ingredientsList: string[];
  steps: string[];
}

const BUILTIN_RECIPES: RecipeSuggestion[] = [
  {
    id: 'r1',
    title: 'Ức Gà Áp Chảo Bông Cải Xanh & Trứng',
    tag: 'Eat Clean • Giàu Protein',
    calories: 420,
    protein: 45,
    carbs: 18,
    fat: 14,
    prepTime: 15,
    keywords: ['ức gà', 'gà', 'bông cải', 'súp lơ', 'trứng'],
    ingredientsList: ['Ức gà (200g)', 'Bông cải xanh (150g)', 'Trứng gà (1 quả)', 'Tỏi, tiêu đen, dầu oliu'],
    steps: [
      'Thái ức gà dày vừa phải, ướp muối hồng, tiêu đen và tỏi băm 10 phút.',
      'Luộc sơ bông cải xanh 2 phút với chút muối để giữ độ giòn xanh.',
      'Áp chảo ức gà mỗi mặt 4-5 phút đến khi vàng đều, ốp la thêm 1 quả trứng và thưởng thức.',
    ],
  },
  {
    id: 'r2',
    title: 'Canh Đậu Hũ Non Cà Chua Trứng Vân Mây',
    tag: 'Thanh Đạm • Nhanh Gọn',
    calories: 260,
    protein: 18,
    carbs: 14,
    fat: 12,
    prepTime: 10,
    keywords: ['đậu hũ', 'đậu phụ', 'cà chua', 'trứng', 'hành'],
    ingredientsList: ['Đậu hũ non (1 hộp)', 'Cà chua (2 quả)', 'Trứng gà (2 quả)', 'Hành lá, ngò rí'],
    steps: [
      'Cà chua thái múi cau, xào mềm với chút dầu rồi thêm 500ml nước đun sôi.',
      'Cắt đậu hũ non thành khối vuông nhỏ thả nhẹ vào nồi.',
      'Đánh tan trứng gà, khuấy nhẹ nồi nước theo 1 chiều rồi đổ trứng từ từ tạo vân mây, rắc hành ngò.',
    ],
  },
  {
    id: 'r3',
    title: 'Thịt Bò Xào Bông Cải / Rau Cải Tỏi Thơm',
    tag: 'Tăng Cơ • Bổ Máu',
    calories: 390,
    protein: 34,
    carbs: 12,
    fat: 20,
    prepTime: 12,
    keywords: ['thịt bò', 'bò', 'bông cải', 'rau cải', 'cải', 'tỏi'],
    ingredientsList: ['Thịt bò thăn (150g)', 'Bông cải hoặc Rau cải (200g)', 'Tỏi đập dập, dầu hào'],
    steps: [
      'Thịt bò thái mỏng ngang thớ, ướp tỏi, 1 muỗng dầu hào và chút tiêu.',
      'Xào rau cải / bông cải trên lửa lớn cho chín tới rồi trút ra đĩa.',
      'Phi thơm tỏi, đảo nhanh thịt bò trên lửa lớn 1-2 phút cho mềm ngọt rồi trộn cùng rau.',
    ],
  },
  {
    id: 'r4',
    title: 'Trứng Cuộn Cà Chua & Rau Củ Giàu Dinh Dưỡng',
    tag: 'Bữa Sáng / Tối 10 Phút',
    calories: 310,
    protein: 21,
    carbs: 10,
    fat: 18,
    prepTime: 10,
    keywords: ['trứng', 'cà chua', 'rau', 'sữa', 'hành'],
    ingredientsList: ['Trứng gà (3 quả)', 'Cà chua (1 quả)', 'Sữa tươi không đường (20ml)', 'Hành lá'],
    steps: [
      'Cà chua bỏ hạt thái hạt lựu nhỏ, hành lá cắt nhỏ.',
      'Đánh đều 3 quả trứng cùng 20ml sữa tươi (giúp trứng mềm xốp), cà chua và hành lá.',
      'Tráng từng lớp mỏng trên chảo chống dính và cuộn tròn đều tay.',
    ],
  },
  {
    id: 'r5',
    title: 'Cá Áp Chảo Sốt Cà Chua / Chanh Dây',
    tag: 'Omega-3 • Tốt Cho Não Bộ',
    calories: 410,
    protein: 36,
    carbs: 15,
    fat: 22,
    prepTime: 20,
    keywords: ['cá', 'cá hồi', 'cá basa', 'cá thu', 'cà chua'],
    ingredientsList: ['Cá phi lê (200g)', 'Cà chua hoặc Chanh (1-2 quả)', 'Tỏi, gừng, hành lá'],
    steps: [
      'Thấm khô miếng cá, ướp chút muối tiêu rồi áp chảo vàng giòn 2 mặt.',
      'Làm sốt cà chua băm nhuyễn rim cùng tỏi phi thơm, rưới đều lên cá nóng.',
    ],
  },
  {
    id: 'r6',
    title: 'Đậu Hũ Sốt Cà Chua Thịt Bằm / Nấm',
    tag: 'Cơm Nhà Quốc Dân',
    calories: 350,
    protein: 24,
    carbs: 18,
    fat: 16,
    prepTime: 15,
    keywords: ['đậu hũ', 'đậu phụ', 'cà chua', 'thịt heo', 'thịt', 'nấm'],
    ingredientsList: ['Đậu hũ (2 bìa)', 'Cà chua (2 quả)', 'Thịt bằm hoặc Nấm (100g)', 'Hành lá'],
    steps: [
      'Đậu hũ cắt miếng vừa ăn, áp chảo ít dầu cho vàng nhẹ các mặt.',
      'Xào chín thịt bằm/nấm cùng cà chua băm nhuyễn tạo sốt sánh đậm đà.',
      'Cho đậu hũ vào rim lửa nhỏ 5 phút cho thấm sốt, rắc hành lá.',
    ],
  },
  {
    id: 'r7',
    title: 'Gà Xào Sả Ớt / Gừng Đậm Đà Hao Cơm',
    tag: 'Ấm Bụng • Giàu Đạm',
    calories: 440,
    protein: 38,
    carbs: 12,
    fat: 24,
    prepTime: 20,
    keywords: ['gà', 'ức gà', 'đùi gà', 'thịt gà'],
    ingredientsList: ['Thịt gà / Ức gà (250g)', 'Sả băm hoặc Gừng thái sợi', 'Ớt, tỏi, nước mắm'],
    steps: [
      'Thịt gà thái miếng vừa ăn, ướp nước mắm, tiêu và chút sả/gừng.',
      'Phi thơm sả tỏi, cho gà vào đảo săn trên lửa vừa đến khi vàng óng dậy mùi thơm.',
    ],
  },
  {
    id: 'r8',
    title: 'Salad Rau Củ Trứng Luộc & Ức Gà / Cá Ngừ',
    tag: 'Giảm Mỡ • Low Carb',
    calories: 320,
    protein: 32,
    carbs: 14,
    fat: 12,
    prepTime: 10,
    keywords: ['rau', 'xà lách', 'cà chua', 'dưa leo', 'trứng', 'ức gà', 'sữa chua'],
    ingredientsList: ['Rau xanh / Cà chua bi (200g)', 'Trứng luộc (2 quả)', 'Ức gà xé hoặc Cá ngừ', 'Sốt mè rang hoặc Sữa chua'],
    steps: [
      'Rửa sạch rau củ, cà chua bi bổ đôi, trứng gà luộc lòng đào cắt múi.',
      'Xếp nguyên liệu ra tô lớn, thêm đạm (ức gà/trứng) và trộn sốt trước khi ăn.',
    ],
  },
];

const TABS = [
  { id: 'pantry', label: 'Quản Lý Tủ Lạnh & Nhập Bill', icon: ShoppingBasket, accent: '#10b981' },
  { id: 'recipes', label: 'Đề Xuất Món Ăn Theo Nguyên Liệu', icon: ChefHat, accent: '#f59e0b' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function NutritionHub({ pantryItems }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('pantry');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [videos, setVideos] = useState<DynamicYoutubeWorkout[]>([]);
  const [loggedRecipeId, setLoggedRecipeId] = useState<string | null>(null);

  const currentTab = TABS.find(t => t.id === activeTab)!;

  // Identify expiring soon items (<= 2 days)
  const expiringNames = useMemo(() => {
    const now = new Date().getTime();
    return pantryItems
      .filter(i => {
        if (!i.expiresAt) return false;
        const days = Math.ceil((new Date(i.expiresAt).getTime() - now) / 86400000);
        return days <= 2;
      })
      .map(i => i.name.toLowerCase());
  }, [pantryItems]);

  // Active ingredient pool: if user selected specific ingredients, prioritize them; otherwise use all fridge items
  const activeIngredientNames = useMemo(() => {
    if (selectedIngredients.length > 0) return selectedIngredients;
    return pantryItems.map(i => i.name);
  }, [selectedIngredients, pantryItems]);

  // Match recipes against fridge / selected ingredients
  const matchedRecipes = useMemo(() => {
    const lowerPool = activeIngredientNames.map(n => n.toLowerCase());

    const scored = BUILTIN_RECIPES.map(recipe => {
      const matchedItems: string[] = [];
      let usesExpiring = false;

      for (const kw of recipe.keywords) {
        const found = activeIngredientNames.find(pName => pName.toLowerCase().includes(kw) || kw.includes(pName.toLowerCase()));
        if (found && !matchedItems.includes(found)) {
          matchedItems.push(found);
          if (expiringNames.some(en => found.toLowerCase().includes(en))) {
            usesExpiring = true;
          }
        }
      }

      const matchRatio = recipe.keywords.length > 0 ? matchedItems.length / Math.min(recipe.keywords.length, 3) : 0;
      const matchPercent = Math.min(100, Math.round(matchRatio * 100));

      return {
        ...recipe,
        matchedItems,
        matchCount: matchedItems.length,
        matchPercent,
        usesExpiring,
      };
    });

    // If user selected custom ingredients that don't strongly match built-in recipes, also synthesize a custom chef dish
    if (activeIngredientNames.length > 0) {
      const customDish = {
        id: 'custom-combo',
        title: `Món Kết Hợp Tủ Lạnh: ${activeIngredientNames.slice(0, 3).join(' + ')}`,
        tag: 'Gợi ý linh hoạt theo đúng nguyên liệu đang chọn',
        calories: 380,
        protein: 30,
        carbs: 22,
        fat: 15,
        prepTime: 15,
        keywords: activeIngredientNames,
        ingredientsList: [...activeIngredientNames.map(n => `${n} (Sẵn trong tủ)`), 'Tỏi, hành, gia vị cơ bản'],
        steps: [
          `Sơ chế sạch các nguyên liệu có sẵn trong tủ: ${activeIngredientNames.join(', ')}.`,
          'Ướp nguyên liệu đạm chính với chút muối, tiêu, tỏi băm trong 10 phút.',
          'Phi thơm tỏi, xào/áp chảo nguyên liệu đạm trước cho săn, sau đó kết hợp rau củ đảo lửa lớn để giữ trọn dinh dưỡng.',
        ],
        matchedItems: activeIngredientNames,
        matchCount: activeIngredientNames.length,
        matchPercent: 100,
        usesExpiring: activeIngredientNames.some(n => expiringNames.includes(n.toLowerCase())),
      };
      scored.unshift(customDish);
    }

    return scored.sort((a, b) => {
      if (a.usesExpiring && !b.usesExpiring) return -1;
      if (!a.usesExpiring && b.usesExpiring) return 1;
      return b.matchCount - a.matchCount;
    });
  }, [activeIngredientNames, expiringNames]);

  const handleSearchYoutube = async (customQueryIngredients?: string[]) => {
    const queryList = customQueryIngredients || (selectedIngredients.length > 0 ? selectedIngredients : pantryItems.slice(0, 3).map(i => i.name));
    if (queryList.length === 0) return;
    setIsSearching(true);
    try {
      const results = await searchYoutubeRecipes(queryList);
      setVideos(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCookAndLog = async (recipe: RecipeSuggestion) => {
    await logNutrition(recipe.calories, 0, recipe.protein, recipe.carbs, recipe.fat);
    setLoggedRecipeId(recipe.id);
    setTimeout(() => setLoggedRecipeId(null), 3000);
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
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '14px 8px',
                borderRadius: '14px',
                border: 'none',
                background: active ? `linear-gradient(135deg, ${tab.accent}22, ${tab.accent}10)` : 'transparent',
                borderBottom: active ? `2px solid ${tab.accent}` : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none',
              }}
            >
              <Icon size={18} color={active ? tab.accent : '#64748b'} strokeWidth={active ? 2.5 : 1.5} />
              <span style={{ fontSize: '0.78rem', fontWeight: active ? 700 : 500, color: active ? tab.accent : '#64748b' }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Breadcrumb strip ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px', background: 'rgba(15,23,42,0.5)', borderLeft: '1px solid rgba(255,255,255,0.06)', borderRight: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#475569' }}>Nutrition & Fridge Hub</span>
          <ChevronRight size={12} color="#334155" />
          <span style={{ fontSize: '0.78rem', color: currentTab.accent, fontWeight: 600 }}>{currentTab.label}</span>
        </div>

        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
          Đang có <strong style={{ color: '#10b981' }}>{pantryItems.length}</strong> nguyên liệu trong tủ lạnh
        </div>
      </div>

      {/* ── Content panel ── */}
      <div style={{ flex: 1, background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', borderRadius: '0 0 20px 20px', padding: '24px', backdropFilter: 'blur(16px)' }}>
        {/* --- PANTRY TAB --- */}
        {activeTab === 'pantry' && (
          <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <PantryTracker items={pantryItems} />

            {pantryItems.length > 0 && (
              <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(16,185,129,0.08))', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '16px', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ChefHat size={24} color="#fbbf24" />
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.98rem' }}>
                      Tủ lạnh của bạn đang có {pantryItems.length} nguyên liệu sẵn sàng chế biến!
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>
                      Hệ thống đã tìm thấy các món ăn khớp với nguyên liệu hiện có (ưu tiên đồ sắp hết hạn).
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('recipes')}
                  style={{ background: '#f59e0b', color: '#0f172a', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.88rem' }}
                >
                  Xem Đề Xuất Món Ăn Ngay →
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- RECIPES TAB --- */}
        {activeTab === 'recipes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Ingredient selector bar */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                    <div style={{ background: 'rgba(245,158,11,0.15)', padding: '8px', borderRadius: '10px' }}>
                      <ChefHat size={22} color="#f59e0b" />
                    </div>
                    Đề Xuất Món Ăn Thông Minh Theo Tủ Lạnh
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#94a3b8' }}>
                    Chọn các nguyên liệu bạn muốn nấu hôm nay (hoặc để trống để hệ thống tự động gợi ý từ toàn bộ tủ lạnh).
                  </p>
                </div>

                {selectedIngredients.length > 0 && (
                  <button
                    onClick={() => setSelectedIngredients([])}
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Bỏ chọn ({selectedIngredients.length})
                  </button>
                )}
              </div>

              {pantryItems.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  Tủ lạnh đang trống. Hãy qua tab <strong>&ldquo;Quản Lý Tủ Lạnh & Nhập Bill&rdquo;</strong> để thêm nguyên liệu trước nhé!
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                  {pantryItems.map(item => {
                    const isSelected = selectedIngredients.includes(item.name);
                    const isExp = expiringNames.includes(item.name.toLowerCase());
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (isSelected) setSelectedIngredients(prev => prev.filter(i => i !== item.name));
                          else setSelectedIngredients(prev => [...prev, item.name]);
                        }}
                        style={{
                          background: isSelected ? 'rgba(245,158,11,0.22)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${isSelected ? '#f59e0b' : isExp ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                          color: isSelected ? '#fbbf24' : '#e2e8f0',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '0.88rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {isExp && <AlertTriangle size={13} color="#ef4444" />}
                        <span>{item.name}</span>
                        {item.quantity && <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>({item.quantity})</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => handleSearchYoutube()}
                disabled={(selectedIngredients.length === 0 && pantryItems.length === 0) || isSearching}
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center',
                }}
              >
                <Video size={18} />
                {isSearching ? 'Đang tìm video hướng dẫn...' : 'Tìm thêm Video Công Thức Trên YouTube'}
              </button>
            </div>

            {/* DANH SÁCH THỰC ĐƠN ĐỀ XUẤT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#fbbf24" /> Thực Đơn Gợi Ý Phù Hợp Nhất Với Tủ Lạnh Của Bạn
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '16px' }}>
                {matchedRecipes.map(recipe => {
                  const isLogged = loggedRecipeId === recipe.id;
                  return (
                    <div
                      key={recipe.id}
                      style={{
                        background: 'rgba(255,255,255,0.025)',
                        border: `1px solid ${recipe.usesExpiring ? 'rgba(245,158,11,0.45)' : recipe.matchCount > 0 ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.06)'}`,
                        borderRadius: '18px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
                              {recipe.tag}
                            </span>
                            {recipe.matchCount > 0 && (
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(16,185,129,0.18)', color: '#34d399' }}>
                                ✓ Có sẵn {recipe.matchedItems.join(', ')}
                              </span>
                            )}
                            {recipe.usesExpiring && (
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(245,158,11,0.2)', color: '#fbbf24' }}>
                                🔥 Giải cứu đồ sắp hết hạn
                              </span>
                            )}
                          </div>
                          <h4 style={{ margin: 0, color: '#fff', fontSize: '1.08rem', fontWeight: 700 }}>{recipe.title}</h4>
                        </div>
                      </div>

                      {/* Macros bar */}
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '10px', fontSize: '0.78rem' }}>
                        <span style={{ color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Flame size={14} /> {recipe.calories} kcal
                        </span>
                        <span style={{ color: '#34d399', fontWeight: 600 }}>Đạm (P): {recipe.protein}g</span>
                        <span style={{ color: '#60a5fa', fontWeight: 600 }}>Tinh bột (C): {recipe.carbs}g</span>
                        <span style={{ color: '#f472b6', fontWeight: 600 }}>Béo (F): {recipe.fat}g</span>
                        <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                          <Clock size={13} /> {recipe.prepTime} phút
                        </span>
                      </div>

                      {/* Nguyên liệu & Cách làm */}
                      <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                        <strong style={{ color: '#94a3b8' }}>Nguyên liệu:</strong> {recipe.ingredientsList.join(' • ')}
                      </div>

                      <ol style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
                        {recipe.steps.map((st, idx) => (
                          <li key={idx}>{st}</li>
                        ))}
                      </ol>

                      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
                        <button
                          onClick={() => handleCookAndLog(recipe)}
                          style={{
                            flex: 1,
                            background: isLogged ? 'rgba(16,185,129,0.25)' : '#10b981',
                            color: isLogged ? '#34d399' : '#0f172a',
                            border: 'none',
                            padding: '9px 14px',
                            borderRadius: '10px',
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          {isLogged ? (
                            <>
                              <CheckCircle2 size={15} /> Đã cộng {recipe.calories} kcal vào Dinh Dưỡng hôm nay!
                            </>
                          ) : (
                            <>
                              <Utensils size={15} /> Nấu Món Này (+Log {recipe.calories} kcal)
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleSearchYoutube([recipe.title])}
                          style={{
                            background: 'rgba(239,68,68,0.15)',
                            color: '#fca5a5',
                            border: '1px solid rgba(239,68,68,0.3)',
                            padding: '9px 12px',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Play size={14} /> Video
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* YOUTUBE VIDEOS RESULTS */}
            {videos.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '1.05rem' }}>Video Hướng Dẫn Chi Tiết Trên YouTube</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {videos.map(video => (
                    <a
                      key={video.id}
                      href={`https://youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        padding: '16px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    >
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                        <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ background: 'rgba(239,68,68,0.9)', padding: '12px', borderRadius: '50%' }}>
                            <Play size={22} color="#fff" fill="#fff" />
                          </div>
                        </div>
                        <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#fff' }}>
                          {video.duration}
                        </div>
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', color: '#f1f5f9', lineHeight: 1.4 }}>{video.title}</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{video.channel}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
