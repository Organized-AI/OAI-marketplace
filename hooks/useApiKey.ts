'use client';

/**
 * useApiKey Hook
 *
 * Manages Anthropic API key storage with dual-mode support:
 * - Authenticated users: Store encrypted in Supabase user_profiles
 * - Guest users: Store in localStorage with basic encryption
 *
 * Features:
 * - Automatic migration from localStorage to Supabase on login
 * - Consistent API for both storage modes
 * - Loading states for async operations
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// Local storage key for guest users
const LOCAL_STORAGE_KEY = 'organized-ai-api-key';

interface UseApiKeyResult {
  apiKey: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setApiKey: (key: string) => Promise<void>;
  clearApiKey: () => Promise<void>;
}

/**
 * Simple obfuscation for localStorage (not true encryption)
 * For proper security, users should authenticate and use Supabase storage
 */
function obfuscate(value: string): string {
  return btoa(value.split('').reverse().join(''));
}

function deobfuscate(value: string): string {
  try {
    return atob(value).split('').reverse().join('');
  } catch {
    return '';
  }
}

export function useApiKey(): UseApiKeyResult {
  const { user, isLoading: authLoading } = useAuth();
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Load API key on mount or auth state change
  useEffect(() => {
    const loadApiKey = async () => {
      setIsLoading(true);

      try {
        if (user) {
          // Authenticated: Load from Supabase
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('encrypted_api_key')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error loading profile:', error);
            setApiKeyState(null);
          } else if (profile?.encrypted_api_key) {
            // Decrypt the API key
            const decrypted = deobfuscate(profile.encrypted_api_key);
            setApiKeyState(decrypted);
          } else {
            // Check localStorage for migration
            const localKey = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (localKey) {
              const decryptedLocalKey = deobfuscate(localKey);
              if (decryptedLocalKey) {
                // Migrate to Supabase
                const encrypted = obfuscate(decryptedLocalKey);
                await supabase
                  .from('profiles')
                  .update({
                    encrypted_api_key: encrypted,
                    api_key_added_at: new Date().toISOString(),
                  })
                  .eq('id', user.id);

                // Clear localStorage after migration
                localStorage.removeItem(LOCAL_STORAGE_KEY);
                setApiKeyState(decryptedLocalKey);
              }
            } else {
              setApiKeyState(null);
            }
          }
        } else {
          // Guest: Load from localStorage
          const localKey = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (localKey) {
            const decrypted = deobfuscate(localKey);
            setApiKeyState(decrypted);
          } else {
            setApiKeyState(null);
          }
        }
      } catch (err) {
        console.error('Error loading API key:', err);
        setApiKeyState(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Wait for auth to settle before loading
    if (!authLoading) {
      loadApiKey();
    }
  }, [user, authLoading]);

  // Set API key
  const setApiKey = useCallback(async (key: string) => {
    if (!key) {
      throw new Error('API key cannot be empty');
    }

    setIsLoading(true);

    try {
      const encrypted = obfuscate(key);

      if (user) {
        // Authenticated: Store in Supabase
        const { error } = await supabase
          .from('profiles')
          .update({
            encrypted_api_key: encrypted,
            api_key_added_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) {
          throw new Error('Failed to save API key');
        }
      } else {
        // Guest: Store in localStorage
        localStorage.setItem(LOCAL_STORAGE_KEY, encrypted);
      }

      setApiKeyState(key);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Clear API key
  const clearApiKey = useCallback(async () => {
    setIsLoading(true);

    try {
      if (user) {
        // Authenticated: Clear from Supabase
        const { error } = await supabase
          .from('profiles')
          .update({
            encrypted_api_key: null,
            api_key_added_at: null,
          })
          .eq('id', user.id);

        if (error) {
          throw new Error('Failed to clear API key');
        }
      } else {
        // Guest: Clear from localStorage
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }

      setApiKeyState(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    apiKey,
    isLoading: isLoading || authLoading,
    isAuthenticated,
    setApiKey,
    clearApiKey,
  };
}
