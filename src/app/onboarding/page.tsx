'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Upload, Check, Search, BarChart3, Target, Share2, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const BRAND_COLORS = [
  { label: 'Purple', value: '#7c3aed' },
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
  const [brandColor, setBrandColor] = useState('#7c3aed');
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
      // Get workspace id
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
    fontSize: '14px', fontWeight: 600,
    backgroundColor: step > n ? '#22c55e' : step === n ? '#7c3aed' : '#27272a',
    color: step >= n ? 'white' : '#71717a',
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={20} color="white" />
        </div>
        <span style={{ fontSize: '22px', fontWeight: 800, color: '#f4f4f5' }}>Krato</span>
      </div>

      {/* Steps indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
        {[1, 2, 3].map((n, i) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={stepStyle(n)}>
              {step > n ? <Check size={16} /> : n}
            </div>
            {i < 2 && <div style={{ width: '48px', height: '2px', backgroundColor: step > n ? '#22c55e' : '#27272a' }} />}
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: '520px', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '20px', padding: '36px' }}>

        {/* Step 1: Brand Setup */}
        {step === 1 && (
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#f4f4f5', marginBottom: '6px' }}>Set up your brand</h1>
            <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '28px' }}>This personalizes your Krato dashboard</p>

            {/* Brand Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '8px' }}>Brand Name</label>
              <input
                type="text"
                placeholder="e.g. Acme Corp"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #3f3f46', backgroundColor: '#27272a', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Logo Upload */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '8px' }}>Logo (optional)</label>
              <div
                onClick={() => fileRef.current?.click()}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', borderRadius: '10px', border: '2px dashed #3f3f46', cursor: 'pointer', backgroundColor: '#111113' }}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {uploading ? <Loader2 size={20} color="#71717a" style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={20} color="#71717a" />}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '14px', color: '#d4d4d8', fontWeight: 500 }}>{uploading ? 'Uploading...' : logoPreview ? 'Logo uploaded' : 'Click to upload logo'}</div>
                  <div style={{ fontSize: '12px', color: '#52525b', marginTop: '2px' }}>PNG, JPG up to 2MB</div>
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '10px' }}>Brand Color</label>
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
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${brandColor}, #4f46e5)`, color: 'white', fontSize: '14px', fontWeight: 600, cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
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
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#f4f4f5', marginBottom: '6px' }}>Connect your data</h1>
            <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '28px' }}>Connect your marketing accounts to start seeing real data. You can always do this later in Settings.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
              {INTEGRATIONS.map(int => {
                const Icon = int.icon;
                return (
                  <div key={int.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', borderRadius: '12px', border: '1px solid #27272a', backgroundColor: '#111113' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${int.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={20} color={int.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#f4f4f5' }}>{int.name}</div>
                      <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>{int.desc}</div>
                    </div>
                    <button
                      onClick={() => handleConnect(int.id)}
                      disabled={connecting === int.id}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
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
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #3f3f46', backgroundColor: 'transparent', color: '#d4d4d8', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
            >
              Skip for now
            </button>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(34,197,94,0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Check size={36} color="#22c55e" />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#f4f4f5', marginBottom: '8px' }}>You&apos;re all set!</h1>
            <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '32px', lineHeight: 1.6 }}>
              Your workspace is ready. Head to your dashboard to explore your marketing data and AI insights.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              style={{ width: '100%', padding: '13px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Go to Dashboard <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {step < 3 && (
        <p style={{ marginTop: '20px', fontSize: '13px', color: '#52525b' }}>
          Step {step} of 3
        </p>
      )}
    </div>
  );
}
