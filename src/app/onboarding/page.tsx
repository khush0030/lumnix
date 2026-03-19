'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Check, Search, BarChart3, Target, Share2, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const BRAND_COLORS = [
  { label: 'Purple', value: '#7C3AED' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Orange', value: '#f59e0b' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Red', value: '#ef4444' },
];

const INTEGRATIONS = [
  { id: 'gsc', name: 'Google Search Console', icon: Search, color: '#4285F4', desc: 'Track keyword rankings & clicks' },
  { id: 'ga4', name: 'Google Analytics 4', icon: BarChart3, color: '#E37400', desc: 'Website traffic & conversions' },
  { id: 'google_ads', name: 'Google Ads', icon: Target, color: '#34A853', desc: 'Campaign performance & ROAS' },
  { id: 'meta_ads', name: 'Meta Ads', icon: Share2, color: '#1877F2', desc: 'Facebook & Instagram ads' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [brandName, setBrandName] = useState('');
  const [brandColor, setBrandColor] = useState('#7C3AED');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleLogoUpload(file: File) {
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const ext = file.name.split('.').pop();
      const path = `${session.user.id}/logo.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('brand-assets')
        .upload(path, file, { upsert: true });
      if (!upErr) {
        const { data } = supabase.storage.from('brand-assets').getPublicUrl(path);
        setLogoUrl(data.publicUrl);
        setLogoPreview(URL.createObjectURL(file));
      }
    } catch {}
    setUploading(false);
  }

  async function handleStep1Submit() {
    if (!brandName.trim()) { setError('Please enter a brand name'); return; }
    setSaving(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth/signin'); return; }
      const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await fetch('/api/workspace', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name: brandName, brand_color: brandColor, logo_url: logoUrl, slug }),
      });
      setStep(2);
    } catch {
      setError('Failed to save. Please try again.');
    }
    setSaving(false);
  }

  async function handleConnect(providerId: string) {
    setConnecting(providerId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const wRes = await fetch('/api/workspace', { headers: { Authorization: `Bearer ${session.access_token}` } });
      const { workspace } = await wRes.json();
      if (!workspace?.id) return;
      const res = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId, workspace_id: workspace.id }),
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      }
    } catch {}
    setConnecting(null);
  }

  const stepStyle = (n: number) => ({
    width: '32px', height: '32px', borderRadius: '50%',
    display: 'flex', alignItems: 'center' as const, justifyContent: 'center',
    fontSize: '14px', fontWeight: 700,
    fontFamily: 'var(--font-display)',
    backgroundColor: step > n ? '#10B981' : step === n ? '#7C3AED' : '#1E293B',
    color: step >= n ? 'white' : '#64748B',
    border: step > n ? 'none' : step === n ? 'none' : '1px solid #334155',
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F172A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <span style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1.5px', fontFamily: 'var(--font-display)' }}>
          <span style={{ color: '#7C3AED' }}>L</span><span style={{ color: '#F8FAFC' }}>umnix</span>
        </span>
      </div>

      {/* Steps indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
        {[1, 2, 3].map((n, i) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={stepStyle(n)}>
              {step > n ? <Check size={16} /> : n}
            </div>
            {i < 2 && <div style={{ width: '48px', height: '2px', backgroundColor: step > n ? '#10B981' : '#334155' }} />}
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: '520px', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '20px', padding: '36px' }}>

        {/* Step 1: Brand Setup */}
        {step === 1 && (
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#F8FAFC', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>Set up your brand</h1>
            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '28px' }}>This personalizes your Lumnix dashboard</p>

            {/* Brand Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>Brand Name</label>
              <input
                type="text"
                placeholder="e.g. Acme Corp"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0F172A', color: '#F8FAFC', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)' }}
              />
            </div>

            {/* Logo Upload */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '8px' }}>Logo (optional)</label>
              <div
                onClick={() => fileRef.current?.click()}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', borderRadius: '8px', border: '2px dashed #334155', cursor: 'pointer', backgroundColor: '#0F172A' }}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#1E293B', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {uploading ? <Loader2 size={20} color="#64748B" style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={20} color="#64748B" />}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 500 }}>{uploading ? 'Uploading...' : logoPreview ? 'Logo uploaded' : 'Click to upload logo'}</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>PNG, JPG up to 2MB</div>
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }}
              />
            </div>

            {/* Brand Color */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#94A3B8', marginBottom: '10px' }}>Brand Color</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {BRAND_COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setBrandColor(c.value)}
                    title={c.label}
                    style={{
                      width: '38px', height: '38px', borderRadius: '10px',
                      backgroundColor: c.value, border: 'none', cursor: 'pointer',
                      outline: brandColor === c.value ? `3px solid white` : '3px solid transparent',
                      outlineOffset: '2px', position: 'relative',
                    }}
                  >
                    {brandColor === c.value && (
                      <Check size={16} color="white" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleStep1Submit}
              disabled={saving}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#7C3AED', color: 'white', fontSize: '14px', fontWeight: 600, cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'var(--font-body)' }}
            >
              {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {saving ? 'Saving...' : 'Continue'}
              {!saving && <ChevronRight size={16} />}
            </button>
          </div>
        )}

        {/* Step 2: Connect Integrations */}
        {step === 2 && (
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#F8FAFC', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>Connect your data</h1>
            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '28px' }}>Connect your marketing accounts to start seeing real data. You can always do this later in Settings.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
              {INTEGRATIONS.map(int => {
                const Icon = int.icon;
                return (
                  <div key={int.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#0F172A' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${int.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={20} color={int.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>{int.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{int.desc}</div>
                    </div>
                    <button
                      onClick={() => handleConnect(int.id)}
                      disabled={connecting === int.id}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#7C3AED', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, fontFamily: 'var(--font-body)' }}
                    >
                      {connecting === int.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                      Connect
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setStep(3)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: 'transparent', color: '#94A3B8', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
            >
              Skip for now
            </button>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Check size={36} color="#10B981" />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#F8FAFC', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>You&apos;re all set!</h1>
            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '32px', lineHeight: 1.6 }}>
              Your workspace is ready. Head to your dashboard to explore your marketing data and AI insights.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              style={{ width: '100%', padding: '13px', borderRadius: '8px', border: 'none', backgroundColor: '#7C3AED', color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'var(--font-body)' }}
            >
              Go to Dashboard <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {step < 3 && (
        <p style={{ marginTop: '20px', fontSize: '13px', color: '#64748B' }}>
          Step {step} of 3
        </p>
      )}
    </div>
  );
}
