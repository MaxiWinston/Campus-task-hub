import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { email, password, userData } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate user data
    if (!userData || !userData.username || !userData.fullName || !userData.university || !userData.studentId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Username, full name, university, and student ID are required' 
        },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const { data: existingUser, error: usernameError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', userData.username)
      .maybeSingle();

    if (usernameError) throw usernameError;
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Username is already taken' },
        { status: 400 }
      );
    }

    // Check if student ID is already registered
    const { data: existingStudent, error: studentError } = await supabase
      .from('profiles')
      .select('id')
      .eq('student_id', userData.studentId)
      .maybeSingle();

    if (studentError) throw studentError;
    if (existingStudent) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'This student ID is already registered' 
        },
        { status: 400 }
      );
    }

    // Create the user with Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: userData.username,
          full_name: userData.fullName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (signUpError) {
      // Handle specific error cases
      if (signUpError.message.includes('already registered')) {
        return NextResponse.json(
          { success: false, error: 'This email is already registered' },
          { status: 400 }
        );
      }
      throw signUpError;
    }

    // Create user profile in the database
    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email,
        username: userData.username,
        full_name: userData.fullName,
        university: userData.university,
        student_id: userData.studentId,
        phone_number: userData.phoneNumber || null,
        rating: 0,
        completed_tasks: 0,
        created_tasks: 0,
        is_verified: false,
        is_admin: false,
      });

      if (profileError) {
        // If profile creation fails, delete the auth user to maintain consistency
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        user: authData.user,
        session: authData.session 
      } 
    });
  } catch (error: any) {
    console.error('Error during signup:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred during signup' 
      },
      { status: 500 }
    );
  }
}
