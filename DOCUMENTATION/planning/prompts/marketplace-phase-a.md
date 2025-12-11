# Marketplace MVP - Phase A: Real AI Validation

## Objective
Replace the fake AI analysis with real Anthropic API calls. Add Supabase for component storage and rate limiting.

## Context
The Stack Builder UI exists and works. The "AI Analysis" button currently runs a setTimeout and returns heuristic data. We need to make it call the real Anthropic API.

## Files to Modify
- `components/stack-builder/AIAnalysisModal.tsx` - Update to call API
- `lib/services/stack-analyzer.ts` - Keep for fallback/local analysis

## Files to Create
- `app/api/validate-stack/route.ts` - API endpoint
- `app/api/components/route.ts` - Components from Supabase
- `lib/supabase.ts` - Supabase client
- `hooks/useSessionId.ts` - Session tracking for rate limits
- `supabase/migrations/001_marketplace.sql` - Database schema

## Tasks

### Task 1: Environment Setup
Create `.env.local` with:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-api-key
```

### Task 2: Supabase Client
Create `lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### Task 3: Database Migration
Create `supabase/migrations/001_marketplace.sql`:
```sql
-- Component Registry
CREATE TABLE components (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('agent', 'subagent', 'skill', 'mcp', 'command', 'hook', 'setting')),
  name TEXT NOT NULL,
  description TEXT,
  author TEXT NOT NULL,
  repository TEXT,
  icon TEXT,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  tags TEXT[],
  compatible_models TEXT[],
  dependencies JSONB DEFAULT '{}',
  credentials_required TEXT[],
  github_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Validation Usage (rate limiting)
CREATE TABLE validation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  ip_address INET,
  validations_count INTEGER DEFAULT 0,
  reset_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_components_type ON components(type);
CREATE INDEX idx_validation_session ON validation_usage(session_id);

-- RLS
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Components public read" ON components FOR SELECT USING (true);
CREATE POLICY "Validation open" ON validation_usage FOR ALL USING (true);
```

### Task 4: Session Hook
Create `hooks/useSessionId.ts`:
```typescript
'use client';
import { useState, useEffect } from 'react';

export function useSessionId(): string {
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    let id = localStorage.getItem('organized-session-id');
    if (!id) {
      id = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('organized-session-id', id);
    }
    setSessionId(id);
  }, []);

  return sessionId;
}
```

### Task 5: Validation API Route
Create `app/api/validate-stack/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '@/lib/supabase';

const DAILY_LIMIT = 3;

export async function POST(request: NextRequest) {
  const { stack, sessionId, userApiKey } = await request.json();
  
  if (!stack || !sessionId) {
    return NextResponse.json({ error: 'Missing stack or sessionId' }, { status: 400 });
  }

  // Rate limit check for free tier
  if (!userApiKey) {
    const { data } = await supabaseAdmin
      .from('validation_usage')
      .select('validations_count')
      .eq('session_id', sessionId)
      .gt('reset_at', new Date().toISOString())
      .single();
    
    if (data && data.validations_count >= DAILY_LIMIT) {
      return NextResponse.json({ 
        error: 'Daily limit reached', 
        message: 'Add your API key for unlimited validations.',
        remainingValidations: 0 
      }, { status: 429 });
    }
  }

  try {
    const anthropic = new Anthropic({
      apiKey: userApiKey || process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Analyze this Claude Code stack and return ONLY valid JSON:

${JSON.stringify(stack, null, 2)}

Return:
{
  "isValid": boolean,
  "confidence": number,
  "complexity": "simple"|"standard"|"complex"|"enterprise",
  "estimatedTokensPerRun": "X-YK",
  "estimatedCostPerRun": "$X.XX",
  "estimatedDuration": "X-Y minutes",
  "compatibilityIssues": [],
  "missingDependencies": [],
  "securityConcerns": [],
  "recommendations": [{"type":"optimization","title":"","description":"","impact":"high"}],
  "workflow": {"pattern":"sequential","phases":[{"number":1,"name":"","components":[],"description":""}]},
  "summary": "paragraph"
}`
      }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(clean);

    // Increment usage
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
          .insert({ session_id: sessionId, validations_count: 1 });
      }
    }

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}
```

### Task 6: Update AI Analysis Modal
In `components/stack-builder/AIAnalysisModal.tsx`, replace the useEffect that calls StackAnalyzer with an API call:

```typescript
// Add at top of component
const sessionId = useSessionId();
const [error, setError] = useState<string | null>(null);

// Replace the useEffect
useEffect(() => {
  if (!isOpen || nodes.length === 0 || !sessionId) return;
  
  setIsAnalyzing(true);
  setError(null);

  fetch('/api/validate-stack', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stack: {
        name: stackName,
        description: stackDescription,
        components: nodes.map(n => ({
          id: n.id,
          type: n.data.type,
          name: n.data.name,
        }))
      },
      sessionId
    })
  })
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      setError(data.message || data.error);
    } else {
      setAnalysis({
        overview: {
          name: stackName,
          complexity: data.analysis.complexity,
          estimatedDuration: data.analysis.estimatedDuration,
          estimatedTokens: data.analysis.estimatedTokensPerRun,
          estimatedCost: data.analysis.estimatedCostPerRun,
        },
        workflow: data.analysis.workflow,
        recommendations: data.analysis.recommendations,
        // ... map other fields
      });
    }
    setIsAnalyzing(false);
  })
  .catch(() => {
    setError('Failed to analyze stack');
    setIsAnalyzing(false);
  });
}, [isOpen, nodes, sessionId, stackName, stackDescription]);
```

### Task 7: Seed Data
Create `supabase/seed.sql` with component data from `lib/data/marketplace-components.ts`.

## Verification
1. `supabase db push` - Apply migrations
2. `pnpm dev` - Start server
3. Go to `/builder`, add components, click Analyze
4. See REAL AI response (not fake setTimeout)
5. Try 4 times - 4th should show rate limit error

## Success Criteria
- [ ] AI Analysis calls real Anthropic API
- [ ] Response includes real recommendations
- [ ] Rate limiting works (3/day free)
- [ ] Error handling shows helpful messages
