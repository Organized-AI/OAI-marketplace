'use client';

/**
 * Component Browser
 *
 * Advanced component search and filter sidebar for the Stack Builder.
 * Features:
 * - Full-text search with debouncing
 * - Category tabs with counts
 * - Tag filters with AND logic
 * - Cmd+K keyboard shortcut to focus search
 * - Click to add components to canvas
 * - Dark mode support
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Component } from '@/lib/types/stack-builder';
import { useDebounce } from '@/hooks/useDebounce';

interface ComponentBrowserProps {
  onAddComponent: (component: Component) => void;
}

interface CategoryItem {
  id: string;
  label: string;
  icon: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'all', label: 'All', icon: '📦' },
  { id: 'agent', label: 'Agents', icon: '🤖' },
  { id: 'mcp', label: 'MCPs', icon: '🔌' },
  { id: 'hook', label: 'Hooks', icon: '🪝' },
  { id: 'command', label: 'Commands', icon: '⚡' },
  { id: 'skill', label: 'Skills', icon: '🎯' },
  { id: 'setting', label: 'Settings', icon: '⚙️' },
];

interface ComponentCardProps {
  component: Component;
  onAdd: () => void;
}

function ComponentCard({ component, onAdd }: ComponentCardProps) {
  return (
    <div
      onClick={onAdd}
      className="
        p-3 rounded-lg border border-slate-200 dark:border-slate-700
        bg-white dark:bg-slate-800
        cursor-pointer group
        hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md
        transition-all duration-200
      "
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-2xl flex-shrink-0">{component.icon}</div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
              {component.name}
            </div>
            {/* Add icon on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 dark:text-blue-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
            {component.description}
          </div>

          {/* Tags - first 2 */}
          {component.tags && component.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {component.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
              {component.tags.length > 2 && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  +{component.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ComponentBrowser({ onAddComponent }: ComponentBrowserProps) {
  // State
  const [components, setComponents] = useState<Component[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search with 300ms delay
  const debouncedSearch = useDebounce(search, 300);

  // Computed
  const hasFilters = search !== '' || activeCategory !== 'all' || selectedTags.length > 0;

  // Fetch components
  const fetchComponents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build URL with query params
      const params = new URLSearchParams();
      if (debouncedSearch.length >= 2) {
        params.set('search', debouncedSearch);
      }
      if (activeCategory !== 'all') {
        params.set('category', activeCategory);
      }
      selectedTags.forEach((tag) => params.append('tag', tag));

      const response = await fetch(`/api/components?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      setComponents(data.components || []);
      if (data.meta) {
        setAvailableTags(data.meta.tags || []);
        setCategoryCounts(data.meta.categories || {});
      }
    } catch (err) {
      console.error('Failed to fetch components:', err);
      setError('Failed to load components');
      setComponents([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, activeCategory, selectedTags]);

  // Fetch on filter changes
  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  // Keyboard shortcut: Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper functions
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setActiveCategory('all');
    setSelectedTags([]);
  };

  const clearSearch = () => {
    setSearch('');
    searchInputRef.current?.focus();
  };

  // Get total count for "All" category
  const totalCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="w-72 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Components</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
            {isLoading ? '...' : components.length} shown
          </span>
        </div>

        {/* Search */}
        <div className="relative">
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
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full px-3 py-2 pl-9 pr-16
              border border-slate-300 dark:border-slate-600 rounded-lg
              text-sm text-slate-900 dark:text-slate-100
              bg-white dark:bg-slate-800
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />
          {/* Keyboard hint and clear button */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {search ? (
              <button
                onClick={clearSearch}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                ⌘K
              </span>
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mt-2 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Category tabs */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        <div className="flex gap-2">
          {CATEGORIES.map((category) => {
            const count = category.id === 'all' ? totalCount : categoryCounts[category.id] || 0;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                  flex items-center gap-1.5
                  ${
                    activeCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }
                `}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
                {count > 0 && (
                  <span
                    className={`text-xs ${
                      activeCategory === category.id
                        ? 'text-blue-100'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tag filters */}
      {availableTags.length > 0 && (
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-1.5">
            {availableTags.slice(0, 10).map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`
                  text-xs px-2 py-1 rounded-full transition-colors
                  ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }
                `}
              >
                {tag}
              </button>
            ))}
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Component list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 animate-pulse"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : components.length === 0 ? (
          // Empty state
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔍</div>
            <div className="text-slate-600 dark:text-slate-400 text-sm">
              {hasFilters ? 'No components match your search' : 'No components found'}
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          // Component cards
          components.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              onAdd={() => onAddComponent(component)}
            />
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="text-xs text-slate-600 dark:text-slate-400 text-center">
          Click a component to add it to your stack
        </div>
      </div>
    </div>
  );
}

export default ComponentBrowser;
