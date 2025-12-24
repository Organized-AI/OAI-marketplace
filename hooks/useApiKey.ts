'use client';

/**
 * useApiKey Hook
 *
 * Manages API key storage for both authenticated and guest users.
 * - Authenticated users: Stores encrypted key in user_profiles table
 * - Guest users: Falls back to localStorage
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface UseApiKeyResult {
  apiKey: string | null;
  isLoading: boolean;
  setApiKey: (key: string) => Promise<{ error: string | null }>;
  clearApiKey: () => Promise<{ error: string | null }>;
  hasApiKey: boolean;
}

const LOCAL_STORAGE_KEY = 'oai_api_key';

export function useApiKey(): UseApiKeyResult {
  const { user, isLoading: authLoading } = useAuth();
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load API key on mount or when user changes
  useEffect(() => {
    const loadApiKey = async () => {
      setIsLoading(true);

      try {
        if (user) {
          // Authenticated user: Load from Supabase
          const { data, error } = await supabase
            .from('user_profiles')
            .select('encrypted_api_key')
            .eq('id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error loading API key:', error);
          }

          if (data?.encrypted_api_key) {
            setApiKeyState(data.encrypted_api_key);
          } else {
            // Check if there's a localStorage key to migrate
            const localKey = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (localKey) {
              // Migrate to Supabase
              await supabase
                .from('user_profiles')
                .update({
                  encrypted_api_key: localKey,
                  api_key_added_at: new Date().toISOString(),
                })
                .eq('id', user.id);
              setApiKeyState(localKey);
              localStorage.removeItem(LOCAL_STORAGE_KEY);
            } else {
              setApiKeyState(null);
            }
          }
        } else {
          // Guest user: Load from localStorage
          const localKey = localStorage.getItem(LOCAL_STORAGE_KEY);
          setApiKeyState(localKey);
        }
      } catch (err) {
        console.error('Error loading API key:', err);
        setApiKeyState(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadApiKey();
    }
  }, [user, authLoading]);

  const setApiKey = useCallback(async (key: string): Promise<{ error: string | null }> => {
    try {
      if (user) {
        // Authenticated user: Save to Supabase
        const { error } = await supabase
          .from('user_profiles')
          .update({
            encrypted_api_key: key,
            api_key_added_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) {
          console.error('Error saving API key:', error);
          return { error: error.message };
        }

        setApiKeyState(key);
        return { error: null };
      } else {
        // Guest user: Save to localStorage
        localStorage.setItem(LOCAL_STORAGE_KEY, key);
        setApiKeyState(key);
        return { error: null };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save API key';
      return { error: message };
    }
  }, [user]);

  const clearApiKey = useCallback(async (): Promise<{ error: string | null }> => {
    try {
      if (user) {
        // Authenticated user: Clear from Supabase
        const { error } = await supabase
          .from('user_profiles')
          .update({
            encrypted_api_key: null,
            api_key_added_at: null,
          })
          .eq('id', user.id);

        if (error) {
          console.error('Error clearing API key:', error);
          return { error: error.message };
        }

        setApiKeyState(null);
        return { error: null };
      } else {
        // Guest user: Clear from localStorage
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setApiKeyState(null);
        return { error: null };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear API key';
      return { error: message };
    }
  }, [user]);

  return {
    apiKey,
    isLoading: isLoading || authLoading,
    setApiKey,
    clearApiKey,
    hasApiKey: !!apiKey,
  };
}
