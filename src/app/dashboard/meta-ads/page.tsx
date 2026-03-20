'use client';
import { useRouter } from 'next/navigation';
import { Target, Eye, MousePointer, DollarSign, Zap, BarChart3, Users } from 'lucide-react';
import { PageShell, EmptyState } from '@/components/PageShell';
import { useWorkspace } from '@/lib/hooks';

export default function MetaAdsPage() {
  const router = useRouter();
  const { workspace, loading } = useWorkspace();

  if (loading) return (
    <PageShell title="Meta Ads" description="Facebook & Instagram ad performance" icon={Target}>
      <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 12, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#52525b', fontSize: 14 }}>Loading...</span>
      </div>
    </PageShell>
  );

  return (
    <PageShell title="Meta Ads" description="Facebook & Instagram ad performance" icon={Target}>
      <EmptyState
        icon={Target}
        title="Connect Meta Ads"
        description="Link your Meta Ads account to track Facebook & Instagram campaign performance, creative analytics, audience insights, and ad fatigue alerts."
        actionLabel="Connect in Settings"
        onAction={() => router.push('/dashboard/settings')}
      />

      {/* Coming soon preview */}
      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {[
          { icon: DollarSign, color: '#f59e0b', title: 'Ad Spend', desc: 'Daily & lifetime budget tracking' },
          { icon: Eye, color: '#3b82f6', title: 'Reach & Impressions', desc: 'How many people saw your ads' },
          { icon: MousePointer, color: '#7c3aed', title: 'CTR & CPC', desc: 'Click-through rate by creative' },
          { icon: BarChart3, color: '#22c55e', title: 'ROAS', desc: 'Revenue per dollar spent on Meta' },
          { icon: Users, color: '#ec4899', title: 'Audience Overlap', desc: 'Detect audience fatigue early' },
          { icon: Zap, color: '#ef4444', title: 'Creative Fatigue', desc: 'Alerts when ad performance drops' },
        ].map(item => (
          <div key={item.title} style={{ backgroundColor: '#18181b', border: '1px dashed #27272a', borderRadius: 12, padding: '16px', opacity: 0.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <item.icon size={14} color={item.color} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#a1a1aa' }}>{item.title}</span>
            </div>
            <span style={{ fontSize: 12, color: '#52525b' }}>{item.desc}</span>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
