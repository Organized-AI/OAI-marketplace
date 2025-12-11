/**
 * Environment Variable Detector
 *
 * Detects missing or invalid environment variables.
 */

import type { Dependency, EnvRequirement } from '../types.js';

export class EnvDetector {
  /**
   * Detect environment variable dependencies
   */
  detect(requirements: Record<string, EnvRequirement>): Dependency[] {
    return Object.entries(requirements).map(([name, config]) => {
      const value = process.env[name];
      const required = config.required ?? true;

      // Check if variable exists
      if (!value) {
        return {
          type: 'env' as const,
          name,
          required,
          status: 'missing' as const,
          suggestion: config.setupUrl
            ? `Get key from: ${config.setupUrl}`
            : `Set ${name} in your environment`,
        };
      }

      // Check pattern if specified
      if (config.pattern && !new RegExp(config.pattern).test(value)) {
        return {
          type: 'env' as const,
          name,
          required,
          status: 'invalid' as const,
          currentValue: config.sensitive ? '[REDACTED]' : value.slice(0, 10) + '...',
          error: 'Value does not match expected format',
        };
      }

      return {
        type: 'env' as const,
        name,
        required,
        status: 'present' as const,
        currentValue: config.sensitive ? '[SET]' : value.slice(0, 10) + '...',
      };
    });
  }

  /**
   * Get common environment variable patterns
   */
  static getPatterns(): Record<string, string> {
    return {
      ANTHROPIC_API_KEY: '^sk-ant-api\\d{2}-[a-zA-Z0-9_-]+$',
      OPENAI_API_KEY: '^sk-[a-zA-Z0-9]+$',
      GITHUB_TOKEN: '^(ghp_|github_pat_)[a-zA-Z0-9]+$',
      SUPABASE_URL: '^https://[a-z0-9]+\\.supabase\\.co$',
      SUPABASE_ANON_KEY: '^eyJ[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+$',
    };
  }
}
