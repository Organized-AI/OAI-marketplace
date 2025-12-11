/**
 * Validate Stack API Route Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Use vi.hoisted to define mocks that are accessible in vi.mock factories
const { mockSupabaseAdmin, mockCreate, MockAPIError } = vi.hoisted(() => {
  // Define APIError class inside hoisted block
  class APIError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.name = 'APIError';
      this.status = status;
    }
  }

  return {
    mockSupabaseAdmin: {
      from: vi.fn(),
    },
    mockCreate: vi.fn(),
    MockAPIError: APIError,
  };
});

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: mockSupabaseAdmin,
}));

vi.mock('@anthropic-ai/sdk', () => {
  // Create MockAnthropic class with static APIError property
  class MockAnthropic {
    messages = {
      create: mockCreate,
    };
    static APIError = MockAPIError;
  }

  return {
    default: MockAnthropic,
    APIError: MockAPIError,
  };
});

// Import after mocking
import { POST } from '@/app/api/validate-stack/route';

describe('POST /api/validate-stack', () => {
  const validStack = {
    name: 'Test Stack',
    description: 'A test stack',
    components: [
      { id: 'test-1', type: 'agent', name: 'Test Agent' },
    ],
  };

  const createRequest = (body: Record<string, unknown>) => {
    return new NextRequest('http://localhost/api/validate-stack', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = 'test-api-key';

    // Default mock for rate limit check (no existing usage)
    mockSupabaseAdmin.from.mockImplementation(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gt: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    }));

    // Default mock for Anthropic response
    mockCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify({
          isValid: true,
          confidence: 0.95,
          complexity: 'standard',
          estimatedTokensPerRun: '2-5K',
          estimatedCostPerRun: '$0.02-0.05',
          estimatedDuration: '1-3 minutes',
          compatibilityIssues: [],
          missingDependencies: [],
          securityConcerns: [],
          recommendations: [],
          workflow: { pattern: 'sequential', phases: [] },
          summary: 'Test summary',
        }),
      }],
    });
  });

  describe('validation', () => {
    it('should reject request without stack', async () => {
      const request = createRequest({ sessionId: 'test-session' });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Missing stack or sessionId');
    });

    it('should reject request without sessionId', async () => {
      const request = createRequest({ stack: validStack });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Missing stack or sessionId');
    });

    it('should reject stack with no components', async () => {
      const request = createRequest({
        stack: { ...validStack, components: [] },
        sessionId: 'test-session',
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Stack must have at least one component');
    });
  });

  describe('rate limiting', () => {
    it('should allow request under daily limit', async () => {
      mockSupabaseAdmin.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gt: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: { validations_count: 1, id: 'usage-1' },
                error: null,
              })),
            })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      }));

      const request = createRequest({
        stack: validStack,
        sessionId: 'test-session',
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should reject when daily limit reached for anonymous user', async () => {
      mockSupabaseAdmin.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gt: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: { validations_count: 3, id: 'usage-1' },
                error: null,
              })),
            })),
          })),
        })),
      }));

      const request = createRequest({
        stack: validStack,
        sessionId: 'test-session',
      });
      const response = await POST(request);

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.error).toBe('Daily limit reached');
      expect(data.message).toContain('3 free validations');
    });

    it('should allow more validations for authenticated users', async () => {
      mockSupabaseAdmin.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gt: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: { validations_count: 5, id: 'usage-1' },
                error: null,
              })),
            })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      }));

      const request = createRequest({
        stack: validStack,
        sessionId: 'test-session',
        userId: 'user-123', // Authenticated user gets 10/day
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should reject authenticated user at 10 validations', async () => {
      mockSupabaseAdmin.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gt: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: { validations_count: 10, id: 'usage-1' },
                error: null,
              })),
            })),
          })),
        })),
      }));

      const request = createRequest({
        stack: validStack,
        sessionId: 'test-session',
        userId: 'user-123',
      });
      const response = await POST(request);

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.message).toContain('10 free validations');
    });

    it('should skip rate limiting with user API key', async () => {
      // Shouldn't even check rate limit
      const selectMock = vi.fn();
      mockSupabaseAdmin.from.mockImplementation(() => ({
        select: selectMock,
      }));

      const request = createRequest({
        stack: validStack,
        sessionId: 'test-session',
        userApiKey: 'sk-ant-user-key',
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.remainingValidations).toBe(-1); // Unlimited
      expect(data.usingUserKey).toBe(true);
    });
  });

  describe('AI analysis', () => {
    it('should return parsed analysis', async () => {
      const request = createRequest({
        stack: validStack,
        sessionId: 'test-session',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.analysis).toMatchObject({
        isValid: true,
        confidence: 0.95,
        complexity: 'standard',
      });
    });

    it('should handle markdown-wrapped JSON response', async () => {
      mockCreate.mockResolvedValue({
        content: [{
          type: 'text',
          text: '```json\n{"isValid": true, "confidence": 0.9, "complexity": "simple", "estimatedTokensPerRun": "1K", "estimatedCostPerRun": "$0.01", "estimatedDuration": "1 min", "compatibilityIssues": [], "missingDependencies": [], "securityConcerns": [], "recommendations": [], "workflow": {"pattern": "sequential", "phases": []}, "summary": "Test"}\n```',
        }],
      });

      const request = createRequest({
        stack: validStack,
        sessionId: 'test-session',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.analysis.isValid).toBe(true);
    });

    it('should handle invalid JSON response', async () => {
      mockCreate.mockResolvedValue({
        content: [{
          type: 'text',
          text: 'This is not JSON',
        }],
      });

      const request = createRequest({
        stack: validStack,
        sessionId: 'test-session',
      });
      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to parse AI analysis response');
    });
  });

  describe('error handling', () => {
    it('should handle missing API key', async () => {
      delete process.env.ANTHROPIC_API_KEY;

      const request = createRequest({
        stack: validStack,
        sessionId: 'test-session',
      });
      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toContain('No API key');
    });

    it('should handle Anthropic API errors', async () => {
      mockCreate.mockRejectedValue(
        new MockAPIError('Invalid API key', 401)
      );

      const request = createRequest({
        stack: validStack,
        sessionId: 'test-session',
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('Invalid API key');
    });

    it('should handle generic errors', async () => {
      mockCreate.mockRejectedValue(new Error('Network error'));

      const request = createRequest({
        stack: validStack,
        sessionId: 'test-session',
      });
      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to validate stack. Please try again.');
    });
  });

  describe('usage tracking', () => {
    it('should increment usage count after successful validation', async () => {
      const updateMock = vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      }));

      mockSupabaseAdmin.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gt: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: { validations_count: 1, id: 'usage-1' },
                error: null,
              })),
            })),
          })),
        })),
        update: updateMock,
      }));

      const request = createRequest({
        stack: validStack,
        sessionId: 'test-session',
      });
      await POST(request);

      expect(updateMock).toHaveBeenCalled();
    });

    it('should create new usage record for first validation', async () => {
      const insertMock = vi.fn(() => Promise.resolve({ error: null }));

      mockSupabaseAdmin.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gt: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: null, // No existing record
                error: null,
              })),
            })),
          })),
        })),
        insert: insertMock,
      }));

      const request = createRequest({
        stack: validStack,
        sessionId: 'new-session',
      });
      await POST(request);

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          session_id: 'new-session',
          validations_count: 1,
        })
      );
    });
  });
});
