import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Type for component data from Supabase
interface ComponentRow {
  id: string;
  type: string;
  name: string;
  description: string | null;
  author: string;
  icon: string | null;
  downloads: number;
  rating: string | number;
  tags: string[] | null;
  category: string | null;
  compatible_models: string[] | null;
  config_schema: Record<string, unknown> | null;
  github_url: string | null;
  install_command: string | null;
  npm_packages: string[] | null;
  dependencies: Record<string, unknown> | null;
  credentials_required: string[] | null;
  is_active: boolean;
}

/**
 * GET /api/components
 *
 * Fetch components from Supabase with advanced search and filtering.
 * Query params:
 * - search: Full-text search (min 2 chars for search_vector, otherwise ilike)
 * - category: Filter by category ('all' or specific category)
 * - tag: Filter by tag (can appear multiple times for AND logic)
 * - limit: Maximum number of results (default: 50)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const tags = searchParams.getAll('tag');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build main query
    let query = supabase
      .from('components')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('name', { ascending: true });

    // Full-text search on search_vector (requires 2+ chars)
    if (search && search.length >= 2) {
      // Use textSearch for full-text search with websearch config
      query = query.textSearch('search_vector', search, {
        type: 'websearch',
        config: 'english',
      });
    }

    // Category filter
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Tag filter (AND logic - requires all tags)
    if (tags.length > 0) {
      query = query.contains('tags', tags);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch components' },
        { status: 500 }
      );
    }

    // Transform data to match frontend expectations
    const components = ((data || []) as ComponentRow[]).map((component) => ({
      id: component.id,
      type: component.type,
      name: component.name,
      description: component.description,
      author: component.author,
      icon: component.icon || '📦',
      downloads: component.downloads || 0,
      rating: typeof component.rating === 'number' ? component.rating : parseFloat(component.rating as string) || 0,
      tags: component.tags || [],
      category: component.category || component.type,
      compatibleModels: component.compatible_models || [],
      configSchema: component.config_schema || {},
      githubUrl: component.github_url,
      installCommand: component.install_command,
      npmPackages: component.npm_packages,
      dependencies: component.dependencies,
      credentialsRequired: component.credentials_required,
    }));

    // Fetch metadata for filter UI
    const meta = await fetchMetadata();

    return NextResponse.json({
      components,
      total: count || 0,
      limit,
      offset,
      meta,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Fetch metadata for filter UI:
 * - Unique tags from all active components
 * - Category counts
 */
async function fetchMetadata(): Promise<{
  tags: string[];
  categories: Record<string, number>;
}> {
  try {
    // Get all active components for metadata
    const { data, error } = await supabase
      .from('components')
      .select('tags, category')
      .eq('is_active', true);

    if (error || !data) {
      console.error('Metadata fetch error:', error);
      return { tags: [], categories: {} };
    }

    // Collect unique tags
    const tagSet = new Set<string>();
    (data as Pick<ComponentRow, 'tags' | 'category'>[]).forEach((component) => {
      if (Array.isArray(component.tags)) {
        component.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    const tags = Array.from(tagSet).sort();

    // Count categories
    const categories: Record<string, number> = {};
    (data as Pick<ComponentRow, 'tags' | 'category'>[]).forEach((component) => {
      const cat = component.category || 'unknown';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    return { tags, categories };
  } catch (error) {
    console.error('Metadata error:', error);
    return { tags: [], categories: {} };
  }
}

/**
 * POST /api/components
 *
 * Create a new component (future feature - requires auth)
 */
export async function POST(request: NextRequest) {
  // Future implementation: Allow authenticated users to submit components
  return NextResponse.json(
    { error: 'Component submission not yet available' },
    { status: 501 }
  );
}
