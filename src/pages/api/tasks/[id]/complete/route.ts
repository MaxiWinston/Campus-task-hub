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

    // Check if task is in a completable state
    if (task.status !== 'in_progress') {
      return NextResponse.json(
        { 
          success: false, 
          error: `Task cannot be completed from its current state: ${task.status}` 
        },
        { status: 400 }
      );
    }

    // Verify the user is the task requester or assignee
    const isRequester = task.requester_id === session.user.id;
    const isAssignee = task.assignee_id === session.user.id;
    
    const { data: userData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    const isAdmin = userData?.is_admin || false;

    if (!isRequester && !isAssignee && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to complete this task' },
        { status: 403 }
      );
    }

    // Get the other user's ID for notification
    const otherUserId = isRequester ? task.assignee_id : task.requester_id;

    // Start a transaction to update task and related data
    const { data: updatedTask, error: updateError } = await supabase.rpc('complete_task', {
      p_task_id: taskId,
      p_completed_by: session.user.id,
      p_completed_at: new Date().toISOString()
    });

    if (updateError) throw updateError;

    // Create a notification for the other user
    if (otherUserId) {
      await supabase.from('user_notifications').insert([
        {
          user_id: otherUserId,
          type: 'task_completed',
          title: 'Task Completed',
          message: `Task "${task.title}" has been marked as completed`,
          data: {
            task_id: taskId,
            completed_by: session.user.id
          },
          is_read: false
        },
      ]);
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedTask 
    });
  } catch (error: any) {
    console.error('Error completing task:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while completing the task' 
      },
      { status: 500 }
    );
  }
}
