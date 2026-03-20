'use client';
import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target, AlertCircle, Plug } from 'lucide-react';
import { PageShell, EmptyState } from '@/components/PageShell';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from 'recharts';
import { DateRangePicker } from '@/components/DateRangePicker';
import { useWorkspace, useIntegrations, connectIntegration, syncIntegration } from '@/lib/hooks';
import { useRouter } from 'next/navigation';

function NotConnected({ onConnect, connecting }: { onConnect: () => void; connecting: boolean }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(52,168,83,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <DollarSign size={28} color="#34A853" />
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f4f4f5', marginBottom: 8 }}>Connect Google Ads</h2>
      <p style={{ fontSize: 14, color: '#71717a', marginBottom: 28, maxWidth: 400, margin: '0 auto 28px' }}>
        See your campaign performance, spend, ROAS, and get AI-powered insights on wasted budget and opportunities.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
        {['Campaign ROAS tracking', 'Wasted spend alerts', 'Keyword bid insights', 'Budget pacing gauge'].map(f => (
          <span key={f} style={{ fontSize: 12, color: '#a1a1aa', backgroundColor: '#27272a', padding: '6px 12px', borderRadius: 20 }}>{f}</span>
        ))}
      </div>
      <button
        onClick={onConnect}
        disabled={connecting}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', fontSize: 14, fontWeight: 600, cursor: connecting ? 'wait' : 'pointer', opacity: connecting ? 0.7 : 1 }}
      >
        <Plug size={16} /> {connecting ? 'Connecting...' : 'Connect Google Ads'}
      </button>
    </div>
  );
}

export default function GoogleAdsPage() {
  const [days, setDays] = useState(30);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();
  const { workspace } = useWorkspace();
  const { integrations, refetch } = useIntegrations(workspace?.id);

  const integration = integrations.find(i => i.provider === 'google_ads' && i.status === 'connected');
  const isConnected = !!integration;

  async function handleConnect() {
    if (!workspace?.id) return;
    setConnecting(true);
    await connectIntegration('google_ads', workspace.id);
    setConnecting(false);
  }

  async function handleSync() {
    if (!integration || !workspace?.id) return;
    setSyncing(true);
    await syncIntegration(integration.id, workspace.id, 'google_ads');
    refetch();
    setSyncing(false);
  }

  return (
    <PageShell title="Google Ads" description="Campaign performance & spend intelligence" icon={DollarSign}>
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
              <button onClick={handleSync} disabled={syncing} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid #3f3f46', backgroundColor: '#27272a', color: '#a1a1aa', fontSize: 13, cursor: syncing ? 'wait' : 'pointer', opacity: syncing ? 0.7 : 1 }}>
                {syncing ? 'Syncing...' : '↻ Sync Now'}
              </button>
            </div>
          </div>

          {/* Coming soon state — Google Ads API requires extra approval */}
          <div style={{ backgroundColor: '#18181b', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
            <AlertCircle size={32} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f4f4f5', marginBottom: 8 }}>Google Ads API Approval Needed</h3>
            <p style={{ fontSize: 13, color: '#71717a', maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.6 }}>
              Google Ads API requires separate developer token approval. Apply here — usually takes 1-3 business days.
            </p>
            <a
              href="https://developers.google.com/google-ads/api/docs/get-started/dev-token"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, backgroundColor: '#f59e0b', color: '#000', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
            >
              Apply for Developer Token →
            </a>
            <p style={{ fontSize: 12, color: '#52525b', marginTop: 16 }}>
              Once approved, add your developer token in Settings and data will sync automatically.
            </p>
          </div>
        </>
      )}
    </PageShell>
  );
}
