import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const SAMPLE_DATA = [
  { channel: 'Organic Search', touchpoints: [{ channel: 'Organic Search', timestamp: '2026-03-15' }], conversion_value: 2400 },
  { channel: 'Organic Search', touchpoints: [{ channel: 'Organic Search', timestamp: '2026-03-18' }], conversion_value: 1800 },
  { channel: 'Organic Search', touchpoints: [{ channel: 'Organic Search', timestamp: '2026-03-20' }, { channel: 'Email', timestamp: '2026-03-22' }], conversion_value: 3200 },
  { channel: 'Paid Search', touchpoints: [{ channel: 'Paid Search', timestamp: '2026-03-10' }], conversion_value: 1500 },
  { channel: 'Paid Search', touchpoints: [{ channel: 'Paid Search', timestamp: '2026-03-14' }, { channel: 'Direct', timestamp: '2026-03-16' }], conversion_value: 2100 },
  { channel: 'Social Media', touchpoints: [{ channel: 'Social Media', timestamp: '2026-03-12' }], conversion_value: 900 },
  { channel: 'Social Media', touchpoints: [{ channel: 'Social Media', timestamp: '2026-03-19' }, { channel: 'Organic Search', timestamp: '2026-03-21' }], conversion_value: 1600 },
  { channel: 'Social Media', touchpoints: [{ channel: 'Social Media', timestamp: '2026-03-25' }], conversion_value: 750 },
  { channel: 'Email', touchpoints: [{ channel: 'Email', timestamp: '2026-03-08' }], conversion_value: 3100 },
  { channel: 'Email', touchpoints: [{ channel: 'Organic Search', timestamp: '2026-03-05' }, { channel: 'Email', timestamp: '2026-03-09' }], conversion_value: 2800 },
  { channel: 'Email', touchpoints: [{ channel: 'Email', timestamp: '2026-03-22' }], conversion_value: 1900 },
  { channel: 'Direct', touchpoints: [{ channel: 'Direct', timestamp: '2026-03-16' }], conversion_value: 1200 },
  { channel: 'Direct', touchpoints: [{ channel: 'Paid Search', timestamp: '2026-03-11' }, { channel: 'Direct', timestamp: '2026-03-17' }], conversion_value: 2000 },
  { channel: 'Referral', touchpoints: [{ channel: 'Referral', timestamp: '2026-03-13' }], conversion_value: 800 },
  { channel: 'Referral', touchpoints: [{ channel: 'Referral', timestamp: '2026-03-20' }, { channel: 'Direct', timestamp: '2026-03-23' }], conversion_value: 1100 },
  { channel: 'Paid Social', touchpoints: [{ channel: 'Paid Social', timestamp: '2026-03-14' }], conversion_value: 1400 },
  { channel: 'Paid Social', touchpoints: [{ channel: 'Paid Social', timestamp: '2026-03-18' }, { channel: 'Email', timestamp: '2026-03-20' }], conversion_value: 2200 },
  { channel: 'Paid Social', touchpoints: [{ channel: 'Paid Social', timestamp: '2026-03-26' }], conversion_value: 950 },
];

// GET /api/data/attribution — fetch attribution data and calculate model
export async function GET(req: NextRequest) {
  const workspaceId = req.nextUrl.searchParams.get('workspace_id');
  const model = req.nextUrl.searchParams.get('model') || 'last_touch';

  if (!workspaceId) return NextResponse.json({ error: 'Missing workspace_id' }, { status: 400 });

  const db = getSupabaseAdmin();

  // Fetch data
  let { data, error } = await db
    .from('attribution_data')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('converted_at', { ascending: false });

  if (error && !error.message.includes('does not exist')) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Seed sample data if empty
  if (!data || data.length === 0) {
    const sampleRows = SAMPLE_DATA.map(s => ({
      workspace_id: workspaceId,
      channel: s.channel,
      touchpoints: s.touchpoints,
      conversion_value: s.conversion_value,
      converted_at: new Date(s.touchpoints[s.touchpoints.length - 1].timestamp).toISOString(),
    }));

    await db.from('attribution_data').insert(sampleRows);

    const refetch = await db
      .from('attribution_data')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('converted_at', { ascending: false });

    data = refetch.data || sampleRows.map((s, i) => ({ id: `seed-${i}`, ...s }));
  }

  // Calculate attribution based on model
  const channelBreakdown: Record<string, { channel: string; value: number; conversions: number }> = {};

  for (const row of data || []) {
    const touchpoints: any[] = Array.isArray(row.touchpoints) ? row.touchpoints : [];
    const value = row.conversion_value || 0;

    if (touchpoints.length === 0) {
      // Attribute to the row's channel
      if (!channelBreakdown[row.channel]) channelBreakdown[row.channel] = { channel: row.channel, value: 0, conversions: 0 };
      channelBreakdown[row.channel].value += value;
      channelBreakdown[row.channel].conversions += 1;
      continue;
    }

    if (model === 'last_touch') {
      const lastChannel = touchpoints[touchpoints.length - 1]?.channel || row.channel;
      if (!channelBreakdown[lastChannel]) channelBreakdown[lastChannel] = { channel: lastChannel, value: 0, conversions: 0 };
      channelBreakdown[lastChannel].value += value;
      channelBreakdown[lastChannel].conversions += 1;
    } else if (model === 'first_touch') {
      const firstChannel = touchpoints[0]?.channel || row.channel;
      if (!channelBreakdown[firstChannel]) channelBreakdown[firstChannel] = { channel: firstChannel, value: 0, conversions: 0 };
      channelBreakdown[firstChannel].value += value;
      channelBreakdown[firstChannel].conversions += 1;
    } else if (model === 'linear') {
      const share = value / touchpoints.length;
      const convShare = 1 / touchpoints.length;
      for (const tp of touchpoints) {
        const ch = tp.channel || row.channel;
        if (!channelBreakdown[ch]) channelBreakdown[ch] = { channel: ch, value: 0, conversions: 0 };
        channelBreakdown[ch].value += share;
        channelBreakdown[ch].conversions += convShare;
      }
    }
  }

  const breakdown = Object.values(channelBreakdown)
    .sort((a, b) => b.value - a.value)
    .map(c => ({ ...c, value: Math.round(c.value), conversions: Math.round(c.conversions * 100) / 100 }));

  const totalValue = breakdown.reduce((s, c) => s + c.value, 0);
  const totalConversions = data?.length || 0;

  return NextResponse.json({
    model,
    breakdown,
    totalValue,
    totalConversions,
    dataPoints: data?.length || 0,
  });
}
