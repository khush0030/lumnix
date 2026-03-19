'use client';
import { BarChart3, DollarSign, TrendingUp, Target, ArrowUpRight, ArrowDownRight, Zap, Brain, Link2, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useWorkspace } from '@/lib/hooks';

const kpis = [
  { label: 'Total Traffic', value: '124,832', change: '+12.4%', up: true, icon: BarChart3, color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  { label: 'Ad Spend', value: '$8,420', change: '-3.2%', up: false, icon: DollarSign, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  { label: 'Conversions', value: '3,847', change: '+18.6%', up: true, icon: TrendingUp, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  { label: 'Overall ROAS', value: '4.2x', change: '+0.8x', up: true, icon: Target, color: '#0891B2', bg: 'rgba(8,145,178,0.1)' },
];

const trafficData = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  organic: Math.floor(1800 + Math.random() * 800 + i * 30),
  paid: Math.floor(800 + Math.random() * 400 + i * 15),
  social: Math.floor(400 + Math.random() * 200),
}));

const channelData = [
  { name: 'Organic', value: 48, color: '#10B981' },
  { name: 'Paid Search', value: 28, color: '#7C3AED' },
  { name: 'Social', value: 14, color: '#0891B2' },
  { name: 'Direct', value: 10, color: '#F59E0B' },
];

const recentAlerts = [
  { text: 'Traffic spike: +34% on /pricing page', severity: 'info', time: '2h ago' },
  { text: 'Google Ads CPC increased by 22%', severity: 'warning', time: '5h ago' },
  { text: 'Meta Ads campaign "Spring" exhausted budget', severity: 'critical', time: '8h ago' },
];

export default function DashboardPage() {
  const { workspace } = useWorkspace();
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.5px', fontFamily: 'var(--font-display)' }}>Welcome back</h1>
        <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px', fontFamily: 'var(--font-body)' }}>{workspace?.name ? `${workspace.name} performance at a glance` : 'Your marketing performance at a glance'}</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <div key={kpi.label} style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px', padding: '20px', position: 'relative', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <kpi.icon size={20} color={kpi.color} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: 600, color: kpi.up ? '#10B981' : '#EF4444', backgroundColor: kpi.up ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '3px 8px', borderRadius: '20px', fontFamily: 'var(--font-body)' }}>
                {kpi.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {kpi.change}
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.5px', fontFamily: 'var(--font-display)' }}>{kpi.value}</div>
            <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px', fontFamily: 'var(--font-body)' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="two-col">
        {/* Traffic Trend */}
        <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#F8FAFC', fontFamily: 'var(--font-display)' }}>Traffic Overview</h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px', fontFamily: 'var(--font-body)' }}>Last 30 days</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[{ label: 'Organic', color: '#10B981' }, { label: 'Paid', color: '#7C3AED' }, { label: 'Social', color: '#0891B2' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: l.color }} />
                  <span style={{ fontSize: '12px', color: '#64748B', fontFamily: 'var(--font-body)' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trafficData}>
              <defs>
                <linearGradient id="gOrg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.2} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
                <linearGradient id="gPaid" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7C3AED" stopOpacity={0.2} /><stop offset="100%" stopColor="#7C3AED" stopOpacity={0} /></linearGradient>
                <linearGradient id="gSoc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0891B2" stopOpacity={0.2} /><stop offset="100%" stopColor="#0891B2" stopOpacity={0} /></linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#334155" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#334155" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC', fontSize: '12px' }} />
              <Area type="monotone" dataKey="organic" stroke="#10B981" fill="url(#gOrg)" strokeWidth={2} />
              <Area type="monotone" dataKey="paid" stroke="#7C3AED" fill="url(#gPaid)" strokeWidth={2} />
              <Area type="monotone" dataKey="social" stroke="#0891B2" fill="url(#gSoc)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Breakdown */}
        <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#F8FAFC', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>Channel Breakdown</h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px', fontFamily: 'var(--font-body)' }}>Traffic by source</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={channelData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} strokeWidth={0}>
                  {channelData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            {channelData.map(ch => (
              <div key={ch.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: ch.color }} />
                <span style={{ flex: 1, fontSize: '13px', color: '#94A3B8', fontFamily: 'var(--font-body)' }}>{ch.name}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC', fontFamily: 'var(--font-display)' }}>{ch.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="two-col-equal">
        {/* Recent Alerts */}
        <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#F8FAFC', fontFamily: 'var(--font-display)' }}>Recent Alerts</h2>
            <a href="/dashboard/alerts" style={{ fontSize: '13px', color: '#7C3AED', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>View all →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentAlerts.map((alert, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', borderRadius: '10px', backgroundColor: '#0F172A', border: '1px solid #334155' }}>
                <AlertCircle size={16} style={{ color: alert.severity === 'critical' ? '#EF4444' : alert.severity === 'warning' ? '#F59E0B' : '#0891B2', marginTop: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#94A3B8', fontFamily: 'var(--font-body)' }}>{alert.text}</div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', fontFamily: 'var(--font-body)' }}>{alert.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#F8FAFC', marginBottom: '16px', fontFamily: 'var(--font-display)' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Run SEO Audit', desc: 'Analyze any website', icon: Zap, href: '/dashboard/seo' },
              { label: 'Connect Integration', desc: 'GSC, GA4, Ads', icon: Link2, href: '/dashboard/settings' },
              { label: 'Ask AI', desc: 'Query your data', icon: Brain, href: '/dashboard/ai' },
            ].map(action => (
              <a key={action.label} href={action.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '10px', backgroundColor: '#0F172A', border: '1px solid #334155', textDecoration: 'none', cursor: 'pointer' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <action.icon size={18} color="#A78BFA" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#F8FAFC', fontFamily: 'var(--font-body)' }}>{action.label}</div>
                  <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'var(--font-body)' }}>{action.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
