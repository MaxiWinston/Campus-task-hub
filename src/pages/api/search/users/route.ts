import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const university = searchParams.get('university');
    const minRating = searchParams.get('minRating');
    const hasSkills = searchParams.get('skills')?.split(',').filter(Boolean) || [];
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Build the base query
    let queryBuilder = supabase
      .from('profiles')
      .select(
        `
        id,
        username,
        full_name,
        avatar_url,
        bio,
        university,
        rating,
        completed_tasks,
        created_tasks,
        created_at,
        skills:user_skills(
          skill:skills(*)
        )
      `,
        { count: 'exact' }
      )
      .order('rating', { ascending: false, nullsLast: true })
      .range(offset, offset + limit - 1);

    // Apply search query if provided
    if (query) {
      queryBuilder = queryBuilder.or(
        `username.ilike.%${query}%,full_name.ilike.%${query}%,university.ilike.%${query}%`
      );
    }

    // Apply filters
    if (university) {
      queryBuilder = queryBuilder.ilike('university', `%${university}%`);
    }

    if (minRating) {
      queryBuilder = queryBuilder.gte('rating', parseFloat(minRating));
    }

    // Execute the initial query
    const { data: users, error, count } = await queryBuilder;

    if (error) throw error;

    // Filter by skills if specified
    let filteredUsers = users;
    if (hasSkills.length > 0) {
      filteredUsers = users.filter(user => {
        const userSkillIds = user.skills?.map(skill => skill.skill.id) || [];
        return hasSkills.every(skillId => userSkillIds.includes(skillId));
      });
    }

    // Get user stats for each user
    const enhancedUsers = await Promise.all(
      filteredUsers.map(async (user) => {
        const { data: stats } = await supabase
          .rpc('get_user_stats', { user_id: user.id });

        return {
          ...user,
          stats: stats || {}
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      data: {
        users: enhancedUsers,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0)
      }
    });
  } catch (error: any) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while searching users' 
      },
      { status: 500 }
    );
  }
}
