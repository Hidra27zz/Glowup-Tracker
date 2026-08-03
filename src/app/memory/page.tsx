import { prisma } from '@/lib/prisma';
import MemoryHub from '@/components/memory/MemoryHub';

export const dynamic = 'force-dynamic';

export default async function MemoryPage() {
  // Xóa tự động các Brain Dump cũ hơn 30 ngày
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  await prisma.brainDump.deleteMany({
    where: {
      createdAt: { lt: thirtyDaysAgo }
    }
  });

  const [memories, dumps] = await Promise.all([
    prisma.memoryVault.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.brainDump.findMany({
      orderBy: { createdAt: 'desc' },
    })
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <h1 style={{ marginBottom: '8px' }}>Second Brain & Memory</h1>
        <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Lưu trữ ý tưởng nhanh chóng và kết nối lại với chính mình trong quá khứ.</p>
      </header>

      <MemoryHub memories={memories} dumps={dumps} />
    </div>
  );
}
