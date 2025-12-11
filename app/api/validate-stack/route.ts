import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '@/lib/supabase';

const DAILY_LIMIT = 3;

interface StackComponent {
  id: string;
  type: string;
  name: string;
  description?: string;
  config?: Record<string, unknown>;
}

interface StackPayload {
  name: string;
  description?: string;
  components: StackComponent[];
}

interface ValidationRequest {
  stack: StackPayload;
  sessionId: string;
  userApiKey?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidationRequest = await request.json();
    const { stack, sessionId, userApiKey } = body;

    // Validate required fields
    if (!stack || !sessionId) {
      return NextResponse.json(
        { error: 'Missing stack or sessionId' },
        { status: 400 }
      );
    }

    if (!stack.components || stack.components.length === 0) {
      return NextResponse.json(
        { error: 'Stack must have at least one component' },
        { status: 400 }
      );
    }

    // Rate limit check for free tier (skip if user provides their own API key)
    if (!userApiKey) {
      const { data: usageData } = await supabaseAdmin
        .from('validation_usage')
        .select('validations_count, id')
        .eq('session_id', sessionId)
        .gt('reset_at', new Date().toISOString())
        .single();

      if (usageData && usageData.validations_count >= DAILY_LIMIT) {
        return NextResponse.json(
          {
            error: 'Daily limit reached',
            message: 'You\'ve used all 3 free validations today. Add your own Anthropic API key for unlimited validations.',
            remainingValidations: 0,
          },
          { status: 429 }
        );
      }
    }

    // Determine which API key to use
    const apiKey = userApiKey || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No API key configured. Please add your Anthropic API key.' },
        { status: 500 }
      );
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey,
    });

    // Build the analysis prompt
    const analysisPrompt = `Analyze this Claude Code component stack and return ONLY valid JSON (no markdown, no code blocks, just raw JSON):

Stack Name: ${stack.name || 'Unnamed Stack'}
Description: ${stack.description || 'No description provided'}

Components:
${JSON.stringify(stack.components, null, 2)}

Analyze the stack for:
1. Component compatibility and integration
2. Potential workflow patterns
3. Token/cost estimates
4. Security considerations
5. Optimization recommendations

Return this exact JSON structure:
{
  "isValid": true,
  "confidence": 0.95,
  "complexity": "standard",
  "estimatedTokensPerRun": "2-5K",
  "estimatedCostPerRun": "$0.02-0.05",
  "estimatedDuration": "1-3 minutes",
  "compatibilityIssues": [],
  "missingDependencies": [],
  "securityConcerns": [],
  "recommendations": [
    {
      "type": "optimization",
      "title": "Short title",
      "description": "Detailed recommendation",
      "impact": "high"
    }
  ],
  "workflow": {
    "pattern": "sequential",
    "phases": [
      {
        "number": 1,
        "name": "Phase name",
        "components": ["component-id"],
        "description": "What happens in this phase"
      }
    ]
  },
  "summary": "A paragraph summarizing the stack analysis"
}

Valid complexity values: "simple", "standard", "complex", "enterprise"
Valid impact values: "high", "medium", "low"
Valid pattern values: "sequential", "parallel", "hybrid"`;

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
    });

    // Extract text response
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    // Parse JSON from response (handle potential markdown wrapping)
    let analysisText = textContent.text.trim();

    // Remove markdown code blocks if present
    analysisText = analysisText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch {
      console.error('Failed to parse AI response:', analysisText);
      return NextResponse.json(
        { error: 'Failed to parse AI analysis response' },
        { status: 500 }
      );
    }

    // Increment usage count for free tier
    if (!userApiKey) {
      const { data: existing } = await supabaseAdmin
        .from('validation_usage')
        .select('*')
        .eq('session_id', sessionId)
        .gt('reset_at', new Date().toISOString())
        .single();

      if (existing) {
        await supabaseAdmin
          .from('validation_usage')
          .update({ validations_count: existing.validations_count + 1 })
          .eq('id', existing.id);
      } else {
        await supabaseAdmin
          .from('validation_usage')
          .insert({
            session_id: sessionId,
            validations_count: 1,
            ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || null,
          });
      }
    }

    // Calculate remaining validations
    let remainingValidations = DAILY_LIMIT;
    if (!userApiKey) {
      const { data: currentUsage } = await supabaseAdmin
        .from('validation_usage')
        .select('validations_count')
        .eq('session_id', sessionId)
        .gt('reset_at', new Date().toISOString())
        .single();

      if (currentUsage) {
        remainingValidations = Math.max(0, DAILY_LIMIT - currentUsage.validations_count);
      }
    } else {
      remainingValidations = -1; // Unlimited
    }

    return NextResponse.json({
      success: true,
      analysis,
      remainingValidations,
      usingUserKey: !!userApiKey,
    });
  } catch (error) {
    console.error('Validation error:', error);

    // Handle specific Anthropic errors
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your Anthropic API key.' },
          { status: 401 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'API rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to validate stack. Please try again.' },
      { status: 500 }
    );
  }
}
