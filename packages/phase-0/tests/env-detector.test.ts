/**
 * Environment Detector Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnvDetector } from '../src/detectors/env';

describe('EnvDetector', () => {
  let detector: EnvDetector;
  const originalEnv = process.env;

  beforeEach(() => {
    detector = new EnvDetector();
    // Create a shallow copy to avoid mutating original
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('detect', () => {
    it('should detect present environment variables', () => {
      process.env.TEST_VAR = 'test-value';

      const result = detector.detect({
        TEST_VAR: { required: true },
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'env',
        name: 'TEST_VAR',
        required: true,
        status: 'present',
      });
    });

    it('should detect missing environment variables', () => {
      delete process.env.MISSING_VAR;

      const result = detector.detect({
        MISSING_VAR: { required: true },
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'env',
        name: 'MISSING_VAR',
        required: true,
        status: 'missing',
      });
    });

    it('should handle optional variables', () => {
      delete process.env.OPTIONAL_VAR;

      const result = detector.detect({
        OPTIONAL_VAR: { required: false },
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'env',
        name: 'OPTIONAL_VAR',
        required: false,
        status: 'missing',
      });
    });

    it('should default to required: true', () => {
      delete process.env.DEFAULT_VAR;

      const result = detector.detect({
        DEFAULT_VAR: {},
      });

      expect(result[0].required).toBe(true);
    });

    it('should validate patterns', () => {
      process.env.PATTERNED_VAR = 'invalid-format';

      const result = detector.detect({
        PATTERNED_VAR: {
          required: true,
          pattern: '^valid-[0-9]+$',
        },
      });

      expect(result[0]).toMatchObject({
        type: 'env',
        name: 'PATTERNED_VAR',
        status: 'invalid',
        error: 'Value does not match expected format',
      });
    });

    it('should pass valid patterns', () => {
      process.env.PATTERNED_VAR = 'valid-123';

      const result = detector.detect({
        PATTERNED_VAR: {
          required: true,
          pattern: '^valid-[0-9]+$',
        },
      });

      expect(result[0]).toMatchObject({
        status: 'present',
      });
    });

    it('should redact sensitive values', () => {
      process.env.SECRET_KEY = 'super-secret-value';

      const result = detector.detect({
        SECRET_KEY: { sensitive: true },
      });

      expect(result[0].currentValue).toBe('[SET]');
    });

    it('should truncate non-sensitive values', () => {
      process.env.PUBLIC_VAR = 'this-is-a-long-value-that-should-be-truncated';

      const result = detector.detect({
        PUBLIC_VAR: { sensitive: false },
      });

      expect(result[0].currentValue).toBe('this-is-a-...');
    });

    it('should include setup URL in suggestion', () => {
      delete process.env.API_KEY;

      const result = detector.detect({
        API_KEY: {
          required: true,
          setupUrl: 'https://example.com/api-keys',
        },
      });

      expect(result[0].suggestion).toBe('Get key from: https://example.com/api-keys');
    });

    it('should handle multiple requirements', () => {
      process.env.VAR_ONE = 'value1';
      delete process.env.VAR_TWO;
      process.env.VAR_THREE = 'invalid';

      const result = detector.detect({
        VAR_ONE: {},
        VAR_TWO: { required: true },
        VAR_THREE: { pattern: '^valid$' },
      });

      expect(result).toHaveLength(3);
      expect(result[0].status).toBe('present');
      expect(result[1].status).toBe('missing');
      expect(result[2].status).toBe('invalid');
    });

    it('should handle empty requirements', () => {
      const result = detector.detect({});
      expect(result).toHaveLength(0);
    });
  });

  describe('getPatterns', () => {
    it('should return common API key patterns', () => {
      const patterns = EnvDetector.getPatterns();

      expect(patterns).toHaveProperty('ANTHROPIC_API_KEY');
      expect(patterns).toHaveProperty('OPENAI_API_KEY');
      expect(patterns).toHaveProperty('GITHUB_TOKEN');
      expect(patterns).toHaveProperty('SUPABASE_URL');
      expect(patterns).toHaveProperty('SUPABASE_ANON_KEY');
    });

    it('should have valid regex patterns', () => {
      const patterns = EnvDetector.getPatterns();

      Object.values(patterns).forEach((pattern) => {
        expect(() => new RegExp(pattern)).not.toThrow();
      });
    });

    it('should match valid Anthropic API key format', () => {
      const pattern = new RegExp(EnvDetector.getPatterns().ANTHROPIC_API_KEY);
      expect(pattern.test('sk-ant-api03-validkeyhere123')).toBe(true);
      expect(pattern.test('invalid-key')).toBe(false);
    });

    it('should match valid GitHub token format', () => {
      const pattern = new RegExp(EnvDetector.getPatterns().GITHUB_TOKEN);
      expect(pattern.test('ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')).toBe(true);
      expect(pattern.test('github_pat_xxxxxxxxxx')).toBe(true);
      expect(pattern.test('invalid-token')).toBe(false);
    });
  });
});
