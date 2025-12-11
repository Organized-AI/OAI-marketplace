/**
 * useComponents Hook Tests
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useComponents, FALLBACK_COMPONENTS } from '@/hooks/useComponents';

describe('useComponents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules(); // Clear module cache to reset the internal cache
    (global.fetch as ReturnType<typeof vi.fn>).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should start in loading state', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    // Use type filter to avoid module cache
    const { result } = renderHook(() => useComponents({ type: 'agent' }));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.components).toEqual([]);
  });

  it('should fetch components from API', async () => {
    const mockComponents = [
      { id: 'test-1', name: 'Test Component', type: 'agent' },
    ];

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        components: mockComponents,
        total: 1,
      }),
    });

    // Use search to avoid module cache
    const { result } = renderHook(() => useComponents({ search: 'test' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.components).toEqual(mockComponents);
    expect(result.current.total).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('should fall back to mock data on API error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error')
    );

    // Use type to avoid module cache
    const { result } = renderHook(() => useComponents({ type: 'mcp' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.components.length).toBeGreaterThan(0);
    expect(result.current.error).toContain('offline');
  });

  it('should fall back on non-OK response', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
    });

    // Use type to avoid module cache
    const { result } = renderHook(() => useComponents({ type: 'command' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.components.length).toBeGreaterThan(0);
    expect(result.current.error).toContain('offline');
  });

  it('should filter by type', async () => {
    const mockAgents = [
      { id: 'agent-1', name: 'Agent 1', type: 'agent' },
    ];

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        components: mockAgents,
        total: 1,
      }),
    });

    const { result } = renderHook(() => useComponents({ type: 'agent' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('type=agent')
    );
  });

  it('should filter by search query', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        components: [],
        total: 0,
      }),
    });

    const { result } = renderHook(() => useComponents({ search: 'github' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('search=github')
    );
  });

  it('should apply pagination params', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        components: [],
        total: 0,
      }),
    });

    // Use search to avoid module cache
    const { result } = renderHook(() =>
      useComponents({ limit: 10, offset: 20, search: 'test' })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalled();
    const fetchUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(fetchUrl).toContain('limit=10');
    expect(fetchUrl).toContain('offset=20');
  });

  it('should refetch when called', async () => {
    let callCount = 0;
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          components: [{ id: `call-${callCount}` }],
          total: 1,
        }),
      });
    });

    // Use search to avoid module cache
    const { result } = renderHook(() => useComponents({ search: 'refetch-test' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(callCount).toBe(1);

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(callCount).toBe(2);
    });
  });

  it('should filter fallback data by type', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('API error')
    );

    const { result } = renderHook(() => useComponents({ type: 'mcp' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should only have MCP components
    expect(
      result.current.components.every((c) => c.type === 'mcp')
    ).toBe(true);
  });

  it('should filter fallback data by search', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('API error')
    );

    const { result } = renderHook(() => useComponents({ search: 'github' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should only have components matching 'github'
    expect(
      result.current.components.every(
        (c) =>
          c.name.toLowerCase().includes('github') ||
          c.description.toLowerCase().includes('github') ||
          c.tags.some((t) => t.toLowerCase().includes('github'))
      )
    ).toBe(true);
  });

  describe('FALLBACK_COMPONENTS', () => {
    it('should have valid fallback data', () => {
      expect(FALLBACK_COMPONENTS.length).toBeGreaterThan(0);

      FALLBACK_COMPONENTS.forEach((component) => {
        expect(component).toHaveProperty('id');
        expect(component).toHaveProperty('name');
        expect(component).toHaveProperty('type');
        expect(component).toHaveProperty('description');
        expect(component).toHaveProperty('icon');
        expect(component).toHaveProperty('author');
        expect(component).toHaveProperty('tags');
        expect(Array.isArray(component.tags)).toBe(true);
      });
    });

    it('should include diverse component types', () => {
      const types = new Set(FALLBACK_COMPONENTS.map((c) => c.type));
      expect(types.size).toBeGreaterThan(3);
    });
  });
});
