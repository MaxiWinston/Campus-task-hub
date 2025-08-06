import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

// Get application details
export async function GET(
  request: Request,
  { params }: { params: { id: string; applicationId: string } }
) {
  try {
    const { id: taskId, applicationId } = params;
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get application with details
    const { data: application, error } = await supabase
      .from('task_applications')
      .select(
        `
        *,
        applicant:profiles(*),
        task:task_id(*)
      `
      )
      .eq('id', applicationId)
      .eq('task_id', taskId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Application not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Verify the user is the task owner, applicant, or an admin
    const isTaskOwner = application.task.requester_id === session.user.id;
    const isApplicant = application.applicant_id === session.user.id;
    
    const { data: userData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    const isAdmin = userData?.is_admin || false;

    if (!isTaskOwner && !isApplicant && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: application });
  } catch (error: any) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Update application status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; applicationId: string } }
) {
  try {
    const { id: taskId, applicationId } = params;
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get application and task details
    const { data: application, error: appError } = await supabase
      .from('task_applications')
      .select('*, task:task_id(*)')
      .eq('id', applicationId)
      .eq('task_id', taskId)
      .single();

    if (appError) throw appError;

    // Verify the user is the task owner or an admin
    const isTaskOwner = application.task.requester_id === session.user.id;
    
    const { data: userData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    const isAdmin = userData?.is_admin || false;

    if (!isTaskOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    const { status, admin_notes } = await request.json();

    // Validate status
    if (!['accepted', 'rejected', 'withdrawn'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Start a transaction
    const { data: updatedApp, error: updateError } = await supabase.rpc('handle_application_status_update', {
      p_application_id: applicationId,
      p_new_status: status,
      p_admin_notes: admin_notes || null,
      p_updated_by: session.user.id
    });

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, data: updatedApp });
  } catch (error: any) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Delete an application
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; applicationId: string } }
) {
  try {
    const { id: taskId, applicationId } = params;
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get application details
    const { data: application, error: appError } = await supabase
      .from('task_applications')
      .select('applicant_id, status')
      .eq('id', applicationId)
      .eq('task_id', taskId)
      .single();

    if (appError) {
      if (appError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Application not found' },
          { status: 404 }
        );
      }
      throw appError;
    }

    // Verify the user is the applicant, task owner, or an admin
    const isApplicant = application.applicant_id === session.user.id;
    
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('requester_id')
      .eq('id', taskId)
      .single();

    if (taskError) throw taskError;
    
    const isTaskOwner = task.requester_id === session.user.id;
    
    const { data: userData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    const isAdmin = userData?.is_admin || false;

    if (!isApplicant && !isTaskOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Only allow deletion if status is pending or withdrawn
    if (!['pending', 'withdrawn'].includes(application.status) && !isAdmin) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete an application that has been accepted or rejected' 
        },
        { status: 400 }
      );
    }

    // Delete the application
    const { error: deleteError } = await supabase
      .from('task_applications')
      .delete()
      .eq('id', applicationId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
