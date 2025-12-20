'use client';

/**
 * API Keys Section Component
 *
 * Manages user API keys with add, update, and remove functionality.
 * Shows masked key display, update/remove actions with confirmation.
 */

import { useState } from 'react';
import { useApiKey } from '@/hooks/useApiKey';
import { ApiKeyModal } from '@/components/auth/ApiKeyModal';

export function ApiKeysSection() {
  const { apiKey, isLoading, clearApiKey } = useApiKey();
  const [showModal, setShowModal] = useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Mask the API key: sk-ant-...xxxx
  const getMaskedKey = (key: string): string => {
    if (key.length <= 12) return key;
    const lastFour = key.slice(-4);
    return `sk-ant-...${lastFour}`;
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await clearApiKey();
      setShowConfirmRemove(false);
    } finally {
      setIsRemoving(false);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          API Keys
        </h2>
        <div className="animate-pulse">
          <div className="h-20 bg-slate-100 dark:bg-slate-700 rounded-lg" />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
        API Keys
      </h2>

      {apiKey ? (
        /* API Key Exists */
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Anthropic API Key
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <code className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {getMaskedKey(apiKey)}
                  </code>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Active
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowModal(true)}
                className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors"
              >
                Update
              </button>
              <button
                onClick={() => setShowConfirmRemove(true)}
                className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-slate-600 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* No API Key - Empty State */
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-lg p-8 text-center">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
            No API key configured
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Add your Anthropic API key to enable AI analysis features
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add API Key
          </button>
        </div>
      )}

      {/* Security Note */}
      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Your API key is encrypted and stored securely.
      </p>

      {/* API Key Modal */}
      <ApiKeyModal isOpen={showModal} onClose={() => setShowModal(false)} />

      {/* Remove Confirmation Dialog */}
      {showConfirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowConfirmRemove(false)}
          />
          <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Remove API Key?
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              This will remove your Anthropic API key. AI analysis features will be disabled until you add a new key.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmRemove(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={isRemoving}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isRemoving ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
