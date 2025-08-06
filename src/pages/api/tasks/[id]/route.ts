import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Get task with relations
    const { data: task, error } = await supabase
      .from('tasks')
      .select(
        `
        *,
        category:categories(*),
        requester:profiles!tasks_requester_id_fkey(*),
        assignee:profiles!tasks_assignee_id_fkey(*),
        applications(*, applicant:profiles(*)),
        messages(*, sender:profiles(*)),
        reviews:task_reviews(*, reviewer:profiles(*))
      `
      )
      .eq('id', taskId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Task not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error: any) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Verify the user is the task owner or admin
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('requester_id')
      .eq('id', taskId)
      .single();

    if (taskError) throw taskError;

    const { data: userData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    const isAdmin = userData?.is_admin || false;
    const isOwner = task.requester_id === session.user.id;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    const updates = await request.json();

    // Remove fields that shouldn't be updated
    const { id, requester_id, created_at, ...safeUpdates } = updates;

    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update(safeUpdates)
      .eq('id', taskId)
      .select('*')
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, data: updatedTask });
  } catch (error: any) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Verify the user is the task owner or admin
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('requester_id, status')
      .eq('id', taskId)
      .single();

    if (taskError) throw taskError;

    const { data: userData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    const isAdmin = userData?.is_admin || false;
    const isOwner = task.requester_id === session.user.id;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Only allow deletion if task is not in progress or completed
    if (['in_progress', 'completed'].includes(task.status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete a task that is in progress or completed' 
        },
        { status: 400 }
      );
    }

    // Delete related records first
    await supabase.from('task_applications').delete().eq('task_id', taskId);
    await supabase.from('task_messages').delete().eq('task_id', taskId);
    
    // Then delete the task
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
