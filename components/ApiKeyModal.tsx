'use client';

/**
 * API Key Modal Component
 *
 * Modal for entering and saving Anthropic API key.
 * Validates the key format and provides setup instructions.
 */

import { useState } from 'react';
import { useApiKey } from '@/hooks/useApiKey';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function ApiKeyModal({ isOpen, onClose, onSuccess }: ApiKeyModalProps) {
  const { setApiKey, isLoading } = useApiKey();
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateKey = (value: string): boolean => {
    // Anthropic API keys start with "sk-ant-"
    if (!value.startsWith('sk-ant-')) {
      setError('API key should start with "sk-ant-"');
      return false;
    }
    if (value.length < 40) {
      setError('API key appears to be too short');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateKey(key)) {
      return;
    }

    setIsSubmitting(true);

    try {
      await setApiKey(key);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError('Failed to save API key. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProcessing = isSubmitting || isLoading;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden"
        role="dialog"
        aria-labelledby="api-key-modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="api-key-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
                Connect Your API Key
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Enter your Anthropic API key to use AI-powered features
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Instructions */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              How to get your API key:
            </h3>
            <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
              <li>
                Go to{' '}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  console.anthropic.com
                </a>
              </li>
              <li>Sign in or create an account</li>
              <li>Navigate to API Keys</li>
              <li>Create a new key and copy it</li>
            </ol>
          </div>

          {/* API Key Input */}
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              API Key
            </label>
            <input
              id="api-key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
              placeholder="sk-ant-..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Your API key is encrypted and stored securely
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing || !key}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : (
              'Save API Key'
            )}
          </button>
        </form>

        {/* Security Note */}
        <div className="px-6 pb-6">
          <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>
              Your API key is used only for AI analysis features and is never shared with third parties.
              When logged in, keys are stored encrypted in our secure database.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
