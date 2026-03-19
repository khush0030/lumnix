import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@supabase/supabase-js';

function getUserClient(authHeader: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    { global: { headers: { Authorization: authHeader } } }
  );
}

// GET /api/workspace — get current user's workspace
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getUserClient(authHeader);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();

    const { data: membership } = await admin
      .from('workspace_members')
      .select('workspace_id, role, workspaces(id, name, plan, logo_url, brand_color, slug)')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!membership) {
      const { data: workspace } = await admin
        .from('workspaces')
        .insert({ name: `${user.user_metadata?.full_name || 'My'}'s Workspace`, created_by: user.id })
        .select()
        .single();

      if (workspace) {
        await admin.from('workspace_members').insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'owner',
        });
        return NextResponse.json({ workspace, role: 'owner' });
      }
    }

    return NextResponse.json({
      workspace: membership?.workspaces,
      role: membership?.role,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/workspace — update workspace brand settings
export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getUserClient(authHeader);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const admin = getSupabaseAdmin();

    const { data: membership } = await admin
      .from('workspace_members')
      .select('workspace_id, role')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 });
    }

    if (!['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const updates: Record<string, string> = {};
    if (body.name) updates.name = body.name;
    if (body.brand_color) updates.brand_color = body.brand_color;
    if (body.logo_url !== undefined) updates.logo_url = body.logo_url;
    if (body.slug) updates.slug = body.slug;

    const { data: workspace, error } = await admin
      .from('workspaces')
      .update(updates)
      .eq('id', membership.workspace_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ workspace });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
