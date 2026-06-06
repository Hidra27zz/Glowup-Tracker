import { prisma } from '@/lib/prisma';
import NutritionHub from '@/components/nutrition/NutritionHub';

export const dynamic = 'force-dynamic';

export default async function NutritionPage() {
  const pantryItems = await prisma.pantryItem.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <h1 style={{ marginBottom: '8px' }}>Nutrition & Pantry</h1>
        <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Quản lý thực phẩm và gợi ý món ăn theo nguyên liệu</p>
      </header>

      <NutritionHub pantryItems={pantryItems} />
    </div>
  );
}
