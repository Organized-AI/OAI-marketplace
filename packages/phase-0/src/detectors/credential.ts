/**
 * Credential Detector
 *
 * Detects credentials that need to be configured via Organized Credentials.
 */

import type { Dependency } from '../types.js';

interface CredentialRequirement {
  serviceId: string;
  envVar: string;
  required?: boolean;
  description?: string;
}

export class CredentialDetector {
  /**
   * Detect credential dependencies
   * This checks environment variables but links to the credential manager
   */
  detect(requirements: CredentialRequirement[]): Dependency[] {
    return requirements.map((req) => {
      const value = process.env[req.envVar];
      const required = req.required ?? true;

      if (!value) {
        return {
          type: 'credential' as const,
          name: req.envVar,
          required,
          status: 'missing' as const,
          suggestion: `Configure ${req.serviceId} credentials in Organized Credentials`,
        };
      }

      return {
        type: 'credential' as const,
        name: req.envVar,
        required,
        status: 'present' as const,
        currentValue: '[CONFIGURED]',
      };
    });
  }

  /**
   * Get common credential requirements for services
   */
  static getCommonRequirements(): Record<string, CredentialRequirement[]> {
    return {
      anthropic: [
        {
          serviceId: 'anthropic',
          envVar: 'ANTHROPIC_API_KEY',
          required: true,
          description: 'Anthropic API key for Claude',
        },
      ],
      github: [
        {
          serviceId: 'github',
          envVar: 'GITHUB_TOKEN',
          required: true,
          description: 'GitHub personal access token',
        },
      ],
      supabase: [
        {
          serviceId: 'supabase',
          envVar: 'SUPABASE_URL',
          required: true,
          description: 'Supabase project URL',
        },
        {
          serviceId: 'supabase',
          envVar: 'SUPABASE_ANON_KEY',
          required: true,
          description: 'Supabase anon key',
        },
      ],
      openai: [
        {
          serviceId: 'openai',
          envVar: 'OPENAI_API_KEY',
          required: true,
          description: 'OpenAI API key',
        },
      ],
    };
  }
}
