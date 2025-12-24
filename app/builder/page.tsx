'use client';

/**
 * Stack Builder Page
 *
 * Main page for the visual Stack Builder interface.
 * Layout: ComponentLibrary (left) | Canvas (center) | DetailsPanel (right)
 *
 * URL Parameters:
 * - ?importStack=<base64json> - Import a stack from URL (base64-encoded JSON array)
 * - ?autoAnalyze=true - Auto-open AI analysis modal after import
 */

import { useState, useEffect, Suspense } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Link from 'next/link';
import { StackBuilderCanvas } from '@/components/stack-builder/StackBuilderCanvas';
import { ComponentLibrary } from '@/components/stack-builder/ComponentLibrary';
import { ComponentDetailsPanel } from '@/components/stack-builder/ComponentDetailsPanel';
import { ExportModal } from '@/components/stack-builder/ExportModal';
import { AIAnalysisModal } from '@/components/stack-builder/AIAnalysisModal';
import { UserMenu } from '@/components/auth/UserMenu';
import { useStackBuilderStore } from '@/stores/stack-builder-store';
import { useSearchParams } from 'next/navigation';
import type { Component } from '@/lib/types/stack-builder';

function BuilderContent() {
  const { nodes, clearCanvas, stackName, setStackName, addComponent } = useStackBuilderStore();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const searchParams = useSearchParams();

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

            {/* Divider */}
            <div className="w-px h-8 bg-slate-200" />

            {/* User Menu */}
            <UserMenu />
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <StackBuilderCanvas />
        </div>
      </div>

      {/* Right: Component Details */}
      <ComponentDetailsPanel />

      {/* Export Modal */}
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />

      {/* AI Analysis Modal */}
      <AIAnalysisModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
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
