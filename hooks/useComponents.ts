/**
 * useComponents Hook
 *
 * Fetches components from the API with caching, filtering, and search.
 * Falls back to mock data if API is unavailable.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Component, ComponentType } from '@/lib/types/stack-builder';

interface UseComponentsOptions {
  type?: ComponentType | 'all';
  search?: string;
  limit?: number;
  offset?: number;
}

interface UseComponentsResult {
  components: Component[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Fallback mock data when API is unavailable
const FALLBACK_COMPONENTS: Component[] = [
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
    id: 'python-specialist',
    type: 'agent',
    name: 'Python Specialist',
    description: 'Expert in Python, FastAPI, and backend development',
    icon: '🐍',
    author: 'Organized AI',
    downloads: 980,
    rating: 4.7,
    tags: ['python', 'backend', 'fastapi'],
    compatibleModels: ['claude-opus-4', 'claude-sonnet-4'],
  },
  {
    id: 'security-auditor',
    type: 'agent',
    name: 'Security Auditor',
    description: 'Scans code for security vulnerabilities and best practices',
    icon: '🔒',
    author: 'Organized AI',
    downloads: 720,
    rating: 4.9,
    tags: ['security', 'audit', 'vulnerability'],
    compatibleModels: ['claude-opus-4', 'claude-sonnet-4'],
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
    id: 'slack-mcp',
    type: 'mcp',
    name: 'Slack MCP',
    description: 'Send messages and interact with Slack workspaces',
    icon: '💬',
    author: 'Community',
    downloads: 650,
    rating: 4.5,
    tags: ['slack', 'messaging', 'notifications'],
    compatibleModels: ['claude-opus-4', 'claude-sonnet-4'],
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
    id: 'explain-code',
    type: 'command',
    name: 'Explain Code',
    description: 'Get detailed explanations of code snippets',
    icon: '📖',
    author: 'Organized AI',
    downloads: 2300,
    rating: 4.8,
    tags: ['documentation', 'learning'],
    compatibleModels: ['claude-opus-4', 'claude-sonnet-4', 'claude-haiku-4'],
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
  {
    id: 'post-push-notify',
    type: 'hook',
    name: 'Post-Push Notify',
    description: 'Send notifications after pushing to remote',
    icon: '🔔',
    author: 'Community',
    downloads: 450,
    rating: 4.3,
    tags: ['git', 'notifications'],
    compatibleModels: ['claude-opus-4', 'claude-sonnet-4', 'claude-haiku-4'],
  },
  {
    id: 'code-reviewer',
    type: 'skill',
    name: 'Code Reviewer',
    description: 'Systematic code review with best practices',
    icon: '🎯',
    author: 'Organized AI',
    downloads: 1890,
    rating: 4.8,
    tags: ['code-review', 'quality'],
    compatibleModels: ['claude-opus-4', 'claude-sonnet-4'],
  },
  {
    id: 'refactoring-expert',
    type: 'skill',
    name: 'Refactoring Expert',
    description: 'Improve code structure without changing behavior',
    icon: '🔧',
    author: 'Organized AI',
    downloads: 1200,
    rating: 4.6,
    tags: ['refactoring', 'clean-code'],
    compatibleModels: ['claude-opus-4', 'claude-sonnet-4'],
  },
];

// Simple in-memory cache
let cache: { data: Component[]; total: number; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useComponents(options: UseComponentsOptions = {}): UseComponentsResult {
  const { type = 'all', search = '', limit = 50, offset = 0 } = options;

  const [components, setComponents] = useState<Component[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComponents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check cache for unfiltered requests
      if (type === 'all' && !search && cache && Date.now() - cache.timestamp < CACHE_TTL) {
        setComponents(cache.data);
        setTotal(cache.total);
        setIsLoading(false);
        return;
      }

      // Build query params
      const params = new URLSearchParams();
      if (type !== 'all') params.set('type', type);
      if (search) params.set('search', search);
      params.set('limit', limit.toString());
      params.set('offset', offset.toString());

      const response = await fetch(`/api/components?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Update cache for unfiltered requests
      if (type === 'all' && !search) {
        cache = {
          data: data.components,
          total: data.total,
          timestamp: Date.now(),
        };
      }

      setComponents(data.components);
      setTotal(data.total);
    } catch (err) {
      console.warn('Failed to fetch components from API, using fallback:', err);
      setError('Using offline data - API unavailable');

      // Apply filters to fallback data
      let filtered = FALLBACK_COMPONENTS;

      if (type !== 'all') {
        filtered = filtered.filter((c) => c.type === type);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.name.toLowerCase().includes(searchLower) ||
            c.description.toLowerCase().includes(searchLower) ||
            c.tags.some((t) => t.toLowerCase().includes(searchLower))
        );
      }

      setComponents(filtered.slice(offset, offset + limit));
      setTotal(filtered.length);
    } finally {
      setIsLoading(false);
    }
  }, [type, search, limit, offset]);

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  return {
    components,
    total,
    isLoading,
    error,
    refetch: fetchComponents,
  };
}

export { FALLBACK_COMPONENTS };
