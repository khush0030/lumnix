'use client';
import { useState } from 'react';
import { Target, Eye, MousePointer, DollarSign, Plug, RefreshCw, AlertCircle } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { DateRangePicker } from '@/components/DateRangePicker';
import { useWorkspace, useIntegrations, connectIntegration, syncIntegration } from '@/lib/hooks';

function NotConnected({ onConnect, connecting }: { onConnect: () => void; connecting: boolean }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(24,119,242,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <Target size={28} color="#1877F2" />
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f4f4f5', marginBottom: 8 }}>Connect Meta Ads</h2>
      <p style={{ fontSize: 14, color: '#71717a', marginBottom: 28, maxWidth: 400, margin: '0 auto 28px' }}>
        Sync Facebook & Instagram ad performance. See ROAS, creative fatigue, audience overlap, and spend trends.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
        {['Campaign ROAS', 'Creative fatigue alerts', 'Audience overlap', 'Spend pacing'].map(f => (
          <span key={f} style={{ fontSize: 12, color: '#a1a1aa', backgroundColor: '#27272a', padding: '6px 12px', borderRadius: 20 }}>{f}</span>
        ))}
      </div>
      <button
        onClick={onConnect}
        disabled={connecting}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #1877F2, #4f46e5)', color: 'white', fontSize: 14, fontWeight: 600, cursor: connecting ? 'wait' : 'pointer', opacity: connecting ? 0.7 : 1 }}
      >
        <Plug size={16} /> {connecting ? 'Connecting...' : 'Connect Meta Ads'}
      </button>
      <p style={{ fontSize: 12, color: '#52525b', marginTop: 16 }}>
        Requires a Meta Business account with ad access
      </p>
    </div>
  );
}

export default function MetaAdsPage() {
  const [days, setDays] = useState(30);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { workspace } = useWorkspace();
  const { integrations, refetch } = useIntegrations(workspace?.id);

  const integration = integrations.find(i => i.provider === 'meta_ads' && i.status === 'connected');
  const isConnected = !!integration;

  async function handleConnect() {
    if (!workspace?.id) return;
    setConnecting(true);
    await connectIntegration('meta_ads', workspace.id);
    setConnecting(false);
  }

  async function handleSync() {
    if (!integration || !workspace?.id) return;
    setSyncing(true);
    // Meta ads sync endpoint
    try {
      const res = await fetch('/api/sync/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integration_id: integration.id, workspace_id: workspace.id }),
      });
      const result = await res.json();
      if (result.error) alert(`Sync failed: ${result.error}`);
      refetch();
    } catch (err) {
      alert(`Sync error: ${err}`);
    }
    setSyncing(false);
  }

  return (
    <PageShell title="Meta Ads" description="Facebook & Instagram ad performance" icon={Target}>
      {!isConnected ? (
        <NotConnected onConnect={handleConnect} connecting={connecting} />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', padding: '4px 10px', borderRadius: 6 }}>
                ✓ Connected{integration.display_name ? ` · ${integration.display_name}` : ''}
              </span>
              {integration.last_sync_at && (
                <span style={{ fontSize: 11, color: '#52525b' }}>Last sync: {new Date(integration.last_sync_at).toLocaleString()}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <DateRangePicker value={days} onChange={setDays} />
              <button onClick={handleSync} disabled={syncing} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid #3f3f46', backgroundColor: '#27272a', color: '#a1a1aa', fontSize: 13, cursor: syncing ? 'wait' : 'pointer' }}>
                <RefreshCw size={13} /> {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          </div>

          {/* Meta Insights API — needs Business verification */}
          <div style={{ backgroundColor: '#18181b', border: '1px solid rgba(24,119,242,0.2)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
            <AlertCircle size={32} color="#1877F2" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f4f4f5', marginBottom: 8 }}>Meta Business Verification Required</h3>
            <p style={{ fontSize: 13, color: '#71717a', maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.6 }}>
              Your Meta app needs Business Verification to access the Marketing API and pull real ad data. This is a one-time Meta review process.
            </p>
            <a
              href="https://developers.facebook.com/docs/development/release/business-verification"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, backgroundColor: '#1877F2', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
            >
              Start Business Verification →
            </a>
            <p style={{ fontSize: 12, color: '#52525b', marginTop: 16 }}>
              Once verified, data will sync automatically. Your connection is already saved.
            </p>
          </div>
        </>
      )}
    </PageShell>
  );
}
