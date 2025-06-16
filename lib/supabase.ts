import { createBrowserClient } from '@supabase/ssr';
import { Database } from './database.types';

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          const cookies: { name: string; value: string }[] = [];
          document.cookie.split(';').forEach(cookie => {
            const [name, value] = cookie.split('=').map(c => c.trim());
            if (name && value) {
              cookies.push({
                name,
                value: decodeURIComponent(value)
              });
            }
          });
          return cookies;
        },
        setAll: (cookieStrings) => {
          cookieStrings.forEach(({ name, value, ...options }) => {
            document.cookie = `${name}=${encodeURIComponent(value)}; path=/; ${Object.entries(options)
              .map(([key, val]) => `${key}=${val}`)
              .join('; ')}`;
          });
        },
      },
    }
  );
};

export const supabase = createClient();
