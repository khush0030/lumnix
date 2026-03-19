'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, TrendingDown, Minus, ArrowUpRight, AlertTriangle, Download } from 'lucide-react';
import { PageShell, EmptyState } from '@/components/PageShell';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { DateRangePicker } from '@/components/DateRangePicker';
import { useWorkspace, useGSCData } from '@/lib/hooks';

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
      <div className="two-col"><SkeletonBox h={360} /><SkeletonBox h={360} /></div>
    </>
  );
}

function exportKeywordsCSV(keywords: { query: string; position: number; impressions: number; clicks: number; ctr: number }[]) {
  const headers = ['Keyword', 'Position', 'Impressions', 'Clicks', 'CTR'];
  const rows = keywords.map(kw => [kw.query, kw.position, kw.impressions, kw.clicks, `${kw.ctr.toFixed(1)}%`]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'krato-keywords.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default function SEOPage() {
  const [days, setDays] = useState(30);
  const router = useRouter();
  const { workspace, loading: wsLoading } = useWorkspace();
  const workspaceId = workspace?.id;

  const { data: kwResp, loading: kwLoading } = useGSCData(workspaceId, 'keywords', days);
  const { data: overviewResp, loading: overviewLoading } = useGSCData(workspaceId, 'overview', days);

  const loading = wsLoading || kwLoading || overviewLoading;

  const keywords: { query: string; position: number; impressions: number; clicks: number; ctr: number }[] =
    kwResp?.keywords || [];
  const overviewData: { date: string; clicks: number; impressions: number }[] =
    overviewResp?.overview || [];

  const hasData = keywords.length > 0;

  // KPI totals
  const totalClicks = keywords.reduce((s, r) => s + (r.clicks || 0), 0);
  const totalImpressions = keywords.reduce((s, r) => s + (r.impressions || 0), 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0';
  const avgPosition = keywords.length > 0
    ? (keywords.reduce((s, r) => s + (r.position || 0), 0) / keywords.length).toFixed(1)
    : '0';

  // Position trend from overview data (use click share as proxy)
  const trendData = overviewData.slice(-14).map(r => ({
    day: r.date?.slice(5) ?? '',
    clicks: r.clicks || 0,
    impressions: r.impressions || 0,
  }));

  return (
    <PageShell title="SEO Intelligence" description="Google Search Console data & keyword tracking" icon={Search}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <DateRangePicker value={days} onChange={setDays} />
      </div>

      {loading && <LoadingSkeleton />}

      {!loading && !hasData && (
        <EmptyState
          icon={Search}
          title="No GSC data yet"
          description="Connect your Google Search Console property in Settings, then sync it to see keyword and traffic data."
          actionLabel="Go to Settings"
          onAction={() => router.push('/dashboard/settings')}
        />
      )}

      {!loading && hasData && (
        <>
          {/* KPI Row */}
          <div className="kpi-grid">
            {[
              { label: 'Total Clicks', value: totalClicks.toLocaleString(), up: true },
              { label: 'Impressions', value: totalImpressions.toLocaleString(), up: true },
              { label: 'Avg CTR', value: `${avgCTR}%`, up: true },
              { label: 'Avg Position', value: avgPosition, up: true },
            ].map(kpi => (
              <div key={kpi.label} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '12px', color: '#71717a', marginBottom: '6px' }}>{kpi.label}</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#f4f4f5' }}>{kpi.value}</div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#22c55e', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ArrowUpRight size={12} /> Live data
                </div>
              </div>
            ))}
          </div>

          <div className="two-col">
            {/* Keyword Table */}
            <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f4f4f5' }}>Top Keywords</h2>
                <button onClick={() => exportKeywordsCSV(keywords)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #3f3f46', backgroundColor: '#27272a', color: '#a1a1aa', fontSize: '12px', cursor: 'pointer' }}>
                  <Download size={12} /> Export CSV
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Keyword', 'Pos', 'Impr', 'Clicks', 'CTR'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.5px', paddingBottom: '10px', borderBottom: '1px solid #27272a' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {keywords.slice(0, 20).map((kw, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1e1e22' }}>
                      <td style={{ padding: '10px 0', fontSize: '13px', color: '#e4e4e7', fontWeight: 500, maxWidth: '220px' }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kw.query}</div>
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: '13px', fontWeight: 600, color: kw.position <= 3 ? '#22c55e' : kw.position <= 10 ? '#f59e0b' : '#a1a1aa' }}>{kw.position}</td>
                      <td style={{ padding: '10px 8px', fontSize: '13px', color: '#a1a1aa' }}>{(kw.impressions || 0).toLocaleString()}</td>
                      <td style={{ padding: '10px 8px', fontSize: '13px', color: '#a1a1aa' }}>{(kw.clicks || 0).toLocaleString()}</td>
                      <td style={{ padding: '10px 0', fontSize: '13px', color: '#a1a1aa' }}>{(kw.ctr || 0).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Clicks Trend + CTR Gaps */}
            <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f4f4f5', marginBottom: '4px' }}>Clicks Trend</h2>
              <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '16px' }}>Daily clicks from Search Console</p>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="gClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
                    <YAxis stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="clicks" stroke="#7c3aed" fill="url(#gClicks)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontSize: '13px', color: '#52525b' }}>No daily data available</p>
                </div>
              )}

              {/* CTR Gap Opportunities — keywords ranking 4-10 with below-average CTR */}
              {(() => {
                const gaps = keywords
                  .filter(kw => kw.position >= 4 && kw.position <= 10 && kw.ctr < 5 && kw.impressions > 100)
                  .slice(0, 3);
                if (!gaps.length) return null;
                return (
                  <>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#f4f4f5', marginTop: '20px', marginBottom: '10px' }}>CTR Gap Opportunities</h3>
                    {gaps.map(gap => (
                      <div key={gap.query} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: '1px solid #1e1e22' }}>
                        <AlertTriangle size={14} color="#f59e0b" />
                        <span style={{ flex: 1, fontSize: '12px', color: '#a1a1aa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gap.query}</span>
                        <span style={{ fontSize: '12px', color: '#ef4444', flexShrink: 0 }}>{gap.ctr.toFixed(1)}%</span>
                        <span style={{ fontSize: '12px', color: '#52525b' }}>→</span>
                        <span style={{ fontSize: '12px', color: '#22c55e', flexShrink: 0 }}>pos {gap.position}</span>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}
