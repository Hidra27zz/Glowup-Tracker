'use client';

import { useState, useMemo, useEffect } from 'react';
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
  X,
  ExternalLink,
} from 'lucide-react';
import { PantryItem, NutritionLog, Recipe } from '@prisma/client';
import PantryTracker from '@/components/health/PantryTracker';
import { searchYoutubeRecipes, DynamicYoutubeWorkout } from '@/lib/actions/youtube.actions';
import { cookRecipeFromPantry } from '@/lib/actions/health.actions';

interface Props {
  pantryItems: PantryItem[];
  initialNutrition?: NutritionLog | null;
  initialCookedMeals?: Recipe[];
  goalCal?: number;
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
  youtubeId: string;
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
    youtubeId: 'kRCH8kD1GD0',
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
    youtubeId: 'dA0VGEbbw4g',
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
    youtubeId: '3vUtRRZG0xY',
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
    youtubeId: 'qW2tC22G7_k',
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
    youtubeId: 'M9F2wR2p8fA',
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
    youtubeId: 'vN8X4g7t1wE',
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
    youtubeId: 'hT_nvWreIhg',
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
    youtubeId: '5qap5aO4i9A',
    keywords: ['rau', 'xà lách', 'cà chua', 'dưa leo', 'trứng', 'ức gà', 'sữa chua'],
    ingredientsList: ['Rau xanh / Cà chua bi (200g)', 'Trứng luộc (2 quả)', 'Ức gà xé hoặc Cá ngừ', 'Sốt mè rang hoặc Sữa chua'],
    steps: [
      'Rửa sạch rau củ, cà chua bi bổ đôi, trứng gà luộc lòng đào cắt múi.',
      'Xếp nguyên liệu ra tô lớn, thêm đạm (ức gà/trứng) và trộn sốt trước khi ăn.',
    ],
  },
];

