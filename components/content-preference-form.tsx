'use client';

import { useState } from 'react';
import { NotificationFrequency } from '@/types/database.types';
import { useAuth } from '@/hooks/use-auth';

export default function ContentPreferenceForm() {
  const { user, loading, isAuthenticated } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [frequency, setFrequency] = useState<NotificationFrequency>('daily');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!isAuthenticated || !user?.id) {
      setError('You must be logged in to save preferences');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Auth context check:', {
        hasUser: !!user,
        userId: user?.id,
        email: user?.email
      });

      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({
          prompt,
          notificationTime,
          frequency,
          parameters: {}
        }),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('API Response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save preference');
      }

      console.log('Preference saved:', data);
      
      // Clear form on success
      setPrompt('');
      setNotificationTime('09:00');
      setFrequency('daily');

    } catch (error) {
      console.error('Form submission error:', error);
      setError(error instanceof Error ? error.message : 'Failed to save preference');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
          What would you like to know?
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
          className="mt-1 text-black block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="e.g., Show me the surf forecast for Bondi Beach"
          rows={3}
        />
      </div>

      <div>
        <label htmlFor="notificationTime" className="block text-sm font-medium text-gray-700 mb-2">
          Notification Time
        </label>
        <input
          type="time"
          id="notificationTime"
          value={notificationTime}
          onChange={(e) => setNotificationTime(e.target.value)}
          required
          className="mt-1 text-black block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
          Frequency
        </label>
        <select
          id="frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as NotificationFrequency)}
          className="mt-1 text-black block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || loading || !isAuthenticated}
        className="inline-flex justify-center rounded-md cursor-pointer border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? 'Loading...' : isSubmitting ? 'Saving...' : 'Save Preference'}
      </button>
    </form>
  );
}
