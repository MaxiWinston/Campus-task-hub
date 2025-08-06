import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

// Get current user's profile
export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get full profile with related data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(
        `
        *,
        skills:user_skills(*),
        verification:user_verification(*, verified_by_user:profiles(*))
      `
      )
      .eq('id', session.user.id)
      .single();

    if (profileError) throw profileError;

    // Get user stats
    const { data: stats } = await supabase
      .rpc('get_user_stats', { user_id: session.user.id });

    // Get unread notifications count
    const { count: unreadNotifications } = await supabase
      .from('user_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);

    // Combine all data
    const userData = {
      ...profile,
      stats: stats || {},
      unread_notifications: unreadNotifications || 0,
      email: session.user.email
    };

    return NextResponse.json({ success: true, data: userData });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while fetching your profile' 
      },
      { status: 500 }
    );
  }
}

// Update current user's profile
export async function PUT(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const updates = await request.json();
    
    // Fields that can be updated
    const allowedFields = [
      'username',
      'full_name',
      'bio',
      'university',
      'student_id',
      'phone_number',
      'location',
      'website',
      'social_links'
    ];

    // Filter updates to only include allowed fields
    const safeUpdates: Record<string, any> = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        safeUpdates[key] = updates[key];
      }
    });

    // If username is being updated, check if it's available
    if (safeUpdates.username) {
      const { data: existingUser, error: usernameError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', safeUpdates.username)
        .neq('id', session.user.id)
        .maybeSingle();

      if (usernameError) throw usernameError;
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Username is already taken' },
          { status: 400 }
        );
      }
    }

    // If student_id is being updated, check if it's available
    if (safeUpdates.student_id) {
      const { data: existingStudent, error: studentError } = await supabase
        .from('profiles')
        .select('id')
        .eq('student_id', safeUpdates.student_id)
        .neq('id', session.user.id)
        .maybeSingle();

      if (studentError) throw studentError;
      if (existingStudent) {
        return NextResponse.json(
          { success: false, error: 'This student ID is already registered' },
          { status: 400 }
        );
      }
    }

    // Update the profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(safeUpdates)
      .eq('id', session.user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ 
      success: true, 
      data: updatedProfile 
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while updating your profile' 
      },
      { status: 500 }
    );
  }
}
