'use client';

/**
 * Session ID Hook
 *
 * Generates and persists a unique session ID for rate limiting.
 * The session ID is stored in localStorage and reused across page reloads.
 */

import { useState, useEffect } from 'react';

const SESSION_KEY = 'organized-session-id';

export function useSessionId(): string {
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    // Check for existing session ID
    let id = localStorage.getItem(SESSION_KEY);

    if (!id) {
      // Generate a new unique session ID
      id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem(SESSION_KEY, id);
    }

    setSessionId(id);
  }, []);

  return sessionId;
}

/**
 * Helper to clear session (useful for testing rate limits)
 */
export function clearSessionId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}
