import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

// Get public user profile by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const userId = params.id;

    // Get the public profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(
        `
        id,
        username,
        full_name,
        bio,
        avatar_url,
        university,
        location,
        website,
        social_links,
        rating,
        completed_tasks,
        created_tasks,
        created_at,
        skills:user_skills(
          skill:skills(*)
        )
      `
      )
      .eq('id', userId)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      throw profileError;
    }

    // Get user stats
    const { data: stats } = await supabase
      .rpc('get_user_stats', { user_id: userId });

    // Get user's recent reviews (as tasker)
    const { data: taskerReviews } = await supabase
      .from('task_reviews')
      .select(
        `
        id,
        rating,
        comment,
        created_at,
        task:task_id(
          id,
          title
        ),
        reviewer:profiles!task_reviews_reviewer_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get user's recent reviews (as requester)
    const { data: requesterReviews } = await supabase
      .from('task_reviews')
      .select(
        `
        id,
        rating,
        comment,
        created_at,
        task:task_id(
          id,
          title
        ),
        reviewee:profiles!task_reviews_reviewee_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .eq('reviewer_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get recent completed tasks (as tasker)
    const { data: completedTasks } = await supabase
      .from('tasks')
      .select(
        `
        id,
        title,
        price,
        created_at,
        category:categories(
          id,
          name,
          icon
        )
      `
      )
      .eq('assignee_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(5);

    // Get recent created tasks (as requester)
    const { data: createdTasks } = await supabase
      .from('tasks')
      .select(
        `
        id,
        title,
        price,
        status,
        created_at,
        category:categories(
          id,
          name,
          icon
        )
      `
      )
      .eq('requester_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Combine all data
    const userData = {
      ...profile,
      stats: stats || {},
      reviews: {
        as_tasker: taskerReviews || [],
        as_requester: requesterReviews || []
      },
      tasks: {
        completed: completedTasks || [],
        created: createdTasks || []
      }
    };

    return NextResponse.json({ success: true, data: userData });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while fetching the user profile' 
      },
      { status: 500 }
    );
  }
}
