// Google Ads connector — uses Google Ads API v17
// Requires: Google Ads API enabled + developer token

export async function fetchGoogleAdsCampaigns(
  accessToken: string,
  customerId: string
) {
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      metrics.cost_micros,
      metrics.clicks,
      metrics.impressions,
      metrics.conversions,
      metrics.conversions_value,
      metrics.average_cpc,
      segments.date
    FROM campaign
    WHERE segments.date DURING LAST_30_DAYS
    ORDER BY metrics.cost_micros DESC
    LIMIT 50
  `;

  const res = await fetch(
    `https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:searchStream`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
      },
      body: JSON.stringify({ query }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || 'Google Ads API error');
  }

  const results = await res.json();
  const campaigns: any[] = [];

  for (const batch of results) {
    for (const row of batch.results || []) {
      campaigns.push({
        id: row.campaign?.id,
        name: row.campaign?.name,
        status: row.campaign?.status,
        spend: (row.metrics?.costMicros || 0) / 1_000_000,
        clicks: row.metrics?.clicks || 0,
        impressions: row.metrics?.impressions || 0,
        conversions: row.metrics?.conversions || 0,
        conversions_value: row.metrics?.conversionsValue || 0,
        cpc: (row.metrics?.averageCpc || 0) / 1_000_000,
        date: row.segments?.date,
      });
    }
  }

  return campaigns;
}

export async function fetchGoogleAdsAccounts(accessToken: string) {
  const res = await fetch(
    'https://googleads.googleapis.com/v17/customers:listAccessibleCustomers',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
      },
    }
  );
  const data = await res.json();
  return (data.resourceNames || []).map((r: string) => r.replace('customers/', ''));
}
