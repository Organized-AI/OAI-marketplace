'use client';

/**
 * Stack Builder Page
 *
 * Main page for the visual Stack Builder interface.
 * Layout: ComponentLibrary (left) | Canvas (center) | DetailsPanel (right)
 *
 * Authentication States:
 * - State A: Not logged in - Shows sign in prompt
 * - State B: Logged in, no API key - Shows API key prompt
 * - State C: Fully authenticated - Shows full builder
 *
 * URL Parameters:
 * - ?importStack=<base64json> - Import a stack from URL (base64-encoded JSON array)
 * - ?autoAnalyze=true - Auto-open AI analysis modal after import
 */

import { useState, useEffect, Suspense } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { StackBuilderCanvas } from '@/components/stack-builder/StackBuilderCanvas';
import { ComponentLibrary } from '@/components/stack-builder/ComponentLibrary';
import { ComponentDetailsPanel } from '@/components/stack-builder/ComponentDetailsPanel';
import { ExportModal } from '@/components/stack-builder/ExportModal';
import { AIAnalysisModal } from '@/components/stack-builder/AIAnalysisModal';
import { AuthModal } from '@/components/AuthModal';
import { AuthStatus } from '@/components/AuthStatus';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { useAuth } from '@/contexts/AuthContext';
import { useApiKey } from '@/hooks/useApiKey';
import { useStackBuilderStore } from '@/stores/stack-builder-store';
import { useSearchParams } from 'next/navigation';
import type { Component } from '@/lib/types/stack-builder';

function BuilderContent() {
  const { nodes, clearCanvas, stackName, setStackName, addComponent } = useStackBuilderStore();
  const { user, isLoading: authLoading } = useAuth();
  const { apiKey, isLoading: apiKeyLoading } = useApiKey();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const searchParams = useSearchParams();

  // Combined loading state
  const isLoading = authLoading || apiKeyLoading;

  // Handle URL parameters for importing stack from marketplace
  useEffect(() => {
    const importStack = searchParams.get('importStack');
    const autoAnalyze = searchParams.get('autoAnalyze');

    if (importStack) {
      try {
        // Decode base64 and parse JSON
        const stackData = JSON.parse(atob(importStack));

        // Import each component into the canvas
        stackData.forEach((componentData: Record<string, unknown>, index: number) => {
          const component: Component = {
            id: componentData.id as string,
            type: componentData.type as Component['type'],
            name: componentData.name as string,
            description: (componentData.description as string) || '',
            icon: (componentData.icon as string) || '📦',
            author: (componentData.author as string) || 'Imported',
            downloads: (componentData.downloads as number) || 0,
            rating: (componentData.rating as number) || 0,
            tags: (componentData.tags as string[]) || [],
            compatibleModels: (componentData.compatibleModels as string[]) || [],
          };

          // Calculate position in grid layout
          const col = index % 3;
          const row = Math.floor(index / 3);
          const position = { x: 150 + col * 350, y: 100 + row * 250 };

          addComponent(component, position);
        });

        // Auto-open analysis modal if requested
        if (autoAnalyze === 'true') {
          setTimeout(() => {
            setIsAIModalOpen(true);
          }, 500);
        }

        // Clean up URL parameters
        window.history.replaceState({}, '', '/builder');
      } catch (error) {
        console.error('Failed to import stack:', error);
      }
    }
  }, [searchParams, addComponent]);

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const handleAnalyze = () => {
    setIsAIModalOpen(true);
  };

  const handleClearCanvas = () => {
    if (confirm('Are you sure you want to clear the canvas? This will remove all components.')) {
      clearCanvas();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // State A: Not logged in - Show welcome message
  if (!user) {
    return (
      <div className="flex h-screen bg-slate-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md text-center p-8">
            <div className="text-6xl mb-6">🛠️</div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Welcome to Stack Builder
            </h1>
            <p className="text-slate-600 mb-8">
              Create custom Claude Code configurations visually.
              Sign in to save your stacks, sync your API key across devices,
              and access AI-powered analysis.
            </p>

            <button
              onClick={() => setShowAuthModal(true)}
              className="px-8 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In to Continue
            </button>

            <div className="mt-6 grid grid-cols-3 gap-4 text-sm text-slate-500">
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">☁️</span>
                <span>Cloud sync</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">🔐</span>
                <span>Secure storage</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">🤖</span>
                <span>AI analysis</span>
              </div>
            </div>
          </div>
        </div>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  // State B: Logged in but no API key - Show API key prompt
  if (!apiKey) {
    return (
      <div className="flex h-screen bg-slate-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md text-center p-8">
            <div className="text-6xl mb-6">🔑</div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Welcome, {user.email?.split('@')[0]}!
            </h1>
            <p className="text-slate-600 mb-8">
              To use AI-powered stack analysis and validation,
              connect your Anthropic API key. Your key is encrypted
              and stored securely.
            </p>

            <button
              onClick={() => setShowApiKeyModal(true)}
              className="px-8 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connect Your API Key
            </button>

            <div className="mt-6 flex justify-center">
              <a
                href="/settings"
                className="text-sm text-slate-500 hover:text-slate-700 underline"
              >
                Go to Settings
              </a>
            </div>
          </div>
        </div>

        <ApiKeyModal
          isOpen={showApiKeyModal}
          onClose={() => setShowApiKeyModal(false)}
        />
      </div>
    );
  }

  // State C: Fully authenticated - Show full builder
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Left: Component Library */}
      <ComponentLibrary />

      {/* Center: Canvas with Toolbar */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Stack Builder</h1>
            <p className="text-sm text-slate-600">
              Visual composer for Claude Code configurations
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Stack Name Input */}
            <input
              type="text"
              value={stackName}
              onChange={(e) => setStackName(e.target.value)}
              placeholder="My Awesome Stack"
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />

            {/* Actions */}
            <button
              onClick={handleClearCanvas}
              disabled={nodes.length === 0}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Canvas
            </button>
            <button
              onClick={handleAnalyze}
              disabled={nodes.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Analyze with AI
            </button>
            <button
              onClick={handleExport}
              disabled={nodes.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export Stack
            </button>

            {/* Auth Status */}
            <div className="border-l border-slate-200 pl-3 ml-2">
              <AuthStatus onSignInClick={() => setShowAuthModal(true)} />
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <StackBuilderCanvas />
        </div>
      </div>

      {/* Right: Component Details */}
      <ComponentDetailsPanel />

      {/* Modals */}
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
      <AIAnalysisModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <ApiKeyModal isOpen={showApiKeyModal} onClose={() => setShowApiKeyModal(false)} />
    </div>
  );
}

function BuilderLoading() {
  return (
    <div className="flex h-screen bg-slate-50 items-center justify-center">
      <div className="text-slate-600">Loading Stack Builder...</div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <ReactFlowProvider>
      <Suspense fallback={<BuilderLoading />}>
        <BuilderContent />
      </Suspense>
    </ReactFlowProvider>
  );
}
