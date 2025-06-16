import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(req: Request) {
  try {
    const { email, userId } = await req.json();

    if (!email || !userId) {
      return NextResponse.json({ error: 'Email and userId are required' }, { status: 400 });
    }

    // Try to get existing user
    const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (getUserError && getUserError.status !== 404) {
      return NextResponse.json({ error: getUserError.message }, { status: 500 });
    }

    let user;

    if (!existingUser) {
      // Create new user if they don't exist
      const { data: { user: newUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { source: 'nextauth' },
        id: userId
      });

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      user = newUser;
    } else {
      // Update existing user
      const { data: { user: updatedUser }, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          email,
          email_confirm: true,
          user_metadata: { source: 'nextauth' }
        }
      );

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      user = updatedUser;
    }

    return NextResponse.json({ 
      success: true,
      user
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
