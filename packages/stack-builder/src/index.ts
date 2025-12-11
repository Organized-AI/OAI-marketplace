/**
 * @organized-ai/stack-builder
 *
 * CLI tool for installing Claude Code components.
 *
 * @example
 * ```typescript
 * import { StackBuilder } from '@organized-ai/stack-builder';
 *
 * const builder = new StackBuilder();
 *
 * const results = await builder.install([
 *   {
 *     id: 'code-reviewer',
 *     name: 'Code Reviewer',
 *     type: 'skill',
 *     repository: 'https://github.com/organized-ai/code-reviewer',
 *     version: '1.0.0',
 *   },
 * ]);
 *
 * console.log(`Installed ${results.filter(r => r.success).length} components`);
 * ```
 */

import { Phase0 } from '@organized-ai/phase-0';
import { Installer } from './installer.js';
import { ConfigMerger } from './config-merger.js';
import type {
  Component,
  InstallResult,
  InstallOptions,
  InstallProgress,
  Stack,
  PreInstallCheck,
} from './types.js';

export class StackBuilder {
  private phase0: Phase0;
  private installer: Installer;
  private configMerger: ConfigMerger;

  constructor(basePath = process.cwd()) {
    this.phase0 = new Phase0();
    this.installer = new Installer(basePath);
    this.configMerger = new ConfigMerger(basePath);
  }

  /**
   * Install multiple components
   */
  async install(
    components: Component[],
    options: InstallOptions = {}
  ): Promise<InstallResult[]> {
    const results: InstallResult[] = [];
    const progress: InstallProgress = {
      total: components.length,
      completed: 0,
      results: [],
    };

    for (const component of components) {
      progress.current = component.name;
      options.onProgress?.(progress);

      // Run pre-install checks unless skipped
      if (!options.skipDependencyCheck) {
        const check = await this.preInstallCheck(component);
        if (!check.canInstall) {
          results.push({
            success: false,
            component: component.id,
            duration: 0,
            error: `Missing dependencies: ${check.missingDependencies.join(', ')}`,
          });
          progress.completed++;
          progress.results = results;
          options.onProgress?.(progress);
          continue;
        }
      }

      // Install component
      const result = options.force
        ? await this.installer.reinstall(component)
        : await this.installer.install(component);

      results.push(result);
      progress.completed++;
      progress.results = results;
      options.onProgress?.(progress);
    }

    return results;
  }

  /**
   * Install a complete stack
   */
  async installStack(
    stack: Stack,
    options: InstallOptions = {}
  ): Promise<InstallResult[]> {
    // Install all components
    const results = await this.install(stack.components, options);

    // Merge stack settings if provided
    if (stack.settings && Object.keys(stack.settings).length > 0) {
      await this.configMerger.mergeSettings(stack.settings);
    }

    return results;
  }

  /**
   * Check if a component can be installed
   */
  async preInstallCheck(component: Component): Promise<PreInstallCheck> {
    const missingDependencies: string[] = [];
    const suggestions: string[] = [];

    // Check dependencies using Phase0
    const detectionResult = await this.phase0.detect({
      name: component.id,
      version: component.version,
      dependencies: component.dependencies,
    });

    if (!detectionResult.allSatisfied) {
      for (const dep of detectionResult.missingRequired) {
        missingDependencies.push(`${dep.type}:${dep.name}`);
        if (dep.suggestion) {
          suggestions.push(dep.suggestion);
        }
      }
    }

    return {
      canInstall: missingDependencies.length === 0,
      missingDependencies,
      suggestions,
    };
  }

  /**
   * Uninstall components
   */
  async uninstall(components: Component[]): Promise<InstallResult[]> {
    const results: InstallResult[] = [];

    for (const component of components) {
      const result = await this.installer.uninstall(component);
      results.push(result);
    }

    return results;
  }

  /**
   * Check which components are installed
   */
  checkInstalled(components: Component[]): Map<string, boolean> {
    const status = new Map<string, boolean>();

    for (const component of components) {
      status.set(component.id, this.installer.isInstalled(component));
    }

    return status;
  }

  /**
   * Get the installer instance for direct access
   */
  getInstaller(): Installer {
    return this.installer;
  }

  /**
   * Get the config merger instance for direct access
   */
  getConfigMerger(): ConfigMerger {
    return this.configMerger;
  }

  /**
   * Get the Phase0 instance for dependency checking
   */
  getPhase0(): Phase0 {
    return this.phase0;
  }
}

// Export all types and classes
export * from './types.js';
export { Installer } from './installer.js';
export { ConfigMerger } from './config-merger.js';
