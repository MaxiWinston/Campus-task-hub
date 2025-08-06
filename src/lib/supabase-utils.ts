import { supabase } from '@/integrations/supabase/client';
import { Tables, InsertTables } from '@/integrations/supabase/types';

export async function signUp(email: string, password: string, userData: Partial<Tables<'profiles'>>) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: userData.username,
        full_name: userData.full_name,
      },
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Sign up failed');

  // Create profile in the profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([{
      id: authData.user.id,
      username: userData.username,
      full_name: userData.full_name,
      // Add other profile fields here
    }]);

  if (profileError) throw profileError;
  return authData.user;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

// Example function to fetch tasks
export async function getTasks(filters = {}) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, profiles(*)')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

// Example function to create a task
export async function createTask(taskData: InsertTables<'tasks'>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([taskData])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Add more utility functions as needed
