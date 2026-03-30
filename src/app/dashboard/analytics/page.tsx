'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Users, Clock, MousePointer, Download, TrendingUp, TrendingDown, Zap, AlertCircle, Star } from 'lucide-react';
import { PageShell, EmptyState } from '@/components/PageShell';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { DateRangePicker } from '@/components/DateRangePicker';
import { useWorkspace, useGA4Data } from '@/lib/hooks';
import { useWorkspaceCtx } from '@/lib/workspace-context';

const COLORS = ['#6366F1','#3b82f6','#10B981','#F59E0B','#ec4899','#06b6d4'];

function SkeletonBox({ h = 100 }: { h?: number }) {
  return (
    <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: 12, height: `${h}px`, animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{ margin: '18px', height: '12px', backgroundColor: '#1A1A1A', borderRadius: '4px', width: '40%' }} />
    </div>
  );
}

function InsightCard({ icon: Icon, color, title, value, sub }: { icon: any; color: string; title: string; value: string; sub: string }) {
  return (
    <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: 12, padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={15} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: '#555555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#FAFAFA', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>{value}</div>
        <div style={{ fontSize: 12, color: '#888888' }}>{sub}</div>
      </div>
    </div>
  );
}

function exportPagesCSV(pages: any[]) {
  const headers = ['Page', 'Views', 'Bounce Rate'];
  const rows = pages.map((p: any) => [p.page, p.pageviews, `${p.bounceRate}%`]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'lumnix-pages.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const router = useRouter();
  const { workspace, loading: wsLoading } = useWorkspaceCtx();
  const workspaceId = workspace?.id;

  const { data: overviewResp, loading: overviewLoading } = useGA4Data(workspaceId, 'overview', days);
  const { data: sourcesResp, loading: sourcesLoading } = useGA4Data(workspaceId, 'sources', days);
  const { data: pagesResp, loading: pagesLoading } = useGA4Data(workspaceId, 'pages', days);

  const loading = wsLoading || overviewLoading || sourcesLoading || pagesLoading;

  const overviewData: any[] = overviewResp?.data || [];
  const sourcesData: any[] = sourcesResp?.data || [];
  const pagesData: any[] = pagesResp?.data || [];

  const hasData = overviewData.length > 0;

  // KPI totals
  const totalSessions = overviewData.reduce((s: number, r: any) => s + (r.sessions || 0), 0);
  const totalUsers = overviewData.reduce((s: number, r: any) => s + (r.users || 0), 0);
  const totalPageviews = overviewData.reduce((s: number, r: any) => s + (r.pageviews || 0), 0);
  const pagesPerSession = totalSessions > 0 ? (totalPageviews / totalSessions).toFixed(1) : '0';

  // Week-over-week comparison
  const half = Math.floor(overviewData.length / 2);
  const thisWeekSessions = overviewData.slice(half).reduce((s: number, r: any) => s + (r.sessions || 0), 0);
  const lastWeekSessions = overviewData.slice(0, half).reduce((s: number, r: any) => s + (r.sessions || 0), 0);
  const wowChange = lastWeekSessions > 0 ? Math.round(((thisWeekSessions - lastWeekSessions) / lastWeekSessions) * 100) : 0;

  // Anomaly detection — days with sessions > 1.5x average or < 0.5x average
  const avgSessions = totalSessions / (overviewData.length || 1);
  const anomalies = overviewData.filter((r: any) => r.sessions > avgSessions * 1.5 || r.sessions < avgSessions * 0.5);

  // Chart data
  const trendData = overviewData.slice(-14).map((r: any) => ({
    day: r.date?.slice(5) ?? '',
    sessions: r.sessions || 0,
    users: r.users || 0,
  }));

  // Sources
  const topSources = [...sourcesData].sort((a, b) => (b.sessions || 0) - (a.sessions || 0)).slice(0, 8);

  // Pages
  const topPages = [...pagesData].sort((a, b) => (b.pageviews || 0) - (a.pageviews || 0)).slice(0, 15);

  const tooltipStyle = { backgroundColor: '#111111', border: '1px solid #333333', borderRadius: 8, color: '#FAFAFA', fontSize: 12 };

  return (
    <PageShell title="Web Analytics" description="GA4 traffic data — sessions, users, sources, and top pages" icon={BarChart3}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <DateRangePicker value={days} onChange={setDays} />
      </div>

      {loading && (
        <>
          <div className="kpi-grid">{[1,2,3,4].map(i => <SkeletonBox key={i} h={100} />)}</div>
          <SkeletonBox h={200} />
        </>
      )}

      {!loading && !hasData && (
        <EmptyState
          icon={BarChart3}
          title="No GA4 data yet"
          description="Connect and sync Google Analytics 4 in Settings to see traffic analytics here."
          actionLabel="Go to Settings"
          onAction={() => router.push('/dashboard/settings')}
        />
      )}

      {!loading && hasData && (
        <>
          {/* KPIs */}
          <div className="kpi-grid" style={{ marginBottom: 20 }}>
            {[
              { label: 'Sessions', value: totalSessions.toLocaleString(), icon: BarChart3, color: '#6366F1', sub: `${days}d period` },
              { label: 'Users', value: totalUsers.toLocaleString(), icon: Users, color: '#3b82f6', sub: 'Unique visitors' },
              { label: 'Pageviews', value: totalPageviews.toLocaleString(), icon: MousePointer, color: '#10B981', sub: `${pagesPerSession} pages/session` },
              { label: 'WoW Change', value: `${wowChange > 0 ? '+' : ''}${wowChange}%`, icon: wowChange >= 0 ? TrendingUp : TrendingDown, color: wowChange >= 0 ? '#10B981' : '#EF4444', sub: 'vs previous period' },
            ].map(kpi => (
              <div key={kpi.label} style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <kpi.icon size={14} color={kpi.color} />
                  <span style={{ fontSize: 12, color: '#888888' }}>{kpi.label}</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#FAFAFA', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>{kpi.value}</div>
                <div style={{ fontSize: 11, color: '#555555' }}>{kpi.sub}</div>
              </div>
            ))}
          </div>

          {/* Insights row */}
          {(anomalies.length > 0 || wowChange !== 0) && (
            <div className="three-col" style={{ marginBottom: 20 }}>
              {wowChange !== 0 && (
                <InsightCard
                  icon={wowChange > 0 ? TrendingUp : TrendingDown}
                  color={wowChange > 0 ? '#10B981' : '#EF4444'}
                  title="Week-over-Week"
                  value={`${wowChange > 0 ? '+' : ''}${wowChange}%`}
                  sub={wowChange > 0 ? 'Traffic growing' : 'Traffic declining'}
                />
              )}
              {anomalies.length > 0 && (
                <InsightCard
                  icon={Zap}
                  color="#F59E0B"
                  title="Anomalies Detected"
                  value={`${anomalies.length} days`}
                  sub="Unusual traffic spikes or drops"
                />
              )}
              {topSources[0] && (
                <InsightCard
                  icon={Star}
                  color="#6366F1"
                  title="Top Source"
                  value={topSources[0].source || 'direct'}
                  sub={`${topSources[0].sessions?.toLocaleString()} sessions`}
                />
              )}
            </div>
          )}

          {/* Sessions trend */}
          <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#FAFAFA', marginBottom: 4 }}>Sessions Trend</h2>
            <p style={{ fontSize: 12, color: '#555555', marginBottom: 16 }}>Daily sessions over the last 14 days</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#222222" tick={{ fill: '#555555', fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis stroke="#222222" tick={{ fill: '#555555', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="sessions" stroke="#6366F1" fill="url(#gSessions)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="two-col-equal" style={{ marginBottom: 20 }}>
            {/* Traffic sources */}
            {topSources.length > 0 && (
              <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: 12, padding: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#FAFAFA', marginBottom: 4 }}>Traffic Sources</h2>
                <p style={{ fontSize: 12, color: '#555555', marginBottom: 16 }}>Where your visitors come from</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {topSources.slice(0, 6).map((s, i) => {
                    const pct = totalSessions > 0 ? ((s.sessions || 0) / totalSessions * 100) : 0;
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, color: '#FAFAFA', fontWeight: 500, textTransform: 'capitalize' }}>{s.source || 'direct'}</span>
                          <span style={{ fontSize: 12, color: '#888888', fontFamily: 'var(--font-mono)' }}>{(s.sessions || 0).toLocaleString()} ({pct.toFixed(1)}%)</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, backgroundColor: '#1A1A1A', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 3, backgroundColor: COLORS[i % COLORS.length], width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top pages */}
            {topPages.length > 0 && (
              <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: 12, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: '#FAFAFA', marginBottom: 4 }}>Top Pages</h2>
                    <p style={{ fontSize: 12, color: '#555555' }}>Highest traffic pages</p>
                  </div>
                  <button onClick={() => exportPagesCSV(topPages)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, border: '1px solid #333333', backgroundColor: 'transparent', color: '#888888', fontSize: 11, cursor: 'pointer' }}>
                    <Download size={11} /> Export
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {topPages.slice(0, 8).map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 7 ? '1px solid #222222' : 'none' }}>
                      <span style={{ fontSize: 11, color: '#555555', width: 20, textAlign: 'right', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>{i + 1}</span>
                      <span style={{ flex: 1, fontSize: 12, color: '#FAFAFA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.page}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#FAFAFA', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>{(p.pageviews || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </PageShell>
  );
}
