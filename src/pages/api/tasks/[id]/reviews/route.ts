import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

// Get all reviews for a task
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check if task exists
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id')
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

    // Get all reviews for this task with reviewer details
    const { data: reviews, error } = await supabase
      .from('task_reviews')
      .select(
        `
        *,
        reviewer:profiles!task_reviews_reviewer_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data: reviews 
    });
  } catch (error: any) {
    console.error('Error fetching task reviews:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while fetching reviews' 
      },
      { status: 500 }
    );
  }
}

// Submit a new review for a task
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

    // Check if task is completed
    if (task.status !== 'completed') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot review a task that is not completed' 
        },
        { status: 400 }
      );
    }

    // Check if user is the requester or assignee
    const isRequester = task.requester_id === session.user.id;
    const isAssignee = task.assignee_id === session.user.id;
    
    if (!isRequester && !isAssignee) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Only the task requester or assignee can leave a review' 
        },
        { status: 403 }
      );
    }

    // Determine if this is a review of the requester or assignee
    const isReviewingRequester = isAssignee; // Assignee is reviewing the requester
    const revieweeId = isReviewingRequester ? task.requester_id : task.assignee_id;

    // Check if user has already reviewed this task
    const { data: existingReview, error: existingReviewError } = await supabase
      .from('task_reviews')
      .select('id')
      .eq('task_id', taskId)
      .eq('reviewer_id', session.user.id)
      .maybeSingle();

    if (existingReviewError) throw existingReviewError;
    
    if (existingReview) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'You have already reviewed this task' 
        },
        { status: 400 }
      );
    }

    const { rating, comment } = await request.json();

    // Validate input
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rating must be a number between 1 and 5' 
        },
        { status: 400 }
      );
    }

    if (comment && comment.length > 1000) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Comment must be less than 1000 characters' 
        },
        { status: 400 }
      );
    }

    // Create the review
    const { data: review, error: reviewError } = await supabase
      .from('task_reviews')
      .insert([
        {
          task_id: taskId,
          reviewer_id: session.user.id,
          reviewee_id: revieweeId,
          rating,
          comment: comment?.trim() || null,
          is_reviewing_requester: isReviewingRequester
        },
      ])
      .select(
        `
        *,
        reviewer:profiles!task_reviews_reviewer_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .single();

    if (reviewError) throw reviewError;

    // Update the reviewee's rating
    await supabase.rpc('update_user_rating', {
      user_id: revieweeId
    });

    // Create a notification for the reviewee
    await supabase.from('user_notifications').insert([
      {
        user_id: revieweeId,
        type: 'new_review',
        title: 'New Review Received',
        message: `You've received a ${rating}-star review for task #${taskId}`,
        data: {
          task_id: taskId,
          review_id: review.id,
          reviewer_id: session.user.id,
          rating
        },
        is_read: false
      },
    ]);

    return NextResponse.json({ 
      success: true, 
      data: review 
    });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while submitting the review' 
      },
      { status: 500 }
    );
  }
}
