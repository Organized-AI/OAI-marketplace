/**
 * @organized-ai/phase-0
 *
 * Dependency detection and resolution for Organized AI components.
 *
 * Phase 0 runs before component installation to ensure all requirements
 * are met (environment variables, npm packages, system tools).
 *
 * @example
 * ```typescript
 * import { Phase0 } from '@organized-ai/phase-0';
 *
 * const phase0 = new Phase0();
 *
 * const result = await phase0.detect({
 *   name: 'my-component',
 *   version: '1.0.0',
 *   dependencies: {
 *     env: {
 *       ANTHROPIC_API_KEY: { required: true },
 *     },
 *     npm: {
 *       'typescript': '^5.0.0',
 *     },
 *     system: ['git', 'node'],
 *   },
 * });
 *
 * if (!result.allSatisfied) {
 *   const plan = phase0.getResolutionPlan(result);
 *   console.log('Missing dependencies:', plan.actions);
 * }
 * ```
 */

import type { ComponentManifest, DetectionResult, ResolutionPlan } from './types.js';
import { EnvDetector } from './detectors/env.js';
import { NpmDetector } from './detectors/npm.js';
import { SystemDetector } from './detectors/system.js';
import { CredentialDetector } from './detectors/credential.js';
import { Resolver } from './resolver.js';

export class Phase0 {
  private envDetector = new EnvDetector();
  private npmDetector = new NpmDetector();
  private systemDetector = new SystemDetector();
  private credentialDetector = new CredentialDetector();
  private resolver = new Resolver();

  /**
   * Detect all dependencies for a component
   */
  async detect(manifest: ComponentManifest): Promise<DetectionResult> {
    const dependencies = [];

    // Detect environment variables
    if (manifest.dependencies?.env) {
      dependencies.push(...this.envDetector.detect(manifest.dependencies.env));
    }

    // Detect npm packages
    if (manifest.dependencies?.npm) {
      dependencies.push(...this.npmDetector.detect(manifest.dependencies.npm));
    }

    // Detect system tools
    if (manifest.dependencies?.system) {
      dependencies.push(...this.systemDetector.detect(manifest.dependencies.system));
    }

    // Detect runtime requirements
    if (manifest.dependencies?.runtime?.node) {
      dependencies.push(
        this.systemDetector.checkNodeVersion(manifest.dependencies.runtime.node)
      );
    }

    // Find missing required dependencies
    const missingRequired = dependencies.filter(
      (d) => d.required && d.status !== 'present'
    );

    return {
      component: manifest.name,
      dependencies,
      allSatisfied: missingRequired.length === 0,
      missingRequired,
      timestamp: new Date(),
    };
  }

  /**
   * Get a resolution plan for missing dependencies
   */
  getResolutionPlan(result: DetectionResult): ResolutionPlan {
    return this.resolver.createPlan(result.component, result.missingRequired);
  }

  /**
   * Generate an installation script for auto-resolvable dependencies
   */
  generateInstallScript(result: DetectionResult): string {
    const plan = this.getResolutionPlan(result);
    return this.resolver.generateInstallScript(plan);
  }

  /**
   * Quick check if all dependencies are satisfied
   */
  async check(manifest: ComponentManifest): Promise<boolean> {
    const result = await this.detect(manifest);
    return result.allSatisfied;
  }

  /**
   * Clear cached detection results
   */
  clearCache(): void {
    this.npmDetector.clearCache();
  }
}

// Export types and utilities
export * from './types.js';
export { EnvDetector } from './detectors/env.js';
export { NpmDetector } from './detectors/npm.js';
export { SystemDetector } from './detectors/system.js';
export { CredentialDetector } from './detectors/credential.js';
export { Resolver } from './resolver.js';
