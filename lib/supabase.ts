/**
 * Supabase Client Configuration
 *
 * Provides two clients:
 * - supabase: Public client for client-side operations (uses anon key)
 * - supabaseAdmin: Admin client for server-side operations (uses service role key)
 */

import { createClient } from '@supabase/supabase-js';

// Public client for client-side usage
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Admin client for server-side operations (rate limiting, etc.)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
