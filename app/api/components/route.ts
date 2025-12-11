import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/components
 *
 * Fetch components from Supabase with optional filtering.
 * Query params:
 * - type: Filter by component type (agent, mcp, command, hook, skill, setting)
 * - search: Search in name, description, and tags
 * - limit: Maximum number of results (default: 50)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabase
      .from('components')
      .select('*', { count: 'exact' })
      .order('downloads', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by type
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    // Search filter
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch components' },
        { status: 500 }
      );
    }

    // Transform data to match frontend expectations
    const components = (data || []).map((component) => ({
      id: component.id,
      type: component.type,
      name: component.name,
      description: component.description,
      author: component.author,
      icon: component.icon || '📦',
      downloads: component.downloads || 0,
      rating: parseFloat(component.rating) || 0,
      tags: component.tags || [],
      compatibleModels: component.compatible_models || [],
      configSchema: component.config_schema || {},
      githubUrl: component.github_url,
      installCommand: component.install_command,
      npmPackages: component.npm_packages,
      dependencies: component.dependencies,
      credentialsRequired: component.credentials_required,
    }));

    return NextResponse.json({
      components,
      total: count || 0,
      limit,
      offset,
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
