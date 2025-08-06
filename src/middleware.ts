import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
);

export const authMiddleware = async (request: Request) => {
  try {
    const url = new URL(request.url);
    
    // Skip middleware for auth routes and static files
    if (url.pathname.startsWith('/auth/') || 
        url.pathname.startsWith('/_next/') ||
        url.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)) {
      return null; // No authentication required
    }

    // Get the session from the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'No token provided' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If we get here, the user is authenticated
    // You can attach the user to the request if needed
    const modifiedRequest = new Request(request);
    Object.defineProperty(modifiedRequest, 'user', {
      value: user,
      writable: false,
    });

    return { request: modifiedRequest };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
