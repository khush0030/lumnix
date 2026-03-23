'use client';
import { type LucideIcon } from 'lucide-react';
import { useTheme } from '@/lib/theme';

export function PageShell({ title, description, icon: Icon, badge, action, children }: {
  title: string; description: string; icon: LucideIcon; badge?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  const { c } = useTheme();
  return (
    <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: c.text, letterSpacing: '-0.02em' }}>{title}</h1>
            {badge && <span style={{ fontSize: '10px', fontWeight: 600, color: '#7C3AED', backgroundColor: 'rgba(124,58,237,0.1)', padding: '2px 7px', borderRadius: '4px', letterSpacing: '0.02em' }}>{badge}</span>}
          </div>
          <p style={{ fontSize: '13px', color: c.textSecondary, lineHeight: 1.6 }}>{description}</p>
        </div>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: {
  icon: LucideIcon; title: string; description: string; actionLabel?: string; onAction?: () => void;
}) {
  const { c } = useTheme();
  return (
    <div style={{ backgroundColor: c.bgCard, borderRadius: '14px', padding: '60px 40px', textAlign: 'center', boxShadow: c.shadow }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(124,58,237,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
        <Icon size={22} color="#7C3AED" />
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: c.text, marginBottom: '8px', letterSpacing: '-0.01em' }}>{title}</h3>
      <p style={{ fontSize: '13px', color: c.textSecondary, maxWidth: '380px', margin: '0 auto 20px', lineHeight: 1.6 }}>{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#7C3AED', color: 'white', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
