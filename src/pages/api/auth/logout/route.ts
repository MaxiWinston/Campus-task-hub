import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Sign out the user
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;

    // Clear any session cookies
    cookies().delete('sb-auth-token');
    cookies().delete('sb-refresh-token');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred during logout' 
      },
      { status: 500 }
    );
  }
}
