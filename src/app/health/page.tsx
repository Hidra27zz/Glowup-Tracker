import { getHealthData, getUserSettings } from '@/lib/actions/health.actions';
import HealthHub from '@/components/health/HealthHub';

export const dynamic = 'force-dynamic';

export default async function HealthDashboard() {
  const data = await getHealthData();
  const settings = await getUserSettings();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <h1 style={{ marginBottom: '8px' }}>Health & Nutrition</h1>
        <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Chỉ số sinh tồn & Theo dõi cơ thể</p>
      </header>

      <HealthHub data={data} settings={settings} />
    </div>
  );
}
