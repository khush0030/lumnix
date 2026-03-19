'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Search, BarChart3, DollarSign,
  Target, Brain, Eye, FileText, Bell, Settings,
  Menu, X, LogOut, ChevronRight, ChevronDown, Plus
} from 'lucide-react';
import { useWorkspace } from '@/lib/hooks';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/seo', label: 'SEO Intelligence', icon: Search },
  { href: '/dashboard/analytics', label: 'Web Analytics', icon: BarChart3 },
  { href: '/dashboard/google-ads', label: 'Google Ads', icon: DollarSign },
  { href: '/dashboard/meta-ads', label: 'Meta Ads', icon: Target },
  { href: '/dashboard/ai', label: 'AI Assistant', icon: Brain },
  { href: '/dashboard/competitors', label: 'Competitor Spy', icon: Eye, accent: '#BE123C' },
  { href: '/dashboard/reports', label: 'Reports', icon: FileText },
  { href: '/dashboard/alerts', label: 'Alerts', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function WorkspaceSwitcher({ workspace, accent }: { workspace: any; accent: string }) {
  const [open, setOpen] = useState(false);
  const initials = workspace?.name ? workspace.name.substring(0, 2).toUpperCase() : 'LX';

  return (
    <div style={{ position: 'relative', marginBottom: '20px' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: '10px', border: '1px solid #334155',
          backgroundColor: '#1E293B', cursor: 'pointer', textAlign: 'left',
        }}
      >
        {workspace?.logo_url ? (
          <img src={workspace.logo_url} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0, fontFamily: 'var(--font-display)' }}>
            {initials}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-body)' }}>
            {workspace?.name || 'My Workspace'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-body)' }}>Workspace</div>
        </div>
        <ChevronDown size={14} color="#64748B" style={{ flexShrink: 0 }} />
      </button>

      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '10px', overflow: 'hidden', zIndex: 100 }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #334155' }}>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-body)' }}>Workspaces</div>
          </div>
          <div style={{ padding: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {workspace?.logo_url ? (
              <img src={workspace.logo_url} alt="Logo" style={{ width: '24px', height: '24px', borderRadius: '6px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'white', fontFamily: 'var(--font-display)' }}>
                {initials}
              </div>
            )}
            <span style={{ fontSize: '13px', color: '#F8FAFC', flex: 1, fontFamily: 'var(--font-body)' }}>{workspace?.name || 'My Workspace'}</span>
            <Check size={12} color={accent} />
          </div>
          <div style={{ borderTop: '1px solid #334155', padding: '6px' }}>
            <button
              onClick={() => setOpen(false)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 6px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', color: '#64748B', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
            >
              <Plus size={14} /> Add Brand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Check({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { workspace } = useWorkspace();
  const accent = workspace?.brand_color || '#7C3AED';

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent);
  }, [accent]);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const sidebar = (
    <div style={{
      width: '260px', minHeight: '100vh', backgroundColor: '#0F172A',
      borderRight: '1px solid #1E293B', display: 'flex', flexDirection: 'column',
      padding: '16px 12px', flexShrink: 0
    }}>
      {/* Lumnix Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-1.5px', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
          <span style={{ color: '#7C3AED' }}>L</span><span style={{ color: '#F8FAFC' }}>umnix</span>
        </span>
        <span style={{ fontSize: '10px', color: '#7C3AED', fontWeight: 600, backgroundColor: 'rgba(124,58,237,0.15)', padding: '2px 6px', borderRadius: '4px', marginLeft: 'auto', fontFamily: 'var(--font-body)' }}>BETA</span>
      </div>

      {/* Workspace Switcher */}
      <WorkspaceSwitcher workspace={workspace} accent={accent} />

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          const itemAccent = item.accent || accent;
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => { e.preventDefault(); router.push(item.href); setSidebarOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '8px',
                backgroundColor: active ? 'rgba(124,58,237,0.12)' : 'transparent',
                color: active ? '#A78BFA' : '#64748B',
                fontSize: '14px', fontWeight: active ? 600 : 400,
                fontFamily: 'var(--font-body)',
                textDecoration: 'none', cursor: 'pointer',
                transition: 'all 0.15s ease',
                borderLeft: active ? '2px solid #7C3AED' : '2px solid transparent',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.color = '#94A3B8';
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#1E293B';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.color = '#64748B';
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
                }
              }}
            >
              <item.icon size={18} color={active ? '#A78BFA' : (item.accent ? itemAccent : undefined)} />
              <span style={{ color: item.accent && !active ? itemAccent : undefined }}>{item.label}</span>
              {active && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #1E293B', paddingTop: '12px', marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: accent, fontFamily: 'var(--font-display)', border: '1px solid #334155' }}>
            {workspace?.name ? workspace.name[0].toUpperCase() : 'L'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', fontFamily: 'var(--font-body)' }}>Account</div>
            <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-body)' }}>{workspace?.name || 'Lumnix'}</div>
          </div>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0F172A' }}>
      {/* Desktop Sidebar */}
      <div style={{ display: 'none' }} className="desktop-sidebar">{sidebar}</div>
      <style>{`.desktop-sidebar { display: flex !important; } @media (max-width: 768px) { .desktop-sidebar { display: none !important; } }`}</style>

      {/* Mobile Header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, backgroundColor: '#0F172A', borderBottom: '1px solid #1E293B', padding: '12px 16px', display: 'none' }} className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-1.5px', fontFamily: 'var(--font-display)' }}>
            <span style={{ color: '#7C3AED' }}>L</span><span style={{ color: '#F8FAFC' }}>umnix</span>
          </span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .mobile-header { display: block !important; } }`}</style>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} />
          <div style={{ position: 'relative', zIndex: 51 }}>{sidebar}</div>
        </div>
      )}

      {/* Main */}
      <main style={{ flex: 1, padding: '32px', overflow: 'auto', maxHeight: '100vh' }} className="main-content">
        {children}
      </main>
      <style>{`@media (max-width: 768px) { .main-content { padding: 16px !important; paddingTop: 72px !important; } }`}</style>
    </div>
  );
}
