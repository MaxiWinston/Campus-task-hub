import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

// Get all applications for a task
export async function GET(
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

    // Verify the user is the task owner or an admin
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

    // Get applications with applicant details
    const { data: applications, error } = await supabase
      .from('task_applications')
      .select(
        `
        *,
        applicant:profiles(*)
      `
      )
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: applications });
  } catch (error: any) {
    console.error('Error fetching task applications:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Apply for a task
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
      .select('status, requester_id')
      .eq('id', taskId)
      .single();

    if (taskError) throw taskError;

    // Check if task is open for applications
    if (task.status !== 'open') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'This task is no longer accepting applications' 
        },
        { status: 400 }
      );
    }

    // Prevent applying to own task
    if (task.requester_id === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot apply to your own task' },
        { status: 400 }
      );
    }

    // Check if user has already applied
    const { data: existingApplication, error: existingAppError } = await supabase
      .from('task_applications')
      .select('id')
      .eq('task_id', taskId)
      .eq('applicant_id', session.user.id)
      .maybeSingle();

    if (existingAppError) throw existingAppError;

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'You have already applied to this task' },
        { status: 400 }
      );
    }

    const { message, proposedPrice } = await request.json();

    // Create the application
    const { data: application, error } = await supabase
      .from('task_applications')
      .insert([
        {
          task_id: taskId,
          applicant_id: session.user.id,
          message: message || null,
          proposed_price: proposedPrice || null,
          status: 'pending',
        },
      ])
      .select('*, applicant:profiles(*)')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: application });
  } catch (error: any) {
    console.error('Error creating task application:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
