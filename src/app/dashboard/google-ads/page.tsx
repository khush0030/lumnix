'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, TrendingUp, Target, MousePointerClick, RefreshCw, AlertCircle, BarChart3, Zap } from 'lucide-react';
import { PageShell, EmptyState } from '@/components/PageShell';
import { useWorkspace, useIntegrations } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';

function StatCard({ icon: Icon, color, label, value, sub }: { icon: any; color: string; label: string; value: string; sub?: string }) {
  return (
    <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 12, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <Icon size={14} color={color} />
        <span style={{ fontSize: 12, color: '#71717a' }}>{label}</span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#f4f4f5', marginBottom: 3 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#52525b' }}>{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    ENABLED: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'Active' },
    PAUSED: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Paused' },
    REMOVED: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Removed' },
  };
  const s = map[status] || { color: '#71717a', bg: 'rgba(113,113,122,0.1)', label: status };
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: s.color, backgroundColor: s.bg, padding: '2px 8px', borderRadius: 4 }}>
      {s.label}
    </span>
  );
}

export default function GoogleAdsPage() {
  const router = useRouter();
  const { workspace, loading: wsLoading } = useWorkspace();
  const { integrations, loading: intLoading } = useIntegrations(workspace?.id);

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const integration = integrations.find(i => i.provider === 'google_ads');
  const loading = wsLoading || intLoading;

  // Load existing data from analytics_data
  useEffect(() => {
    if (!workspace?.id) return;
    async function loadData() {
      setDataLoading(true);
      const { data } = await supabase
        .from('analytics_data')
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('provider', 'google_ads')
        .eq('metric_type', 'campaigns')
        .order('synced_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setCampaigns(data.data || []);
        setSyncedAt(data.synced_at);
      }
      setDataLoading(false);
    }
    loadData();
  }, [workspace?.id]);

  async function handleSync() {
    if (!integration || !workspace) return;
    setSyncing(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/sync/google-ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ integration_id: integration.id, workspace_id: workspace.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Sync failed');

      // Reload data
      const { data } = await supabase
        .from('analytics_data')
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('provider', 'google_ads')
        .eq('metric_type', 'campaigns')
        .order('synced_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setCampaigns(data.data || []);
        setSyncedAt(data.synced_at);
      }
    } catch (err: any) {
      setError(err.message || 'Sync failed');
    }
    setSyncing(false);
  }

  // Summary stats
  const totalSpend = campaigns.reduce((s, c) => s + (c.spend || 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + (c.clicks || 0), 0);
  const totalImpressions = campaigns.reduce((s, c) => s + (c.impressions || 0), 0);
  const totalConversions = campaigns.reduce((s, c) => s + (c.conversions || 0), 0);
  const totalConvValue = campaigns.reduce((s, c) => s + (c.conversions_value || 0), 0);
  const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const roas = totalSpend > 0 ? totalConvValue / totalSpend : 0;

  const hasData = campaigns.length > 0;

  return (
    <PageShell title="Google Ads" description="Campaign performance & spend tracking" icon={DollarSign}>

      {loading || dataLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 12, height: 90 }} />
          ))}
        </div>
      ) : !integration ? (
        <EmptyState
          icon={DollarSign}
          title="Connect Google Ads"
          description="Link your Google Ads account to track campaign performance, spend, ROAS, and get AI-powered optimization recommendations."
          actionLabel="Connect in Settings"
          onAction={() => router.push('/dashboard/settings')}
        />
      ) : (
        <>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: '#52525b' }}>
              {syncedAt ? `Last synced ${new Date(syncedAt).toLocaleString()}` : 'Never synced'}
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                borderRadius: 8, border: '1px solid #3f3f46', backgroundColor: syncing ? '#27272a' : '#18181b',
                color: syncing ? '#52525b' : '#a1a1aa', fontSize: 13, cursor: syncing ? 'not-allowed' : 'pointer'
              }}
            >
              <RefreshCw size={14} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 20 }}>
              <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 2 }}>Sync Failed</div>
                <div style={{ fontSize: 12, color: '#71717a' }}>{error}</div>
                {error.toLowerCase().includes('developer') && (
                  <div style={{ fontSize: 12, color: '#52525b', marginTop: 4 }}>
                    ⚠️ Add GOOGLE_ADS_DEVELOPER_TOKEN to your environment variables to enable the Google Ads API.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No data yet */}
          {!hasData && !error && (
            <div style={{ backgroundColor: '#18181b', border: '1px dashed #3f3f46', borderRadius: 14, padding: '48px 24px', textAlign: 'center', marginBottom: 20 }}>
              <BarChart3 size={32} color="#3f3f46" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: '#71717a', marginBottom: 6 }}>No campaign data yet</div>
              <div style={{ fontSize: 13, color: '#52525b', marginBottom: 20 }}>Click "Sync Now" to pull your Google Ads campaigns.</div>
            </div>
          )}

          {/* Stats cards */}
          {hasData && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
                <StatCard icon={DollarSign} color="#f59e0b" label="Total Spend" value={`$${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} sub="Last 30 days" />
                <StatCard icon={MousePointerClick} color="#3b82f6" label="Total Clicks" value={totalClicks.toLocaleString()} sub={`${totalImpressions.toLocaleString()} impressions`} />
                <StatCard icon={Target} color="#22c55e" label="Conversions" value={totalConversions.toLocaleString()} sub={`$${totalConvValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} value`} />
                <StatCard icon={TrendingUp} color="#7c3aed" label="ROAS" value={`${roas.toFixed(2)}x`} sub={roas >= 3 ? '✅ Healthy' : roas >= 1 ? '⚠️ Breakeven' : '❌ Losing money'} />
                <StatCard icon={Zap} color="#ec4899" label="Avg CPC" value={`$${avgCPC.toFixed(2)}`} sub="Per click average" />
                <StatCard icon={BarChart3} color="#06b6d4" label="Campaigns" value={campaigns.length.toString()} sub={`${campaigns.filter(c => c.status === 'ENABLED').length} active`} />
              </div>

              {/* Campaign table */}
              <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 14, padding: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f4f4f5', marginBottom: 16 }}>Campaigns</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                    <thead>
                      <tr>
                        {['Campaign', 'Status', 'Spend', 'Clicks', 'Impressions', 'Conversions', 'CPC', 'ROAS'].map(h => (
                          <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', paddingBottom: 10, borderBottom: '1px solid #27272a', paddingRight: 12, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((c, i) => {
                        const cRoas = c.spend > 0 ? (c.conversions_value / c.spend).toFixed(2) : '—';
                        const cCpc = c.clicks > 0 ? (c.spend / c.clicks).toFixed(2) : '—';
                        return (
                          <tr key={c.id || i} style={{ borderBottom: '1px solid #1e1e22' }}>
                            <td style={{ padding: '12px 12px 12px 0', fontSize: 13, color: '#f4f4f5', fontWeight: 500, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</td>
                            <td style={{ padding: '12px 12px 12px 0' }}><StatusBadge status={c.status} /></td>
                            <td style={{ padding: '12px 12px 12px 0', fontSize: 13, color: '#f4f4f5', fontWeight: 600 }}>${(c.spend || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td style={{ padding: '12px 12px 12px 0', fontSize: 13, color: '#a1a1aa' }}>{(c.clicks || 0).toLocaleString()}</td>
                            <td style={{ padding: '12px 12px 12px 0', fontSize: 13, color: '#a1a1aa' }}>{(c.impressions || 0).toLocaleString()}</td>
                            <td style={{ padding: '12px 12px 12px 0', fontSize: 13, color: '#a1a1aa' }}>{(c.conversions || 0).toFixed(1)}</td>
                            <td style={{ padding: '12px 12px 12px 0', fontSize: 13, color: '#a1a1aa' }}>{cCpc !== '—' ? `$${cCpc}` : '—'}</td>
                            <td style={{ padding: '12px 0', fontSize: 13, fontWeight: 600, color: parseFloat(cRoas as string) >= 3 ? '#22c55e' : parseFloat(cRoas as string) >= 1 ? '#f59e0b' : '#ef4444' }}>
                              {cRoas !== '—' ? `${cRoas}x` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </PageShell>
  );
}
