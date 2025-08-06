import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Get all categories with task counts using the database function
    const { data: categories, error } = await supabase
      .rpc('get_categories_with_task_count');

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data: categories || [] 
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while fetching categories' 
      },
      { status: 500 }
    );
  }
}

// Create a new category (admin only)
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

    const { name, description, icon, color } = await request.json();

    // Validate input
    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category already exists
    const { data: existingCategory, error: existingError } = await supabase
      .from('categories')
      .select('id')
      .ilike('name', name.trim())
      .maybeSingle();

    if (existingError) throw existingError;
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'A category with this name already exists' },
        { status: 400 }
      );
    }

    // Create the category
    const { data: category, error: insertError } = await supabase
      .from('categories')
      .insert([
        { 
          name: name.trim(),
          description: description?.trim(),
          icon: icon?.trim(),
          color: color?.trim(),
          created_by: session.user.id
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ 
      success: true, 
      data: { ...category, task_count: 0 } // Initialize with 0 tasks
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while creating the category' 
      },
      { status: 500 }
    );
  }
}
