import { prisma } from '@/lib/prisma';
import FinanceHub from '@/components/finance/FinanceHub';

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
  const now = new Date();
  const since = new Date(now.getFullYear(), now.getMonth() - 2, 1);

  const [transactions, impulseBuys, subscriptions, inventoryItems, budgets, savingsGoals] = await Promise.all([
    prisma.financialTransaction.findMany({ where: { date: { gte: since } }, orderBy: { date: 'desc' }, take: 1000 }).catch(() => []),
    prisma.impulseBuyItem.findMany({ orderBy: { addedAt: 'desc' }, take: 50 }).catch(() => []),
    prisma.subscription.findMany({ orderBy: { renewalDate: 'asc' }, take: 50 }).catch(() => []),
    prisma.inventoryItem.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }).catch(() => []),
    prisma.budget.findMany({ orderBy: { createdAt: 'asc' } }).catch(() => []),
    prisma.savingsGoal.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []),
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <h1 style={{ marginBottom: '8px' }}>Finance & Wealth</h1>
        <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
          Quản lý chi tiêu thông minh: ngân sách theo danh mục, dự báo cuối tháng, mục tiêu tiết kiệm và cảnh báo sớm.
        </p>
      </header>

      <FinanceHub
        transactions={transactions}
        impulseBuys={impulseBuys}
        subscriptions={subscriptions}
        inventoryItems={inventoryItems}
        budgets={budgets}
        savingsGoals={savingsGoals}
      />
    </div>
  );
}
