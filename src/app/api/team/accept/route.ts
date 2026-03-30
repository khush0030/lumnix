import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// GET /api/team/accept?token=xxx — accept an invite
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const db = getSupabaseAdmin();

  try {
    // Look up the invite in team_invites table
    const { data: invite, error } = await db
      .from('team_invites')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !invite) {
      return redirectWithMessage('/auth/signup', 'Invalid or expired invitation link.');
    }

    // Check expiry
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      await db.from('team_invites').update({ status: 'expired' }).eq('id', invite.id);
      return redirectWithMessage('/auth/signup', 'This invitation has expired. Please ask for a new one.');
    }

    // Check if already accepted
    if (invite.status === 'accepted') {
      return redirectWithMessage('/dashboard', 'This invitation has already been accepted.');
    }

    // Mark invite as accepted
    await db.from('team_invites').update({ status: 'accepted' }).eq('id', invite.id);

    // Check if user already exists with this email
    const { data: existingUsers } = await db.auth.admin.listUsers() as { data: { users: any[] } };
    const existingUser = existingUsers?.users?.find((u: any) => u.email?.toLowerCase() === invite.email?.toLowerCase());

    if (existingUser) {
      // User exists — add them as a workspace member if not already
      const { data: existingMember } = await db
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', invite.workspace_id)
        .eq('user_id', existingUser.id)
        .single();

      if (!existingMember) {
        await db.from('workspace_members').insert({
          workspace_id: invite.workspace_id,
          user_id: existingUser.id,
          role: invite.role || 'member',
        });
      }

      // Redirect to dashboard
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lumnix-ai.vercel.app';
      return NextResponse.redirect(`${appUrl}/dashboard?invite_accepted=true`);
    }

    // User doesn't exist — redirect to signup with invite context
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lumnix-ai.vercel.app';
    return NextResponse.redirect(`${appUrl}/auth/signup?invite=${token}&email=${encodeURIComponent(invite.email)}`);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function redirectWithMessage(path: string, message: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lumnix-ai.vercel.app';
  return NextResponse.redirect(`${appUrl}${path}?message=${encodeURIComponent(message)}`);
}
