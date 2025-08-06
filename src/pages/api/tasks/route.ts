import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Get query parameters
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const isUrgent = searchParams.get('isUrgent') === 'true' ? true : undefined;
    const isRemote = searchParams.get('isRemote') === 'true' ? true : undefined;
    const status = searchParams.get('status') || undefined;
    const requesterId = searchParams.get('requesterId') || undefined;
    const assigneeId = searchParams.get('assigneeId') || undefined;
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const pageSize = searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : 20;

    // Get current user ID if available
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

    // Build the query
    let query = supabase
      .from('tasks')
      .select(
        `
        *,
        category:categories(*),
        requester:profiles!tasks_requester_id_fkey(*),
        assignee:profiles!tasks_assignee_id_fkey(*),
        applications(*, applicant:profiles(*)),
        messages(*, sender:profiles(*))
      `,
        { count: 'exact' }
      )
      .order(sortBy as any, { ascending: sortOrder === 'asc' });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (minPrice !== undefined) {
      query = query.gte('price', minPrice);
    }

    if (maxPrice !== undefined) {
      query = query.lte('price', maxPrice);
    }

    if (isUrgent !== undefined) {
      query = query.eq('is_urgent', isUrgent);
    }

    if (isRemote !== undefined) {
      query = query.eq('is_remote', isRemote);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (requesterId) {
      query = query.eq('requester_id', requesterId);
    }

    if (assigneeId) {
      query = query.eq('assignee_id', assigneeId);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: tasks, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: tasks,
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const taskData = await request.json();

    // Validate required fields
    if (!taskData.title || !taskData.description || taskData.price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the task
    const { data: task, error } = await supabase
      .from('tasks')
      .insert([
        {
          title: taskData.title,
          description: taskData.description,
          price: taskData.price,
          category_id: taskData.categoryId || null,
          location: taskData.location || null,
          deadline: taskData.deadline || null,
          requester_id: session.user.id,
          is_urgent: taskData.isUrgent || false,
          is_remote: taskData.isRemote || false,
          estimated_hours: taskData.estimatedHours || null,
        },
      ])
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
