'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Search, BarChart3, DollarSign,
  Target, Brain, Eye, FileText, Bell, Settings,
  Menu, X, LogOut, ChevronDown, Plus
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

function CheckIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function WorkspaceSwitcher({ workspace, accent }: { workspace: any; accent: string }) {
  const [open, setOpen] = useState(false);
  const initials = workspace?.name ? workspace.name.substring(0, 2).toUpperCase() : 'LX';

  return (
    <div style={{ position: 'relative', marginBottom: '8px' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC', cursor: 'pointer', textAlign: 'left',
        }}
      >
        {workspace?.logo_url ? (
          <img src={workspace.logo_url} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {initials}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {workspace?.name || 'My Workspace'}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>Workspace</div>
        </div>
        <ChevronDown size={14} color="#94A3B8" style={{ flexShrink: 0 }} />
      </button>

      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden', zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Workspaces</div>
          </div>
          <div style={{ padding: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {workspace?.logo_url ? (
              <img src={workspace.logo_url} alt="Logo" style={{ width: '24px', height: '24px', borderRadius: '6px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'white' }}>
                {initials}
              </div>
            )}
            <span style={{ fontSize: '13px', color: '#0F172A', flex: 1 }}>{workspace?.name || 'My Workspace'}</span>
            <CheckIcon size={12} color={accent} />
          </div>
          <div style={{ borderTop: '1px solid #F1F5F9', padding: '6px' }}>
            <button
              onClick={() => setOpen(false)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 6px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', color: '#64748B', fontSize: '13px', cursor: 'pointer' }}
            >
              <Plus size={14} /> Add Brand
            </button>
          </div>
        </div>
      )}
    </div>
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

  // Current page title
  const currentNav = navItems.find(n => isActive(n.href));

  const sidebar = (
    <div style={{
      width: '240px', minHeight: '100vh', backgroundColor: '#FFFFFF',
      borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column',
      padding: '16px 12px', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', marginBottom: '20px' }}>
        <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-1.5px', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
          <span style={{ color: '#7C3AED' }}>L</span><span style={{ color: '#0F172A' }}>umnix</span>
        </span>
        <span style={{ fontSize: '10px', color: '#7C3AED', fontWeight: 700, backgroundColor: '#F5F3FF', padding: '2px 7px', borderRadius: '4px', marginLeft: 'auto', letterSpacing: '0.5px' }}>BETA</span>
      </div>

      {/* Workspace Switcher */}
      <WorkspaceSwitcher workspace={workspace} accent={accent} />

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '12px 0' }} />

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          const isCompetitor = !!item.accent;
          const itemColor = isCompetitor ? '#BE123C' : '#7C3AED';

          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => { e.preventDefault(); router.push(item.href); setSidebarOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '8px',
                backgroundColor: active ? (isCompetitor ? '#FFF1F2' : '#F5F3FF') : 'transparent',
                color: active ? itemColor : '#475569',
                fontSize: '14px', fontWeight: active ? 600 : 400,
                textDecoration: 'none', cursor: 'pointer',
                transition: 'all 0.12s ease',
                borderLeft: active ? `3px solid ${itemColor}` : '3px solid transparent',
                paddingLeft: active ? '10px' : '12px',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#F8FAFC';
                  (e.currentTarget as HTMLAnchorElement).style.color = '#0F172A';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.color = '#475569';
                }
              }}
            >
              <item.icon size={17} color={active ? itemColor : '#94A3B8'} />
              <span>{item.label}</span>
              {isCompetitor && !active && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#BE123C', marginLeft: 'auto', flexShrink: 0 }} />
              )}
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px', marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: accent, border: '1px solid #E2E8F0', flexShrink: 0 }}>
            {workspace?.name ? workspace.name[0].toUpperCase() : 'L'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>Account</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>{workspace?.name || 'Lumnix'}</div>
          </div>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px' }} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Desktop Sidebar */}
      <div style={{ display: 'none' }} className="desktop-sidebar">{sidebar}</div>
      <style>{`.desktop-sidebar { display: flex !important; } @media (max-width: 768px) { .desktop-sidebar { display: none !important; } }`}</style>

      {/* Mobile Header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '12px 16px', display: 'none' }} className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-1.5px', fontFamily: 'var(--font-display)' }}>
            <span style={{ color: '#7C3AED' }}>L</span><span style={{ color: '#0F172A' }}>umnix</span>
          </span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .mobile-header { display: block !important; } }`}</style>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)' }} />
          <div style={{ position: 'relative', zIndex: 51 }}>{sidebar}</div>
        </div>
      )}

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', maxHeight: '100vh', backgroundColor: '#F8FAFC' }} className="main-content">
        {/* Top header bar */}
        <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 30 }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#0F172A', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
              {currentNav?.label || 'Dashboard'}
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '1px' }}>
              {workspace?.name || 'Lumnix'} · Last 30 days
            </p>
          </div>
        </div>
        {/* Page content */}
        <div style={{ padding: '28px 32px' }}>
          {children}
        </div>
      </main>
      <style>{`@media (max-width: 768px) { .main-content { padding: 0 !important; } }`}</style>
    </div>
  );
}
