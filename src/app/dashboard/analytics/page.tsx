'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Users, Clock, MousePointer, Download } from 'lucide-react';
import { PageShell, EmptyState } from '@/components/PageShell';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { DateRangePicker } from '@/components/DateRangePicker';
import { useWorkspace, useGA4Data } from '@/lib/hooks';

function SkeletonBox({ h = 100 }: { h?: number }) {
  return (
    <div className="animate-pulse" style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', height: `${h}px` }}>
      <div style={{ margin: '18px', height: '12px', backgroundColor: '#27272a', borderRadius: '4px', width: '40%' }} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      <div className="kpi-grid">{[1,2,3,4].map(i => <SkeletonBox key={i} h={100} />)}</div>
      <div className="two-col-equal"><SkeletonBox h={260} /><SkeletonBox h={260} /></div>
      <SkeletonBox h={220} />
    </>
  );
}

function exportPagesCSV(pages: { page: string; pageviews: number; bounceRate: number }[]) {
  const headers = ['Page', 'Views', 'Bounce Rate'];
  const rows = pages.map(p => [p.page, p.pageviews, `${p.bounceRate}%`]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'Lumnix-pages.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const router = useRouter();
  const { workspace, loading: wsLoading } = useWorkspace();
  const workspaceId = workspace?.id;

  const { data: overviewResp, loading: overviewLoading } = useGA4Data(workspaceId, 'overview', days);
  const { data: sourcesResp, loading: sourcesLoading } = useGA4Data(workspaceId, 'sources', days);
  const { data: pagesResp, loading: pagesLoading } = useGA4Data(workspaceId, 'pages', days);

  const loading = wsLoading || overviewLoading || sourcesLoading || pagesLoading;

  const overviewData: { date: string; sessions: number; users: number; pageviews: number }[] = overviewResp?.data || [];
  const sourcesData: { source: string; sessions: number; users: number }[] = sourcesResp?.data || [];
  const pagesData: { page: string; pageviews: number; bounceRate: number }[] = pagesResp?.data || [];

  const hasData = overviewData.length > 0;

  // KPI totals
  const totalSessions = overviewData.reduce((s, r) => s + (r.sessions || 0), 0);
  const totalUsers = overviewData.reduce((s, r) => s + (r.users || 0), 0);
  const totalPageviews = overviewData.reduce((s, r) => s + (r.pageviews || 0), 0);
  const pagesPerSession = totalSessions > 0 ? (totalPageviews / totalSessions).toFixed(1) : '0';

  // Chart data — last 14 days for readability
  const chartData = overviewData.slice(-14).map(r => ({
    day: r.date?.slice(5) ?? '',
    sessions: r.sessions || 0,
    users: r.users || 0,
  }));

  // Sources with percentage
  const totalSourceSessions = sourcesData.reduce((s, r) => s + (r.sessions || 0), 0);
  const sourcesWithPct = sourcesData.slice(0, 6).map(s => ({
    source: s.source,
    sessions: s.sessions,
    pct: totalSourceSessions > 0 ? Math.round((s.sessions / totalSourceSessions) * 100) : 0,
  }));

  return (
    <PageShell title="Web Analytics" description="Google Analytics 4 data & insights" icon={BarChart3}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <DateRangePicker value={days} onChange={setDays} />
      </div>

      {loading && <LoadingSkeleton />}

      {!loading && !hasData && (
        <EmptyState
          icon={BarChart3}
          title="No GA4 data yet"
          description="Connect your Google Analytics 4 property in Settings, then sync it to see real traffic data here."
          actionLabel="Go to Settings"
          onAction={() => router.push('/dashboard/settings')}
        />
      )}

      {!loading && hasData && (
        <>
          {/* KPIs */}
          <div className="kpi-grid">
            {[
              { label: 'Sessions', value: totalSessions.toLocaleString(), icon: BarChart3, color: '#7c3aed' },
              { label: 'Users', value: totalUsers.toLocaleString(), icon: Users, color: '#3b82f6' },
              { label: 'Page Views', value: totalPageviews.toLocaleString(), icon: Clock, color: '#22c55e' },
              { label: 'Pages / Session', value: pagesPerSession, icon: MousePointer, color: '#f59e0b' },
            ].map(kpi => (
              <div key={kpi.label} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <kpi.icon size={14} color={kpi.color} />
                  <span style={{ fontSize: '12px', color: '#71717a' }}>{kpi.label}</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#f4f4f5' }}>{kpi.value}</div>
              </div>
            ))}
          </div>

          <div className="two-col-equal">
            {/* Sessions Chart */}
            <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f4f4f5', marginBottom: '16px' }}>Sessions & Users</h2>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gSess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="sessions" stroke="#7c3aed" fill="url(#gSess)" strokeWidth={2} />
                  <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="none" strokeWidth={2} strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Traffic Sources */}
            <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f4f4f5', marginBottom: '16px' }}>Traffic Sources</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sourcesWithPct.map(s => (
                  <div key={s.source} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ flex: 1, fontSize: '13px', color: '#a1a1aa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.source}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#f4f4f5', width: '60px', textAlign: 'right', flexShrink: 0 }}>{s.sessions.toLocaleString()}</span>
                    <div style={{ width: '80px', height: '6px', borderRadius: '3px', backgroundColor: '#27272a', overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{ width: `${s.pct}%`, height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, #7c3aed, #4f46e5)' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#52525b', width: '32px', textAlign: 'right', flexShrink: 0 }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Pages */}
          <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f4f4f5' }}>Top Pages</h2>
              <button onClick={() => exportPagesCSV(pagesData)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #3f3f46', backgroundColor: '#27272a', color: '#a1a1aa', fontSize: '12px', cursor: 'pointer' }}>
                <Download size={12} /> Export CSV
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Page', 'Views', 'Bounce Rate'].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#52525b', textTransform: 'uppercase', paddingBottom: '10px', borderBottom: '1px solid #27272a' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {pagesData.map(p => (
                  <tr key={p.page} style={{ borderBottom: '1px solid #1e1e22' }}>
                    <td style={{ padding: '10px 0', fontSize: '13px', color: '#a78bfa', fontWeight: 500 }}>{p.page}</td>
                    <td style={{ padding: '10px 8px', fontSize: '13px', color: '#f4f4f5', fontWeight: 600 }}>{(p.pageviews || 0).toLocaleString()}</td>
                    <td style={{ padding: '10px 0', fontSize: '13px', color: (p.bounceRate || 0) > 40 ? '#ef4444' : '#a1a1aa' }}>{p.bounceRate ?? 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </PageShell>
  );
}
