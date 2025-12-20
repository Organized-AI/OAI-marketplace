import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * POST /api/templates/save
 *
 * Save a user-created stack template.
 * Requires authentication.
 *
 * Body:
 * - name: string (required)
 * - description: string
 * - components: any[] (required)
 * - tags: string[]
 * - isPublic: boolean
 */
export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with cookies for auth
    const cookieStore = await cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            cookie: cookieStore.toString(),
          },
        },
      }
    );

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to save templates.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, description, components, tags, isPublic } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      );
    }

    if (!components || !Array.isArray(components) || components.length === 0) {
      return NextResponse.json(
        { error: 'At least one component is required' },
        { status: 400 }
      );
    }

    // Extract author name from email
    const authorName = user.email?.split('@')[0] || 'Unknown User';

    // Parse tags from comma-separated string or array
    let parsedTags: string[] = [];
    if (typeof tags === 'string') {
      parsedTags = tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);
    } else if (Array.isArray(tags)) {
      parsedTags = tags.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0);
    }

    // Insert template
    const { data, error } = await supabase
      .from('stack_templates')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        author_id: user.id,
        author_name: authorName,
        components: components,
        tags: parsedTags,
        is_public: isPublic !== false, // Default to public
        is_featured: false, // User templates are not featured by default
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      template: data,
      message: 'Template saved successfully',
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
