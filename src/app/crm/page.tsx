import { prisma } from '@/lib/prisma';
import CRMHub from '@/components/crm/CRMHub';

export const dynamic = 'force-dynamic';

export default async function CRMPage() {
  const contacts = await prisma.contact.findMany({
    include: {
      interactions: {
        orderBy: { date: 'desc' }
      }
    },
    orderBy: { lastContact: 'asc' },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <h1 style={{ marginBottom: '8px' }}>CRM & Value Network</h1>
        <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Quản lý mạng lưới quan hệ, đo lường trao đổi giá trị và giữ liên lạc.</p>
      </header>

      <CRMHub contacts={contacts} />
    </div>
  );
}
