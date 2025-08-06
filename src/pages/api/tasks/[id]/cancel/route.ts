import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get task details
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskError) {
      if (taskError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Task not found' },
          { status: 404 }
        );
      }
      throw taskError;
    }

    // Check if task can be cancelled
    if (['cancelled', 'completed'].includes(task.status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Task cannot be cancelled from its current state: ${task.status}` 
        },
        { status: 400 }
      );
    }

    // Verify the user is the task requester or an admin
    const isRequester = task.requester_id === session.user.id;
    
    const { data: userData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    const isAdmin = userData?.is_admin || false;

    if (!isRequester && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to cancel this task' },
        { status: 403 }
      );
    }

    // Get the assignee's ID for notification
    const assigneeId = task.assignee_id;

    // Start a transaction to update task and related data
    const { data: updatedTask, error: updateError } = await supabase.rpc('cancel_task', {
      p_task_id: taskId,
      p_cancelled_by: session.user.id,
      p_cancelled_at: new Date().toISOString(),
      p_refund_required: true // Set based on your business logic
    });

    if (updateError) throw updateError;

    // Create notifications
    const notifications = [
      // Notify the requester (if they weren't the one who cancelled)
      !isRequester && {
        user_id: task.requester_id,
        type: 'task_cancelled',
        title: 'Task Cancelled',
        message: `Task "${task.title}" has been cancelled`,
        data: {
          task_id: taskId,
          cancelled_by: session.user.id,
          is_refund_processed: updatedTask.is_refund_processed
        },
        is_read: false
      },
      // Notify the assignee (if any)
      assigneeId && assigneeId !== session.user.id && {
        user_id: assigneeId,
        type: 'task_cancelled',
        title: 'Task Cancelled',
        message: `Task "${task.title}" has been cancelled`,
        data: {
          task_id: taskId,
          cancelled_by: session.user.id,
          is_refund_processed: updatedTask.is_refund_processed
        },
        is_read: false
      }
    ].filter(Boolean);

    if (notifications.length > 0) {
      await supabase.from('user_notifications').insert(notifications);
    }

    // TODO: Handle refund logic here if needed
    // This would integrate with your payment provider
    if (updatedTask.is_refund_required && !updatedTask.is_refund_processed) {
      console.log(`Refund required for task ${taskId}`);
      // Implement refund logic
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedTask 
    });
  } catch (error: any) {
    console.error('Error cancelling task:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while cancelling the task' 
      },
      { status: 500 }
    );
  }
}
