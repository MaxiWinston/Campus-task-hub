import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

// Get a single category by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = params.id;
    const { searchParams } = new URL(request.url);
    const includeTasks = searchParams.get('includeTasks') === 'true';
    const taskStatus = searchParams.get('taskStatus') || 'open';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Get category details
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (categoryError) {
      if (categoryError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Category not found' },
          { status: 404 }
        );
      }
      throw categoryError;
    }

    let tasks = [];
    let taskCount = 0;

    // Get tasks for this category if requested
    if (includeTasks) {
      let query = supabase
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
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply status filter
      if (taskStatus !== 'all') {
        query = query.eq('status', taskStatus);
      }

      const { data: taskData, error: taskError, count } = await query;
      
      if (taskError) throw taskError;
      
      tasks = taskData || [];
      taskCount = count || 0;

      // Enhance tasks with application counts
      tasks = tasks.map(task => ({
        ...task,
        application_count: task.applications?.length || 0
      }));
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        ...category,
        ...(includeTasks && {
          tasks,
          pagination: {
            total: taskCount,
            limit,
            offset,
            hasMore: (offset + limit) < taskCount
          }
        })
      }
    });
  } catch (error: any) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while fetching the category' 
      },
      { status: 500 }
    );
  }
}

// Update a category (admin only)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = params.id;
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify user is admin
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (userError) throw userError;
    if (!userData?.is_admin) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Get updates from request body
    const updates = await request.json();
    
    // Only allow specific fields to be updated
    const allowedUpdates = ['name', 'description', 'icon', 'color', 'is_active'];
    const safeUpdates: Record<string, any> = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        safeUpdates[key] = updates[key];
      }
    });

    // If name is being updated, check for duplicates
    if (safeUpdates.name) {
      const { data: existingCategory, error: existingError } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', safeUpdates.name.trim())
        .neq('id', categoryId)
        .maybeSingle();

      if (existingError) throw existingError;
      if (existingCategory) {
        return NextResponse.json(
          { success: false, error: 'A category with this name already exists' },
          { status: 400 }
        );
      }

      safeUpdates.name = safeUpdates.name.trim();
    }

    // Update the category
    const { data: category, error: updateError } = await supabase
      .from('categories')
      .update({
        ...safeUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', categoryId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ 
      success: true, 
      data: category 
    });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while updating the category' 
      },
      { status: 500 }
    );
  }
}

// Delete a category (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = params.id;
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify user is admin
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (userError) throw userError;
    if (!userData?.is_admin) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Check if category exists
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', categoryId)
      .single();

    if (categoryError) {
      if (categoryError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Category not found' },
          { status: 404 }
        );
      }
      throw categoryError;
    }

    // Check if category has associated tasks
    const { count: taskCount, error: taskError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (taskError) throw taskError;
    if (taskCount && taskCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete a category with associated tasks' 
        },
        { status: 400 }
      );
    }

    // Delete the category
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ 
      success: true,
      message: `Category "${category.name}" has been deleted` 
    });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while deleting the category' 
      },
      { status: 500 }
    );
  }
}
