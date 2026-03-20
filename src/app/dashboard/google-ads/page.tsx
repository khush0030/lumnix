'use client';
import { useRouter } from 'next/navigation';
import { DollarSign, TrendingUp, Target, Zap, AlertCircle } from 'lucide-react';
import { PageShell, EmptyState } from '@/components/PageShell';
import { useWorkspace } from '@/lib/hooks';

export default function GoogleAdsPage() {
  const router = useRouter();
  const { workspace, loading } = useWorkspace();

  if (loading) return (
    <PageShell title="Google Ads" description="Campaign performance & spend tracking" icon={DollarSign}>
      <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 12, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#52525b', fontSize: 14 }}>Loading...</span>
      </div>
    </PageShell>
  );

  return (
    <PageShell title="Google Ads" description="Campaign performance & spend tracking" icon={DollarSign}>
      <EmptyState
        icon={DollarSign}
        title="Connect Google Ads"
        description="Link your Google Ads account to track campaign performance, spend, ROAS, and get AI-powered optimization recommendations."
        actionLabel="Connect in Settings"
        onAction={() => router.push('/dashboard/settings')}
      />

      {/* Coming soon preview */}
      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {[
          { icon: DollarSign, color: '#f59e0b', title: 'Total Spend', desc: 'Real-time budget tracking' },
          { icon: TrendingUp, color: '#22c55e', title: 'ROAS', desc: 'Return on ad spend per campaign' },
          { icon: Target, color: '#7c3aed', title: 'Conversions', desc: 'Goal completions & cost per conversion' },
          { icon: AlertCircle, color: '#ef4444', title: 'Wasted Spend', desc: 'Keywords draining budget with no ROI' },
          { icon: Zap, color: '#3b82f6', title: 'Quality Score', desc: 'Ad relevance & landing page scores' },
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
