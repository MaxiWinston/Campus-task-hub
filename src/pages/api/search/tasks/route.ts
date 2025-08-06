import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const categoryId = searchParams.get('categoryId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Build the query
    let queryBuilder = supabase
      .from('tasks')
      .select(
        `
        *,
        category:categories(*),
        requester:profiles!tasks_requester_id_fkey(
          id,
          username,
          full_name,
          avatar_url,
          rating
        ),
        applications:task_applications(
          id,
          status,
          created_at
        )
      `,
        { count: 'exact' }
      )
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    // Apply search query if provided
    if (query) {
      queryBuilder = queryBuilder.textSearch('search_vector', query, {
        type: 'websearch',
        config: 'english'
      });
    }

    // Apply filters
    if (categoryId) {
      queryBuilder = queryBuilder.eq('category_id', categoryId);
    }

    if (minPrice) {
      queryBuilder = queryBuilder.gte('price', parseFloat(minPrice));
    }

    if (maxPrice) {
      queryBuilder = queryBuilder.lte('price', parseFloat(maxPrice));
    }

    if (status) {
      queryBuilder = queryBuilder.eq('status', status);
    } else {
      // Default to only showing open tasks if no status filter is provided
      queryBuilder = queryBuilder.eq('status', 'open');
    }

    const { data: tasks, error, count } = await queryBuilder;

    if (error) throw error;

    // Enhance tasks with additional data
    const enhancedTasks = await Promise.all(
      tasks.map(async (task) => {
        // Count applications
        const applicationCount = task.applications?.length || 0;
        
        // Remove applications array from the response
        const { applications, ...taskData } = task;

        return {
          ...taskData,
          application_count: applicationCount
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      data: {
        tasks: enhancedTasks,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0)
      }
    });
  } catch (error: any) {
    console.error('Error searching tasks:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while searching tasks' 
      },
      { status: 500 }
    );
  }
}
