import { prisma } from '@/lib/prisma';
import FinanceHub from '@/components/finance/FinanceHub';

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
  const transactions = await prisma.financialTransaction.findMany({
    orderBy: { date: 'desc' },
  });
  
  const impulseBuys = await prisma.impulseBuyItem.findMany({
    orderBy: { addedAt: 'desc' },
  });
  
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { renewalDate: 'asc' },
  });

  const inventoryItems = await prisma.inventoryItem.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <h1 style={{ marginBottom: '8px' }}>Finance & Wealth</h1>
        <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Quản lý chi tiêu, hạn chế mua sắm bốc đồng và kiểm soát dòng tiền.</p>
      </header>

      <FinanceHub 
        transactions={transactions} 
        impulseBuys={impulseBuys} 
        subscriptions={subscriptions}
        inventoryItems={inventoryItems} 
      />
    </div>
  );
}
