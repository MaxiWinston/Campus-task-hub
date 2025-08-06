import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) throw sessionError;
    
    if (!session) {
      return NextResponse.json(
        { success: true, data: { user: null, session: null } },
        { status: 200 }
      );
    }

    // Get the full user profile with additional data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) throw profileError;

    // Update last active timestamp
    await supabase
      .from('profiles')
      .update({ last_active: new Date().toISOString() })
      .eq('id', session.user.id);

    // Get user stats
    const { data: stats } = await supabase
      .rpc('get_user_stats', { user_id: session.user.id });

    // Get unread notifications count
    const { count: unreadNotifications } = await supabase
      .from('user_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);

    // Combine all user data
    const userData = {
      ...session.user,
      ...profile,
      stats: stats || {},
      unread_notifications: unreadNotifications || 0
    };

    return NextResponse.json({ 
      success: true, 
      data: { 
        user: userData,
        session 
      } 
    });
  } catch (error: any) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while fetching session' 
      },
      { status: 500 }
    );
  }
}