const TABS = [
  { id: 'pantry', label: 'Quản Lý Tủ Lạnh & Nhập Bill', icon: ShoppingBasket, accent: '#3dd68c' },
  { id: 'recipes', label: 'Đề Xuất Món Ăn Theo Nguyên Liệu', icon: ChefHat, accent: '#f5b94a' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function NutritionHub({
  pantryItems,
  initialNutrition = null,
  initialCookedMeals = [],
  goalCal = 1800,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('pantry');
  const [localPantryItems, setLocalPantryItems] = useState<PantryItem[]>(pantryItems);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [videos, setVideos] = useState<DynamicYoutubeWorkout[]>([]);
  const [activeYoutubeEmbedId, setActiveYoutubeEmbedId] = useState<string | null>(null);
  const [activeRecipeVideoCardId, setActiveRecipeVideoCardId] = useState<string | null>(null);
  const [recipeCustomVideoIds, setRecipeCustomVideoIds] = useState<Record<string, string>>({});

  // Live nutrition & cooked meals state
  const [nutritionStats, setNutritionStats] = useState({
    calories: initialNutrition?.calories || 0,
    protein: initialNutrition?.protein || 0,
    carbs: initialNutrition?.carbs || 0,
    fat: initialNutrition?.fat || 0,
  });
  const [cookedMeals, setCookedMeals] = useState<Recipe[]>(initialCookedMeals);
  const [cookingRecipeId, setCookingRecipeId] = useState<string | null>(null);
  const [lastCookFeedback, setLastCookFeedback] = useState<{
    recipeId: string;
    recipeTitle: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    consumedDetails: string[];
  } | null>(null);

  useEffect(() => {
    setLocalPantryItems(pantryItems);
  }, [pantryItems]);

  const currentTab = TABS.find(t => t.id === activeTab)!;

  // Identify expiring soon items (<= 2 days)
  const expiringNames = useMemo(() => {
    const now = new Date().getTime();
    return localPantryItems
      .filter(i => {
        if (!i.expiresAt) return false;
        const days = Math.ceil((new Date(i.expiresAt).getTime() - now) / 86400000);
        return days <= 2;
      })
      .map(i => i.name.toLowerCase());
  }, [localPantryItems]);

  // Active ingredient pool: if user selected specific ingredients, prioritize them; otherwise use all fridge items
  const activeIngredientNames = useMemo(() => {
    if (selectedIngredients.length > 0) return selectedIngredients;
    return localPantryItems.map(i => i.name);
  }, [selectedIngredients, localPantryItems]);

  // Match recipes against fridge / selected ingredients
  const matchedRecipes = useMemo(() => {
    const scored = BUILTIN_RECIPES.map(recipe => {
      const matchedItems: string[] = [];
      let usesExpiring = false;

      for (const kw of recipe.keywords) {
        const found = activeIngredientNames.find(
          pName => pName.toLowerCase().includes(kw) || kw.includes(pName.toLowerCase())
        );
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
        youtubeId: 'kRCH8kD1GD0',
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

  const handleSearchYoutube = async (customQueryIngredients?: string[], recipeIdToOpen?: string) => {
    const queryList =
      customQueryIngredients && customQueryIngredients.length > 0
        ? customQueryIngredients
        : selectedIngredients.length > 0
        ? selectedIngredients
        : localPantryItems.length > 0
        ? localPantryItems.slice(0, 3).map(i => i.name)
        : ['ức gà eat clean', 'cơm nhà dinh dưỡng'];

    setIsSearching(true);
    try {
      const results = await searchYoutubeRecipes(queryList);
      setVideos(results);
      if (results.length > 0) {
        setActiveYoutubeEmbedId(results[0].id);
        if (recipeIdToOpen) {
          setRecipeCustomVideoIds(prev => ({ ...prev, [recipeIdToOpen]: results[0].id }));
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleRecipeVideo = async (recipe: RecipeSuggestion & { matchedItems: string[] }) => {
    if (activeRecipeVideoCardId === recipe.id) {
      setActiveRecipeVideoCardId(null);
      return;
    }
    setActiveRecipeVideoCardId(recipe.id);
    // Load dynamic YouTube results for this dish as well
    await handleSearchYoutube([recipe.title, ...recipe.matchedItems.slice(0, 2)], recipe.id);
  };

  const handleCookAndLog = async (recipe: RecipeSuggestion & { matchedItems: string[] }) => {
    if (cookingRecipeId) return;
    setCookingRecipeId(recipe.id);
    try {
      const res = await cookRecipeFromPantry({
        title: recipe.title,
        tag: recipe.tag,
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat,
        prepTime: recipe.prepTime,
        ingredientsList: recipe.ingredientsList,
        steps: recipe.steps,
        matchedPantryNames: recipe.matchedItems,
      });

      if (res.nutritionLog) {
        setNutritionStats({
          calories: res.nutritionLog.calories,
          protein: res.nutritionLog.protein,
          carbs: res.nutritionLog.carbs,
          fat: res.nutritionLog.fat,
        });
      }
      if (res.cookedRecipe) {
        setCookedMeals(prev => [res.cookedRecipe, ...prev]);
      }
      if (res.updatedPantryItems) {
        setLocalPantryItems(res.updatedPantryItems);
      }

      setLastCookFeedback({
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat,
        consumedDetails: res.consumedDetails || [],
      });
    } catch (err) {
      console.error('Lỗi khi ghi nhận nấu món ăn:', err);
    } finally {
      setCookingRecipeId(null);
    }
  };

  const calPercent = Math.min(100, Math.round((nutritionStats.calories / Math.max(goalCal, 1)) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '80vh' }}>
      {/* ── THANH TỔNG HỢP DINH DƯỠNG & MÓN ĐÃ NẤU HÔM NAY ── */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Nhật Ký Dinh Dưỡng & Chế Biến Hôm Nay
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Khi bấm &ldquo;Nấu món này&rdquo;, hệ thống tự động cộng Calo + Macros (Đạm, Tinh bột, Béo), lưu thực đơn đã nấu và trừ nguyên liệu trong tủ lạnh
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '8px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Năng lượng hôm nay</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f5b94a' }}>
                {nutritionStats.calories} / {goalCal} kcal ({calPercent}%)
              </div>
            </div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '8px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Đạm (Protein)</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#3dd68c' }}>{nutritionStats.protein}g</div>
            </div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '8px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Tinh bột (Carbs)</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#7db2ff' }}>{nutritionStats.carbs}g</div>
            </div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '8px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Chất béo (Fat)</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f472b6' }}>{nutritionStats.fat}g</div>
            </div>
          </div>
        </div>

        {/* Thông báo phản hồi chi tiết ngay sau khi bấm Nấu Món Này */}
        {lastCookFeedback && (
          <div
            style={{
              background: 'rgba(61, 214, 140, 0.12)',
              border: '1px solid rgba(61, 214, 140, 0.35)',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ fontSize: '0.83rem', color: '#e2e8f0', lineHeight: 1.5 }}>
              <strong style={{ color: '#3dd68c' }}>Đã chế biến &ldquo;{lastCookFeedback.recipeTitle}&rdquo;:</strong>{' '}
              +{lastCookFeedback.calories} kcal • +{lastCookFeedback.protein}g Đạm (P) • +{lastCookFeedback.carbs}g Tinh bột (C) • +{lastCookFeedback.fat}g Béo (F).
              {lastCookFeedback.consumedDetails.length > 0 ? (
                <div style={{ color: '#cbd5e1', marginTop: '2px' }}>
                  <strong>Đã tự động trừ nguyên liệu tủ lạnh:</strong> {lastCookFeedback.consumedDetails.join(' • ')}
                </div>
              ) : (
                <div style={{ color: '#94a3b8', marginTop: '2px' }}>
                  Đã lưu vào nhật ký món ăn hôm nay.
                </div>
              )}
            </div>
            <button
              onClick={() => setLastCookFeedback(null)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Danh sách các món đã nấu trong hôm nay */}
        {cookedMeals.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Món đã nấu hôm nay ({cookedMeals.length}):
            </span>
            {cookedMeals.slice(0, 6).map(meal => (
              <span
                key={meal.id}
                style={{
                  fontSize: '0.76rem',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: 'rgba(245, 185, 74, 0.14)',
                  border: '1px solid rgba(245, 185, 74, 0.3)',
                  color: '#f5b94a',
                  fontWeight: 600,
                }}
              >
                {meal.title} ({meal.calories || 0} kcal)
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Top navigation bar ── */}
      <div>
        <div
          style={{
            display: 'flex',
            gap: '4px',
            background: 'rgba(15,23,42,0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px 20px 0 0',
            padding: '6px',
          }}
        >
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 24px',
            background: 'rgba(15,23,42,0.5)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#475569' }}>Nutrition & Fridge Hub</span>
            <ChevronRight size={12} color="#334155" />
            <span style={{ fontSize: '0.78rem', color: currentTab.accent, fontWeight: 600 }}>{currentTab.label}</span>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Đang có <strong style={{ color: '#3dd68c' }}>{localPantryItems.length}</strong> nguyên liệu trong tủ lạnh
          </div>
        </div>

        {/* ── Content panel ── */}
        <div
          style={{
            flex: 1,
            background: 'rgba(15,23,42,0.4)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderTop: 'none',
            borderRadius: '0 0 20px 20px',
            padding: '24px',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* --- PANTRY TAB --- */}
          {activeTab === 'pantry' && (
            <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <PantryTracker items={localPantryItems} />

              {localPantryItems.length > 0 && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(245, 185, 74,0.12), rgba(61, 214, 140,0.08))',
                    border: '1px solid rgba(245, 185, 74,0.3)',
                    borderRadius: '16px',
                    padding: '18px 22px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ChefHat size={24} color="#f5b94a" />
                    <div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.98rem' }}>
                        Tủ lạnh của bạn đang có {localPantryItems.length} nguyên liệu sẵn sàng chế biến!
                      </div>
                      <div style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>
                        Hệ thống đã tìm thấy các món ăn khớp với nguyên liệu hiện có (ưu tiên đồ sắp hết hạn).
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('recipes')}
                    style={{
                      background: '#f5b94a',
                      color: '#0f172a',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                    }}
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
                      <div style={{ background: 'rgba(245, 185, 74,0.15)', padding: '8px', borderRadius: '10px' }}>
                        <ChefHat size={22} color="#f5b94a" />
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
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#cbd5e1',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      Bỏ chọn ({selectedIngredients.length})
                    </button>
                  )}
                </div>

                {localPantryItems.length === 0 ? (
                  <div style={{ color: '#94a3b8', fontSize: '0.9rem', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '16px' }}>
                    Tủ lạnh đang trống. Bạn vẫn có thể xem công thức và video hướng dẫn bên dưới, hoặc qua tab{' '}
                    <strong>&ldquo;Quản Lý Tủ Lạnh & Nhập Bill&rdquo;</strong> để thêm nguyên liệu!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                    {localPantryItems.map(item => {
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
                            background: isSelected ? 'rgba(245, 185, 74,0.22)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${isSelected ? '#f5b94a' : isExp ? 'rgba(244, 109, 117,0.5)' : 'rgba(255,255,255,0.1)'}`,
                            color: isSelected ? '#f5b94a' : '#e2e8f0',
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
                          {isExp && <AlertTriangle size={13} color="#f46d75" />}
                          <span>{item.name}</span>
                          {item.quantity && <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>({item.quantity})</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={() => handleSearchYoutube()}
                  disabled={isSearching}
                  style={{
                    background: 'linear-gradient(135deg, #f46d75, #b91c1c)',
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
                  {isSearching ? 'Đang tải video hướng dẫn...' : 'Tìm & Xem Video Công Thức Trên YouTube'}
                </button>
              </div>

              {/* YOUTUBE VIDEOS RESULTS & INLINE PLAYER */}
              {videos.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(244, 109, 117, 0.3)',
                    borderRadius: '18px',
                    padding: '20px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Video size={18} color="#f46d75" /> Video Hướng Dẫn Nấu Ăn Chi Tiết
                    </h4>
                    <button
                      onClick={() => {
                        setVideos([]);
                        setActiveYoutubeEmbedId(null);
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#cbd5e1',
                        padding: '5px 10px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                      }}
                    >
                      Đóng danh sách video
                    </button>
                  </div>

                  {/* Trình phát Video trực tiếp ngay trong trang */}
                  {activeYoutubeEmbedId && (
                    <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, borderRadius: '14px', overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <iframe
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        src={`https://www.youtube.com/embed/${activeYoutubeEmbedId}`}
                        title="YouTube Recipe Player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px' }}>
                    {videos.map(video => {
                      const isPlaying = activeYoutubeEmbedId === video.id;
                      return (
                        <div
                          key={video.id}
                          onClick={() => setActiveYoutubeEmbedId(video.id)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            padding: '12px',
                            background: isPlaying ? 'rgba(244, 109, 117, 0.14)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${isPlaying ? '#f46d75' : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: '14px',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '10px', overflow: 'hidden', background: '#000' }}>
                            <img
                              src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                              alt={video.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.88 }}
                            />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ background: 'rgba(244, 109, 117,0.9)', padding: '10px', borderRadius: '50%' }}>
                                <Play size={18} color="#fff" fill="#fff" />
                              </div>
                            </div>
                            <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.8)', padding: '3px 7px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, color: '#fff' }}>
                              {video.duration}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <h4 style={{ margin: 0, fontSize: '0.86rem', color: '#f1f5f9', lineHeight: 1.4 }}>{video.title}</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>{video.channel}</span>
                              <a
                                href={`https://www.youtube.com/watch?v=${video.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                style={{ fontSize: '0.74rem', color: '#f9a3a8', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                              >
                                Mở YouTube <ExternalLink size={11} />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* DANH SÁCH THỰC ĐƠN ĐỀ XUẤT */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#f5b94a" /> Thực Đơn Gợi Ý Phù Hợp Nhất Với Tủ Lạnh Của Bạn
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
                  {matchedRecipes.map(recipe => {
                    const isJustCooked = lastCookFeedback?.recipeId === recipe.id;
                    const isCookingThis = cookingRecipeId === recipe.id;
                    const isVideoOpen = activeRecipeVideoCardId === recipe.id;
                    const embedId = recipeCustomVideoIds[recipe.id] || recipe.youtubeId;

                    return (
                      <div
                        key={recipe.id}
                        style={{
                          background: 'rgba(255,255,255,0.025)',
                          border: `1px solid ${
                            recipe.usesExpiring
                              ? 'rgba(245, 185, 74,0.45)'
                              : recipe.matchCount > 0
                              ? 'rgba(61, 214, 140,0.35)'
                              : 'rgba(255,255,255,0.06)'
                          }`,
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
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(91, 156, 255,0.15)', color: '#7db2ff' }}>
                                {recipe.tag}
                              </span>
                              {recipe.matchCount > 0 && (
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(61, 214, 140,0.18)', color: '#3dd68c' }}>
                                  Có sẵn: {recipe.matchedItems.join(', ')}
                                </span>
                              )}
                              {recipe.usesExpiring && (
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(245, 185, 74,0.2)', color: '#f5b94a' }}>
                                  Giải cứu đồ sắp hết hạn
                                </span>
                              )}
                            </div>
                            <h4 style={{ margin: 0, color: '#fff', fontSize: '1.08rem', fontWeight: 700 }}>{recipe.title}</h4>
                          </div>
                        </div>

                        {/* Macros bar */}
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '10px', fontSize: '0.78rem' }}>
                          <span style={{ color: '#f5b94a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Flame size={14} /> {recipe.calories} kcal
                          </span>
                          <span style={{ color: '#3dd68c', fontWeight: 600 }}>Đạm (P): {recipe.protein}g</span>
                          <span style={{ color: '#7db2ff', fontWeight: 600 }}>Tinh bột (C): {recipe.carbs}g</span>
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

                        {/* Trình phát Video hướng dẫn ngay trong thẻ món ăn */}
                        {isVideoOpen && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, borderRadius: '12px', overflow: 'hidden', background: '#000', border: '1px solid rgba(244, 109, 117, 0.35)' }}>
                              <iframe
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                src={`https://www.youtube.com/embed/${embedId}`}
                                title={recipe.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: '#94a3b8' }}>
                              <span>Đang phát video hướng dẫn: {recipe.title}</span>
                              <a
                                href={`https://www.youtube.com/watch?v=${embedId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#f9a3a8', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}
                              >
                                Xem trên YouTube <ExternalLink size={12} />
                              </a>
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleCookAndLog(recipe)}
                            disabled={isCookingThis}
                            style={{
                              flex: 1,
                              minWidth: '210px',
                              background: isJustCooked ? 'rgba(61, 214, 140,0.22)' : '#3dd68c',
                              color: isJustCooked ? '#3dd68c' : '#0f172a',
                              border: isJustCooked ? '1px solid rgba(61, 214, 140,0.5)' : 'none',
                              padding: '10px 14px',
                              borderRadius: '10px',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                            }}
                          >
                            {isCookingThis ? (
                              <>Đang ghi nhận món ăn & trừ nguyên liệu...</>
                            ) : isJustCooked ? (
                              <>
                                <CheckCircle2 size={15} /> Đã nấu (+{recipe.calories} kcal, +{recipe.protein}g P, trừ tủ lạnh)
                              </>
                            ) : (
                              <>
                                <Utensils size={15} /> Nấu Món Này (+{recipe.calories} kcal • +{recipe.protein}g Đạm • Trừ Tủ Lạnh)
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleToggleRecipeVideo(recipe)}
                            style={{
                              background: isVideoOpen ? '#f46d75' : 'rgba(244, 109, 117,0.15)',
                              color: isVideoOpen ? '#fff' : '#f9a3a8',
                              border: '1px solid rgba(244, 109, 117,0.35)',
                              padding: '10px 14px',
                              borderRadius: '10px',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <Play size={14} /> {isVideoOpen ? 'Ẩn Video' : 'Xem Video'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
