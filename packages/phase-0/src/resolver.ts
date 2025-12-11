/**
 * Dependency Resolver
 *
 * Creates resolution plans for missing dependencies.
 */

import type { Dependency, ResolutionAction, ResolutionPlan } from './types.js';

export class Resolver {
  /**
   * Create a resolution plan for missing dependencies
   */
  createPlan(component: string, missingDeps: Dependency[]): ResolutionPlan {
    const actions: ResolutionAction[] = missingDeps.map((dep) => {
      return this.createAction(dep);
    });

    const autoSteps = actions.filter((a) => a.action === 'install' && a.command);
    const manualSteps = actions.filter((a) => a.action !== 'install' || !a.command);

    return {
      component,
      actions,
      canAutoResolve: manualSteps.length === 0,
      autoSteps,
      manualSteps,
    };
  }

  /**
   * Create a resolution action for a single dependency
   */
  private createAction(dep: Dependency): ResolutionAction {
    switch (dep.type) {
      case 'npm':
        return {
          dependency: dep,
          action: 'install',
          command: dep.requiredValue
            ? `npm install ${dep.name}@${dep.requiredValue}`
            : `npm install ${dep.name}`,
          instructions: [
            `Install ${dep.name} using npm`,
            dep.requiredValue ? `Required version: ${dep.requiredValue}` : '',
          ].filter(Boolean),
        };

      case 'system':
        return {
          dependency: dep,
          action: 'manual',
          instructions: [
            `Install ${dep.name} on your system`,
            dep.suggestion || '',
          ].filter(Boolean),
          url: this.getInstallUrl(dep.name),
        };

      case 'env':
      case 'credential':
        return {
          dependency: dep,
          action: 'configure',
          instructions: [
            `Set the ${dep.name} environment variable`,
            dep.suggestion || '',
          ].filter(Boolean),
          url: this.getSetupUrl(dep.name),
        };

      case 'runtime':
        return {
          dependency: dep,
          action: 'manual',
          instructions: [
            `Update ${dep.name} to version ${dep.requiredValue || 'latest'}`,
            `Current version: ${dep.currentValue || 'unknown'}`,
          ],
          url: 'https://nodejs.org/',
        };

      default:
        return {
          dependency: dep,
          action: 'manual',
          instructions: [dep.suggestion || `Resolve ${dep.name}`],
        };
    }
  }

  /**
   * Get installation URL for system tools
   */
  private getInstallUrl(name: string): string | undefined {
    const urls: Record<string, string> = {
      git: 'https://git-scm.com/downloads',
      node: 'https://nodejs.org/',
      docker: 'https://docs.docker.com/get-docker/',
      supabase: 'https://supabase.com/docs/guides/cli',
    };
    return urls[name];
  }

  /**
   * Get setup URL for credentials
   */
  private getSetupUrl(name: string): string | undefined {
    const urls: Record<string, string> = {
      ANTHROPIC_API_KEY: 'https://console.anthropic.com/settings/keys',
      OPENAI_API_KEY: 'https://platform.openai.com/api-keys',
      GITHUB_TOKEN: 'https://github.com/settings/tokens',
      SUPABASE_URL: 'https://supabase.com/dashboard',
      SUPABASE_ANON_KEY: 'https://supabase.com/dashboard',
    };
    return urls[name];
  }

  /**
   * Generate shell commands to auto-install dependencies
   */
  generateInstallScript(plan: ResolutionPlan): string {
    const commands: string[] = [
      '#!/bin/bash',
      `# Auto-generated installation script for ${plan.component}`,
      '',
    ];

    for (const step of plan.autoSteps) {
      if (step.command) {
        commands.push(`echo "Installing ${step.dependency.name}..."`);
        commands.push(step.command);
        commands.push('');
      }
    }

    if (plan.manualSteps.length > 0) {
      commands.push('# Manual steps required:');
      for (const step of plan.manualSteps) {
        commands.push(`# - ${step.instructions?.join(' ') || step.dependency.name}`);
      }
    }

    return commands.join('\n');
  }
}
