'use client';

/**
 * Component Library Sidebar
 *
 * Displays categorized list of available components that can be
 * dragged onto the Stack Builder canvas.
 *
 * Features:
 * - Category filtering (Agents, MCPs, Commands, etc.)
 * - Search functionality
 * - Drag-and-drop to canvas
 * - Component metadata display
 */

import { useState, DragEvent } from 'react';
import type { Component, ComponentType } from '@/lib/types/stack-builder';

// Mock data - in production, this would come from API
const MOCK_COMPONENTS: Component[] = [
  {
    id: 'react-specialist',
    type: 'agent',
    name: 'React Specialist',
    description: 'Expert agent for React, Next.js, and modern frontend development',
    icon: '⚛️',
    author: 'Organized AI',
    downloads: 1250,
    rating: 4.8,
    tags: ['react', 'frontend', 'nextjs'],
    compatibleModels: ['claude-opus-4', 'claude-sonnet-4'],
    configSchema: {
      ENABLE_TSX: {
        type: 'boolean',
        required: false,
        default: true,
        description: 'Enable TypeScript JSX support',
      },
    },
  },
  {
    id: 'github-mcp',
    type: 'mcp',
    name: 'GitHub MCP',
    description: 'Integrate with GitHub API for repository operations',
    icon: '🔌',
    author: 'Anthropic',
    downloads: 3420,
    rating: 4.9,
    tags: ['github', 'git', 'version-control'],
    compatibleModels: ['claude-opus-4', 'claude-sonnet-4', 'claude-haiku-4'],
    configSchema: {
      GITHUB_TOKEN: {
        type: 'string',
        required: true,
        sensitive: true,
        description: 'GitHub Personal Access Token with repo scope',
        placeholder: 'ghp_xxxxxxxxxxxxxxxxxxxx',
        validation: {
          pattern: '^ghp_[a-zA-Z0-9]{36}$',
          message: 'Must be a valid GitHub personal access token (ghp_...)',
        },
      },
      DEFAULT_BRANCH: {
        type: 'string',
        required: false,
        description: 'Default branch for operations',
        placeholder: 'main',
        default: 'main',
      },
      MAX_FILE_SIZE: {
        type: 'number',
        required: false,
        description: 'Maximum file size in MB',
        default: 10,
        validation: {
          min: 1,
          max: 100,
          message: 'Must be between 1 and 100 MB',
        },
      },
    },
  },
  {
    id: 'supabase-mcp',
    type: 'mcp',
    name: 'Supabase MCP',
    description: 'Connect to Supabase for database operations',
    icon: '🗄️',
    author: 'Community',
    downloads: 890,
    rating: 4.6,
    tags: ['database', 'supabase', 'postgresql'],
    compatibleModels: ['claude-opus-4', 'claude-sonnet-4'],
    configSchema: {
      SUPABASE_URL: {
        type: 'string',
        required: true,
        description: 'Supabase project URL',
        placeholder: 'https://xxx.supabase.co',
      },
      SUPABASE_KEY: {
        type: 'string',
        required: true,
        sensitive: true,
        description: 'Supabase anon/service key',
      },
    },
  },
  {
    id: 'generate-tests',
    type: 'command',
    name: 'Generate Tests',
    description: 'Auto-generate unit tests for your code',
    icon: '⚡',
    author: 'Organized AI',
    downloads: 1680,
    rating: 4.7,
    tags: ['testing', 'automation'],
    compatibleModels: ['claude-opus-4', 'claude-sonnet-4'],
  },
  {
    id: 'pre-commit-review',
    type: 'hook',
    name: 'Pre-Commit Review',
    description: 'Review code before committing to catch issues early',
    icon: '🪝',
    author: 'Organized AI',
    downloads: 2100,
    rating: 4.9,
    tags: ['git', 'code-review', 'quality'],
    compatibleModels: ['claude-opus-4', 'claude-sonnet-4'],
  },
];

const CATEGORIES: { type: ComponentType; label: string; icon: string }[] = [
  { type: 'agent', label: 'Agents', icon: '🤖' },
  { type: 'mcp', label: 'MCPs', icon: '🔌' },
  { type: 'command', label: 'Commands', icon: '⚡' },
  { type: 'hook', label: 'Hooks', icon: '🪝' },
  { type: 'setting', label: 'Settings', icon: '⚙️' },
  { type: 'skill', label: 'Skills', icon: '🎯' },
];

export function ComponentLibrary() {
  const [selectedCategory, setSelectedCategory] = useState<ComponentType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter components
  const filteredComponents = MOCK_COMPONENTS.filter((component) => {
    const matchesCategory =
      selectedCategory === 'all' || component.type === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Handle drag start
  const onDragStart = (event: DragEvent<HTMLDivElement>, component: Component) => {
    event.dataTransfer.setData('application/json', JSON.stringify(component));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-80 h-full bg-white border-r border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Component Library</h2>

        {/* Search */}
        <input
          type="text"
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category tabs */}
      <div className="px-4 py-3 border-b border-slate-200 overflow-x-auto">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
              ${
                selectedCategory === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }
            `}
          >
            All
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category.type}
              onClick={() => setSelectedCategory(category.type)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                ${
                  selectedCategory === category.type
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }
              `}
            >
              {category.icon} {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredComponents.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-400 text-sm">No components found</div>
          </div>
        ) : (
          filteredComponents.map((component) => (
            <div
              key={component.id}
              draggable
              onDragStart={(e) => onDragStart(e, component)}
              className="
                p-3 rounded-lg border border-slate-200 bg-white
                cursor-grab active:cursor-grabbing
                hover:border-blue-300 hover:shadow-md
                transition-all duration-200
              "
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="text-2xl flex-shrink-0">{component.icon}</div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-900 truncate">
                    {component.name}
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {component.description}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <span>⭐ {component.rating}</span>
                    <span>•</span>
                    <span>↓ {component.downloads}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <div className="text-xs text-slate-600 text-center">
          💡 Drag components onto the canvas to build your stack
        </div>
      </div>
    </div>
  );
}
