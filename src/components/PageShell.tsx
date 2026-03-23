'use client';
import { type LucideIcon } from 'lucide-react';

export function PageShell({ title, description, icon: Icon, badge, action, children }: {
  title: string; description: string; icon: LucideIcon; badge?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F5F3FF', border: '1px solid #DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} color="#7C3AED" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.3px', fontFamily: 'var(--font-display)' }}>{title}</h1>
              {badge && <span style={{ fontSize: '10px', fontWeight: 700, color: '#7C3AED', backgroundColor: '#F5F3FF', border: '1px solid #DDD6FE', padding: '2px 8px', borderRadius: '4px' }}>{badge}</span>}
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '1px' }}>{description}</p>
          </div>
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
  return (
    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '60px 40px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#F5F3FF', border: '1px solid #DDD6FE', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
        <Icon size={26} color="#7C3AED" />
      </div>
      <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '400px', margin: '0 auto 20px', lineHeight: 1.6 }}>{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
