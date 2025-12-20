'use client';

/**
 * Templates Modal Component
 *
 * Displays available stack templates for users to browse and select.
 * Features:
 * - Featured templates section
 * - Community templates section
 * - Search functionality
 * - Tag-based filtering
 * - Usage tracking on selection
 */

import { useState, useEffect, useMemo } from 'react';

interface Template {
  id: string;
  name: string;
  description: string | null;
  author_name: string;
  components: any[];
  tags: string[];
  is_featured: boolean;
  use_count: number;
}

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (components: any[]) => void;
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: Template;
  onSelect: (template: Template) => void;
}) {
  return (
    <button
      onClick={() => onSelect(template)}
      className="text-left p-4 border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all bg-white dark:bg-slate-800 dark:border-slate-700 dark:hover:border-blue-500"
    >
      {/* Header with name and component count */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-slate-900 dark:text-white">
          {template.name}
        </h4>
        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-full">
          {template.components.length} components
        </span>
      </div>

      {/* Description (2 line clamp) */}
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
        {template.description || 'No description available'}
      </p>

      {/* Tags (show first 3) */}
      <div className="flex flex-wrap gap-1 mb-2">
        {template.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded"
          >
            {tag}
          </span>
        ))}
        {template.tags.length > 3 && (
          <span className="px-2 py-0.5 text-slate-500 dark:text-slate-400 text-xs">
            +{template.tags.length - 3} more
          </span>
        )}
      </div>

      {/* Footer with author and use count */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>by {template.author_name}</span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {template.use_count}
        </span>
      </div>
    </button>
  );
}

export function TemplatesModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplatesModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Fetch templates when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  // Fetch templates with optional filters
  const fetchTemplates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (activeTag) params.set('tag', activeTag);

      const response = await fetch(`/api/templates?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch templates');

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setError('Failed to load templates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch when search or tag changes (with debounce)
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      fetchTemplates();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, activeTag, isOpen]);

  // Collect all unique tags from templates
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    templates.forEach((t) => t.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [templates]);

  // Separate featured and community templates
  const featuredTemplates = templates.filter((t) => t.is_featured);
  const communityTemplates = templates.filter((t) => !t.is_featured);

  // Handle template selection
  const handleSelect = async (template: Template) => {
    // Track usage (don't await - fire and forget)
    fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: template.id }),
    }).catch(console.error);

    // Call the onSelectTemplate callback
    onSelectTemplate(template.components);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Stack Templates
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Choose a pre-configured stack to get started quickly
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full px-4 py-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Tag filters */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => setActiveTag(null)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  activeTag === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    activeTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-slate-500 dark:text-slate-400">Loading templates...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-red-500 mb-4">{error}</div>
              <button
                onClick={fetchTemplates}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-slate-500 dark:text-slate-400">
                {search || activeTag ? 'No templates found matching your filters' : 'No templates available'}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Featured Templates */}
              {featuredTemplates.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-yellow-500">★</span>
                    Featured Templates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featuredTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onSelect={handleSelect}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Community Templates */}
              {communityTemplates.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span>👥</span>
                    Community Templates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {communityTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onSelect={handleSelect}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
