import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { password } = await request.json();

    // Validate input
    if (!password) {
      return NextResponse.json(
        { success: false, error: 'New password is required' },
        { status: 400 }
      );
    }

    // Check password strength (example: at least 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Update the user's password
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      // Handle specific error cases
      if (error.message.includes('Auth session missing')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid or expired password reset link. Please request a new one.' 
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Sign out all other sessions for security
    await supabase.auth.signOut({ scope: 'others' });

    return NextResponse.json({ 
      success: true, 
      message: 'Password updated successfully. You can now log in with your new password.' 
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while resetting your password' 
      },
      { status: 500 }
    );
  }
}
