import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ContentPreferenceFormData, ContentPreference } from '@/types/database.types';
import { analyzePrompt } from '@/lib/gpt';
import { scheduleNextNotification } from '@/lib/scheduler';

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const authHeader = req.headers.get('authorization');
    const userId = authHeader?.split(' ')[1]; // Extract user ID from Bearer token
    
    // Get the user from the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    const cookieStore = await cookies();
    console.log('API Route Auth:', {
      hasSession: !!session,
      sessionError,
      sessionUserId: session?.user?.id,
      headerUserId: userId,
      email: session?.user?.email,
      authHeader,
      headers: Object.fromEntries(req.headers),
      cookies: [...cookieStore.getAll()]
    });

    if (!session?.user?.id) {
      console.error('No session found');
      return NextResponse.json({ 
        error: 'No active session found', 
        debug: { sessionError } 
      }, { status: 401 });
    }

    if (!userId) {
      console.error('No user ID in Authorization header');
      return NextResponse.json({ 
        error: 'Missing Authorization header', 
        debug: { authHeader } 
      }, { status: 401 });
    }

    if (session.user.id !== userId) {
      console.error('User ID mismatch');
      return NextResponse.json({ 
        error: 'Invalid Authorization', 
        debug: { sessionUserId: session.user.id, headerUserId: userId } 
      }, { status: 401 });
    }

    // Get the preference data from the request
    const data = await req.json() as ContentPreferenceFormData;
    
    if ( !data.prompt || !data.notificationTime) {
      return NextResponse.json(
        { error: 'Missing required fields:  prompt, and notificationTime' },
        { status: 400 }
      );
    }

    // Use GPT to analyze the prompt
    const metadata = await analyzePrompt(data.prompt);

    // Insert or update the preference
    const { data: savedPreference, error } = await supabase
      .from('content_preferences')
      .upsert({
        userId: session.user.id,
        title: metadata.title,
        category: metadata.category,
        prompt: data.prompt,
        notification_time: data.notificationTime,
        frequency: data.frequency,
        parameters: data.parameters || {},
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error || !savedPreference) {
      console.error('Error saving preference:', error);
      return NextResponse.json(
        { error: 'Failed to save preference' },
        { status: 500 }
      );
    }

    try {
      // Schedule the first notification
      const nextNotification = await scheduleNextNotification(savedPreference as ContentPreference);

      return NextResponse.json({
        success: true,
        preference: savedPreference,
        nextNotification: nextNotification.toISOString()
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return NextResponse.json({
        success: false,
        preference: savedPreference,
        error: 'Preference saved but scheduling failed'
      }, { status: 500 });
    }
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
