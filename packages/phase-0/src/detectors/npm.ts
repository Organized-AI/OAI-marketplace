/**
 * NPM Package Detector
 *
 * Detects missing or outdated npm packages.
 */

import { execSync } from 'child_process';
import type { Dependency } from '../types.js';

interface PackageInfo {
  version: string;
}

export class NpmDetector {
  private installedPackages: Record<string, string> = {};
  private cacheLoaded = false;

  /**
   * Load installed packages from npm ls
   */
  private loadCache(): void {
    if (this.cacheLoaded) return;

    try {
      const output = execSync('npm ls --json --depth=0 2>/dev/null', {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
      });

      const parsed = JSON.parse(output);
      const deps = parsed.dependencies || {};

      this.installedPackages = Object.fromEntries(
        Object.entries(deps).map(([name, info]) => [
          name,
          (info as PackageInfo).version || 'unknown',
        ])
      );
    } catch {
      // npm ls failed, packages might not be installed
      this.installedPackages = {};
    }

    this.cacheLoaded = true;
  }

  /**
   * Detect npm package dependencies
   */
  detect(requirements: Record<string, string>): Dependency[] {
    this.loadCache();

    return Object.entries(requirements).map(([name, requiredVersion]) => {
      const currentVersion = this.installedPackages[name];

      if (!currentVersion) {
        return {
          type: 'npm' as const,
          name,
          required: true,
          status: 'missing' as const,
          requiredValue: requiredVersion,
          suggestion: `Run: npm install ${name}@${requiredVersion}`,
        };
      }

      // Simple version check (could be enhanced with semver)
      const isOutdated = this.isVersionOutdated(currentVersion, requiredVersion);

      if (isOutdated) {
        return {
          type: 'npm' as const,
          name,
          required: true,
          status: 'outdated' as const,
          currentValue: currentVersion,
          requiredValue: requiredVersion,
          suggestion: `Run: npm update ${name}`,
        };
      }

      return {
        type: 'npm' as const,
        name,
        required: true,
        status: 'present' as const,
        currentValue: currentVersion,
      };
    });
  }

  /**
   * Simple version comparison (major.minor check)
   */
  private isVersionOutdated(current: string, required: string): boolean {
    // Handle version ranges like ^1.0.0 or >=1.0.0
    const cleanRequired = required.replace(/^[\^~>=<]+/, '');

    const currentParts = current.split('.').map(Number);
    const requiredParts = cleanRequired.split('.').map(Number);

    // Check major version
    if (currentParts[0] < requiredParts[0]) return true;
    if (currentParts[0] > requiredParts[0]) return false;

    // Check minor version
    if (currentParts[1] < requiredParts[1]) return true;

    return false;
  }

  /**
   * Clear the cache to force re-detection
   */
  clearCache(): void {
    this.installedPackages = {};
    this.cacheLoaded = false;
  }
}
