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
 * - Real-time API data with fallback
 */

import { useState, DragEvent, useEffect } from 'react';
import type { Component, ComponentType } from '@/lib/types/stack-builder';
import { useComponents } from '@/hooks/useComponents';

const CATEGORIES: { type: ComponentType | 'all'; label: string; icon: string }[] = [
  { type: 'all', label: 'All', icon: '📦' },
  { type: 'agent', label: 'Agents', icon: '🤖' },
  { type: 'mcp', label: 'MCPs', icon: '🔌' },
  { type: 'command', label: 'Commands', icon: '⚡' },
  { type: 'hook', label: 'Hooks', icon: '🪝' },
  { type: 'skill', label: 'Skills', icon: '🎯' },
  { type: 'setting', label: 'Settings', icon: '⚙️' },
];

export function ComponentLibrary() {
  const [selectedCategory, setSelectedCategory] = useState<ComponentType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch components from API
  const { components, isLoading, error, total } = useComponents({
    type: selectedCategory,
    search: debouncedSearch,
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Component Library</h2>
          {total > 0 && (
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
              {total} components
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pl-9 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mt-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Category tabs */}
      <div className="px-4 py-3 border-b border-slate-200 overflow-x-auto">
        <div className="flex gap-2">
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
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-slate-200 animate-pulse"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : components.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-400 text-sm">
              {debouncedSearch ? 'No components match your search' : 'No components found'}
            </div>
          </div>
        ) : (
          components.map((component) => (
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

                  {/* Tags */}
                  {component.tags && component.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {component.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <span>⭐ {component.rating?.toFixed(1) || 'N/A'}</span>
                    <span>•</span>
                    <span>↓ {component.downloads?.toLocaleString() || 0}</span>
                    <span>•</span>
                    <span className="truncate">{component.author}</span>
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
