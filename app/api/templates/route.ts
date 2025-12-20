import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/templates
 *
 * Fetch stack templates from Supabase with optional filtering.
 * Query params:
 * - featured: boolean - filter to featured only
 * - search: string - search name and description
 * - tag: string - filter by tag
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');

    let query = supabase
      .from('stack_templates')
      .select('*')
      .eq('is_public', true)
      .order('use_count', { ascending: false });

    // Filter to featured only
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    // Search in name and description
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    // Filter by tag
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      templates: data || [],
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
 * POST /api/templates
 *
 * Track template usage by incrementing use_count.
 * Body: { templateId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId } = body;

    if (!templateId) {
      return NextResponse.json(
        { error: 'templateId is required' },
        { status: 400 }
      );
    }

    // Call the RPC function to increment use count
    const { error } = await supabase.rpc('increment_template_use', {
      template_id: templateId,
    });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to track template usage' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
