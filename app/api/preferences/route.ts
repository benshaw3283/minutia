import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the user from the session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the preference data from the request
    const { notificationTime, content } = await req.json();
    
    if (!content || !notificationTime) {
      return NextResponse.json(
        { error: 'Missing required fields: content and notificationTime' },
        { status: 400 }
      );
    }

    // Insert or update the preference
    const { data, error } = await supabase
      .from('preferences')
      .upsert({
        user_id: session.user.id,
        notification_time: notificationTime,
        content,  // This will store the entire content object as JSON
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error saving preference:', error);
      return NextResponse.json(
        { error: 'Failed to save preference' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in POST /api/preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the user from the session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all preferences for the user
    const { data, error } = await supabase
      .from('preferences')
      .select('*')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error fetching preferences:', error);
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
