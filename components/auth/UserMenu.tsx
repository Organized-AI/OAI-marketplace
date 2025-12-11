'use client';

/**
 * User Menu Component
 *
 * Displays user avatar and dropdown menu with account options.
 * Shows login button when not authenticated.
 */

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function UserMenu() {
  const { user, isLoading, signOut, signInWithOAuth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleSignIn = async () => {
    await signInWithOAuth('github');
  };

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        Sign in with GitHub
      </button>
    );
  }

  const userInitial = user.email?.[0]?.toUpperCase() || 'U';
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="User avatar"
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
            {userInitial}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-slate-200">
            <p className="text-sm font-medium text-slate-900 truncate">
              {user.user_metadata?.full_name || user.email}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user.email}
            </p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <a
              href="/settings"
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              Settings
            </a>
            <a
              href="/credentials"
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              Credentials
            </a>
            <a
              href="/my-stacks"
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              My Stacks
            </a>
          </div>

          {/* Sign out */}
          <div className="border-t border-slate-200 py-1">
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
