/**
 * System Tool Detector
 *
 * Detects missing system tools and runtime versions.
 */

import { execSync } from 'child_process';
import type { Dependency } from '../types.js';

interface ToolConfig {
  command: string;
  versionArg?: string;
  installUrl?: string;
  installCmd?: string;
}

export class SystemDetector {
  /**
   * Known system tools and how to check them
   */
  private tools: Record<string, ToolConfig> = {
    git: {
      command: 'git',
      versionArg: '--version',
      installUrl: 'https://git-scm.com/downloads',
    },
    node: {
      command: 'node',
      versionArg: '--version',
      installUrl: 'https://nodejs.org/',
    },
    npm: {
      command: 'npm',
      versionArg: '--version',
      installCmd: 'Comes with Node.js',
    },
    pnpm: {
      command: 'pnpm',
      versionArg: '--version',
      installCmd: 'npm install -g pnpm',
    },
    yarn: {
      command: 'yarn',
      versionArg: '--version',
      installCmd: 'npm install -g yarn',
    },
    docker: {
      command: 'docker',
      versionArg: '--version',
      installUrl: 'https://docs.docker.com/get-docker/',
    },
    supabase: {
      command: 'supabase',
      versionArg: '--version',
      installCmd: 'npm install -g supabase',
    },
    claude: {
      command: 'claude',
      versionArg: '--version',
      installCmd: 'npm install -g @anthropic-ai/claude-code',
    },
  };

  /**
   * Detect system tool dependencies
   */
  detect(toolNames: string[]): Dependency[] {
    return toolNames.map((toolName) => {
      const config = this.tools[toolName] || {
        command: toolName,
        versionArg: '--version',
      };

      try {
        const output = execSync(
          `${config.command} ${config.versionArg || '--version'}`,
          {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
            timeout: 5000,
          }
        );

        // Extract version number from output
        const version = this.extractVersion(output);

        return {
          type: 'system' as const,
          name: toolName,
          required: true,
          status: 'present' as const,
          currentValue: version,
        };
      } catch {
        const suggestion = config.installCmd
          ? `Install with: ${config.installCmd}`
          : config.installUrl
          ? `Download from: ${config.installUrl}`
          : `Install ${toolName} and ensure it's in your PATH`;

        return {
          type: 'system' as const,
          name: toolName,
          required: true,
          status: 'missing' as const,
          suggestion,
        };
      }
    });
  }

  /**
   * Extract version number from command output
   */
  private extractVersion(output: string): string {
    // Try to find a semver-like version
    const match = output.match(/v?(\d+\.\d+\.\d+)/);
    if (match) return match[1];

    // Fallback: first line, truncated
    return output.trim().split('\n')[0].slice(0, 30);
  }

  /**
   * Check Node.js version requirement
   */
  checkNodeVersion(requiredVersion: string): Dependency {
    const currentVersion = process.version.replace('v', '');
    const required = requiredVersion.replace(/^[>=<^~]+/, '');

    const currentMajor = parseInt(currentVersion.split('.')[0], 10);
    const requiredMajor = parseInt(required.split('.')[0], 10);

    if (currentMajor < requiredMajor) {
      return {
        type: 'runtime' as const,
        name: 'node',
        required: true,
        status: 'outdated' as const,
        currentValue: currentVersion,
        requiredValue: required,
        suggestion: `Node.js ${required}+ required. Visit https://nodejs.org/`,
      };
    }

    return {
      type: 'runtime' as const,
      name: 'node',
      required: true,
      status: 'present' as const,
      currentValue: currentVersion,
    };
  }
}
