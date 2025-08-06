import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

// Mark a notification as read
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = params.id;
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the notification belongs to the user
    const { data: notification, error: fetchError } = await supabase
      .from('user_notifications')
      .select('id, is_read')
      .eq('id', notificationId)
      .eq('user_id', session.user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Notification not found' },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    // If already read, return early
    if (notification.is_read) {
      return NextResponse.json({ 
        success: true, 
        data: { is_read: true } 
      });
    }

    // Mark as read
    const { data: updatedNotification, error: updateError } = await supabase
      .from('user_notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Get updated unread count
    const { count } = await supabase
      .from('user_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);

    return NextResponse.json({ 
      success: true,
      data: {
        ...updatedNotification,
        unread_count: count || 0
      }
    });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while updating the notification' 
      },
      { status: 500 }
    );
  }
}

// Delete a notification
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = params.id;
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the notification belongs to the user
    const { data: notification, error: fetchError } = await supabase
      .from('user_notifications')
      .select('id')
      .eq('id', notificationId)
      .eq('user_id', session.user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Notification not found' },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    // Delete the notification
    const { error: deleteError } = await supabase
      .from('user_notifications')
      .delete()
      .eq('id', notificationId);

    if (deleteError) throw deleteError;

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
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while deleting the notification' 
      },
      { status: 500 }
    );
  }
}
