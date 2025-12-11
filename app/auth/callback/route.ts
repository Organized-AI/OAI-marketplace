import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Auth Callback Route
 *
 * Handles OAuth callbacks and email confirmations from Supabase Auth.
 * Exchanges the code for a session and redirects to the app.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/builder';

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(
        new URL(`/auth/error?message=${encodeURIComponent(error.message)}`, request.url)
      );
    }
  }

  // Redirect to the next page or builder by default
  return NextResponse.redirect(new URL(next, request.url));
}
