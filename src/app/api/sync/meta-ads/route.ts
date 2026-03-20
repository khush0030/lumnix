import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { fetchMetaAdAccounts, fetchMetaInsights } from '@/lib/connectors/meta-ads';

export async function POST(req: NextRequest) {
  try {
    const { integration_id, workspace_id } = await req.json();

    const { data: tokenRow } = await getSupabaseAdmin()
      .from('oauth_tokens')
      .select('*')
      .eq('integration_id', integration_id)
      .single();

    if (!tokenRow) return NextResponse.json({ error: 'No tokens found' }, { status: 404 });

    const accessToken = tokenRow.access_token;

    const accounts = await fetchMetaAdAccounts(accessToken);
    if (!accounts.length) {
      return NextResponse.json({ error: 'No Meta Ad accounts found.' }, { status: 404 });
    }

    const adAccountId = accounts[0].id;
    const insights = await fetchMetaInsights(accessToken, adAccountId);

    await getSupabaseAdmin().from('analytics_data').delete()
      .eq('workspace_id', workspace_id)
      .eq('provider', 'meta_ads');

    if (insights.length > 0) {
      await getSupabaseAdmin().from('analytics_data').insert({
        workspace_id,
        provider: 'meta_ads',
        metric_type: 'adsets',
        data: insights,
        date_range_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        date_range_end: new Date().toISOString().split('T')[0],
      });
    }

    await getSupabaseAdmin().from('integrations').update({
      status: 'connected',
      last_sync_at: new Date().toISOString(),
      oauth_meta: { ad_account_id: adAccountId, account_name: accounts[0].name },
    }).eq('id', integration_id);

    return NextResponse.json({ success: true, adsets_synced: insights.length, account: accounts[0].name });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Sync failed' }, { status: 500 });
  }
}
