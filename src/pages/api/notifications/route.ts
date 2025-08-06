import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

// Get user notifications
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Build the query
    let query = supabase
      .from('user_notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply unread filter if specified
    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data: notifications, error, count } = await query;

    if (error) throw error;

    // Get related data for each notification
    const enhancedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        // For task-related notifications, fetch task details
        if (notification.data?.task_id) {
          const { data: task } = await supabase
            .from('tasks')
            .select('id, title, status')
            .eq('id', notification.data.task_id)
            .single();
          
          return {
            ...notification,
            task
          };
        }
        return notification;
      })
    );

    return NextResponse.json({ 
      success: true, 
      data: {
        notifications: enhancedNotifications,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0)
      }
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while fetching notifications' 
      },
      { status: 500 }
    );
  }
}

// Mark all notifications as read
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

    // Mark all unread notifications as read
    const { error } = await supabase
      .from('user_notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id)
      .eq('is_read', false);

    if (error) throw error;

    // Get updated unread count
    const { count } = await supabase
      .from('user_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);

    return NextResponse.json({ 
      success: true,
      data: {
        unread_count: count || 0
      }
    });
  } catch (error: any) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while updating notifications' 
      },
      { status: 500 }
    );
  }
}
