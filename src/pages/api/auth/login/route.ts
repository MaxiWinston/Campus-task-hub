import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }
      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Please verify your email before logging in. Check your inbox for the verification link.' 
          },
          { status: 401 }
        );
      }
      throw error;
    }

    // Update last active timestamp
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ last_active: new Date().toISOString() })
        .eq('id', data.user.id);
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        user: data.user,
        session: data.session 
      } 
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred during login' 
      },
      { status: 500 }
    );
  }
}
