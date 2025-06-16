import { redis } from './redis';
import { ContentPreference } from '@/types/database.types';

export async function scheduleNextNotification(preference: ContentPreference) {
  const now = new Date();
  const [hours, minutes] = preference.notificationTime.split(':').map(Number);
  
  // Create next notification time
  const nextNotification = new Date(now);
  nextNotification.setHours(hours, minutes, 0, 0);
  
  // If the time has passed today, schedule for tomorrow
  if (nextNotification.getTime() <= now.getTime()) {
    nextNotification.setDate(nextNotification.getDate() + 1);
  }

  // For weekly notifications, adjust to next week if not the right day
  if (preference.frequency === 'weekly') {
    while (nextNotification.getDay() !== now.getDay()) {
      nextNotification.setDate(nextNotification.getDate() + 1);
    }
  }

  // Add to Redis sorted set with score as timestamp
  await redis.zadd('scheduled_notifications', {
    score: nextNotification.getTime(),
    member: preference.id
  });

  return nextNotification;
}
