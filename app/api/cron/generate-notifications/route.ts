import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/gpt';
import { redis } from '@/lib/redis';
import { scheduleNextNotification } from '@/lib/scheduler';

export async function GET(req: Request) {
  try {
    // Verify this is a legitimate cron request from Vercel
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const now = new Date();

    // Get all notifications scheduled for now from Redis
    const scheduledNotifications = await redis.zrange(
      'scheduled_notifications',
      0,
      Date.now(),
      { byScore: true }
    ) as string[];

    if (!scheduledNotifications.length) {
      return NextResponse.json({ success: true, processedCount: 0 });
    }

    // Get preferences for these notifications
    const { data: preferences, error: fetchError } = await supabase
      .from('content_preferences')
      .select('*')
      .in('id', scheduledNotifications)
      .eq('active', true);

    if (fetchError) {
      console.error('Error fetching preferences:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Generate content for each preference
    for (const pref of preferences || []) {
      try {
        // Generate fresh content using GPT
        const content = await generateContent(pref.prompt, pref.category);

        // TODO: Send notification via OneSignal
        console.log('Would send notification:', {
          userId: pref.user_id,
          title: pref.title,
          content
        });

        // Update last notification time and schedule next notification
        const [updateError] = await Promise.all([
          supabase
            .from('content_preferences')
            .update({ last_notification_at: now.toISOString() })
            .eq('id', pref.id),
          scheduleNextNotification(pref)
        ]);
        
        if (updateError) {
          console.error(`Error updating preference ${pref.id}:`, updateError);
        }

      } catch (error) {
        console.error(`Error processing preference ${pref.id}:`, error);
        // Continue with other preferences even if one fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      processedCount: preferences?.length || 0 
    });

  } catch (error) {
    console.error('Error in notification cron:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
