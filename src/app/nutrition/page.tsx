import { prisma } from '@/lib/prisma';
import NutritionHub from '@/components/nutrition/NutritionHub';

export const dynamic = 'force-dynamic';

export default async function NutritionPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [pantryItems, todayNutrition, todayRecipes, settings] = await Promise.all([
    prisma.pantryItem.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []),
    prisma.nutritionLog.findFirst({ where: { date: { gte: today } } }).catch(() => null),
    prisma.recipe
      .findMany({ where: { createdAt: { gte: today } }, orderBy: { createdAt: 'desc' } })
      .catch(() => []),
    prisma.userSettings.findUnique({ where: { id: 'default' } }).catch(() => null),
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <header>
        <h1 style={{ marginBottom: '6px' }}>Nutrition & Pantry</h1>
        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          Quản lý nguyên liệu tủ lạnh, gợi ý món ăn kèm video hướng dẫn và tự động trừ nguyên liệu + cộng chỉ số dinh dưỡng khi nấu
        </p>
      </header>

      <NutritionHub
        pantryItems={pantryItems}
        initialNutrition={todayNutrition}
        initialCookedMeals={todayRecipes}
        goalCal={settings?.goalCal || 1800}
      />
    </div>
  );
}
