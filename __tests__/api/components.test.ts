/**
 * Components API Route Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          range: vi.fn(() => ({
            eq: vi.fn(() => ({
              or: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
            })),
            or: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
          })),
        })),
      })),
    })),
  },
}));

// Import after mocking
import { GET } from '@/app/api/components/route';
import { supabase } from '@/lib/supabase';

describe('GET /api/components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (params: Record<string, string> = {}) => {
    const url = new URL('http://localhost/api/components');
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return new NextRequest(url);
  };

  it('should return components with default pagination', async () => {
    const mockComponents = [
      {
        id: 'test-1',
        type: 'agent',
        name: 'Test Agent',
        description: 'A test agent',
        author: 'Test Author',
        icon: '🤖',
        downloads: 100,
        rating: 4.5,
        tags: ['test'],
        compatible_models: ['claude-opus-4'],
        config_schema: {},
      },
    ];

    // Setup mock chain
    const mockRange = vi.fn(() => Promise.resolve({
      data: mockComponents,
      error: null,
      count: 1,
    }));
    const mockOrder = vi.fn(() => ({ range: mockRange }));
    const mockSelect = vi.fn(() => ({ order: mockOrder }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

    const request = createRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.components).toHaveLength(1);
    expect(data.components[0]).toMatchObject({
      id: 'test-1',
      type: 'agent',
      name: 'Test Agent',
    });
    expect(data.limit).toBe(50);
    expect(data.offset).toBe(0);
  });

  it('should filter by type', async () => {
    const mockEq = vi.fn(() => Promise.resolve({
      data: [],
      error: null,
      count: 0,
    }));
    const mockRange = vi.fn(() => ({ eq: mockEq }));
    const mockOrder = vi.fn(() => ({ range: mockRange }));
    const mockSelect = vi.fn(() => ({ order: mockOrder }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

    const request = createRequest({ type: 'mcp' });
    await GET(request);

    expect(mockEq).toHaveBeenCalledWith('type', 'mcp');
  });

  it('should handle search query', async () => {
    const mockOr = vi.fn(() => Promise.resolve({
      data: [],
      error: null,
      count: 0,
    }));
    const mockRange = vi.fn(() => ({ or: mockOr }));
    const mockOrder = vi.fn(() => ({ range: mockRange }));
    const mockSelect = vi.fn(() => ({ order: mockOrder }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

    const request = createRequest({ search: 'github' });
    await GET(request);

    expect(mockOr).toHaveBeenCalledWith(
      expect.stringContaining('github')
    );
  });

  it('should respect limit and offset params', async () => {
    const mockRange = vi.fn(() => Promise.resolve({
      data: [],
      error: null,
      count: 0,
    }));
    const mockOrder = vi.fn(() => ({ range: mockRange }));
    const mockSelect = vi.fn(() => ({ order: mockOrder }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

    const request = createRequest({ limit: '10', offset: '20' });
    const response = await GET(request);
    const data = await response.json();

    expect(mockRange).toHaveBeenCalledWith(20, 29);
    expect(data.limit).toBe(10);
    expect(data.offset).toBe(20);
  });

  it('should handle Supabase errors', async () => {
    const mockRange = vi.fn(() => Promise.resolve({
      data: null,
      error: { message: 'Database error' },
      count: null,
    }));
    const mockOrder = vi.fn(() => ({ range: mockRange }));
    const mockSelect = vi.fn(() => ({ order: mockOrder }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

    const request = createRequest();
    const response = await GET(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to fetch components');
  });

  it('should transform data to match frontend expectations', async () => {
    const mockComponents = [{
      id: 'test-1',
      type: 'mcp',
      name: 'Test MCP',
      description: 'A test MCP',
      author: 'Author',
      icon: null,
      downloads: null,
      rating: '4.5',
      tags: null,
      compatible_models: null,
      config_schema: null,
      github_url: 'https://github.com/test',
      install_command: 'npm install test',
      npm_packages: ['test'],
      dependencies: { env: {} },
      credentials_required: ['API_KEY'],
    }];

    const mockRange = vi.fn(() => Promise.resolve({
      data: mockComponents,
      error: null,
      count: 1,
    }));
    const mockOrder = vi.fn(() => ({ range: mockRange }));
    const mockSelect = vi.fn(() => ({ order: mockOrder }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

    const request = createRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(data.components[0]).toMatchObject({
      icon: '📦', // Default icon
      downloads: 0, // Default downloads
      rating: 4.5, // Parsed float
      tags: [], // Default array
      compatibleModels: [], // Default array
      configSchema: {}, // Default object
      githubUrl: 'https://github.com/test',
      credentialsRequired: ['API_KEY'],
    });
  });
});
