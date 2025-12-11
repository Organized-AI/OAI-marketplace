/**
 * Component Installer
 *
 * Handles downloading and installing components from git repositories.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type { Component, InstallResult, ComponentType } from './types.js';

/**
 * Maps component types to their installation directories
 */
const COMPONENT_PATHS: Record<ComponentType, string> = {
  skill: '.claude/skills',
  agent: '.claude/agents',
  subagent: '.claude/agents',
  mcp: '.claude/mcps',
  command: '.claude/commands',
  hook: '.claude/hooks',
  setting: '.claude/settings',
};

export class Installer {
  private basePath: string;

  constructor(basePath = process.cwd()) {
    this.basePath = basePath;
  }

  /**
   * Install a single component
   */
  async install(component: Component): Promise<InstallResult> {
    const start = Date.now();
    const targetPath = this.getTargetPath(component);

    try {
      // Check if already exists
      if (fs.existsSync(targetPath)) {
        return {
          success: false,
          component: component.id,
          duration: Date.now() - start,
          error: `Component already exists at ${targetPath}. Use --force to reinstall.`,
        };
      }

      // Create parent directory
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });

      // Clone repository
      execSync(`git clone --depth 1 ${component.repository} "${targetPath}"`, {
        stdio: 'pipe',
        timeout: 60000, // 60 second timeout
      });

      // Remove .git folder (we don't need git history)
      const gitDir = path.join(targetPath, '.git');
      if (fs.existsSync(gitDir)) {
        fs.rmSync(gitDir, { recursive: true, force: true });
      }

      // Check for post-install script
      await this.runPostInstall(targetPath);

      return {
        success: true,
        component: component.id,
        duration: Date.now() - start,
        path: targetPath,
      };
    } catch (error) {
      // Clean up on failure
      if (fs.existsSync(targetPath)) {
        fs.rmSync(targetPath, { recursive: true, force: true });
      }

      return {
        success: false,
        component: component.id,
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Force reinstall a component (removes existing first)
   */
  async reinstall(component: Component): Promise<InstallResult> {
    const targetPath = this.getTargetPath(component);

    // Remove existing
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    }

    return this.install(component);
  }

  /**
   * Uninstall a component
   */
  async uninstall(component: Component): Promise<InstallResult> {
    const start = Date.now();
    const targetPath = this.getTargetPath(component);

    try {
      if (!fs.existsSync(targetPath)) {
        return {
          success: false,
          component: component.id,
          duration: Date.now() - start,
          error: `Component not found at ${targetPath}`,
        };
      }

      fs.rmSync(targetPath, { recursive: true, force: true });

      return {
        success: true,
        component: component.id,
        duration: Date.now() - start,
      };
    } catch (error) {
      return {
        success: false,
        component: component.id,
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if a component is installed
   */
  isInstalled(component: Component): boolean {
    const targetPath = this.getTargetPath(component);
    return fs.existsSync(targetPath);
  }

  /**
   * Get the installation path for a component
   */
  getTargetPath(component: Component): string {
    const baseDir = COMPONENT_PATHS[component.type] || '.claude/components';
    return path.join(this.basePath, baseDir, component.id);
  }

  /**
   * Run post-install script if exists
   */
  private async runPostInstall(targetPath: string): Promise<void> {
    const postInstallPath = path.join(targetPath, 'post-install.sh');

    if (fs.existsSync(postInstallPath)) {
      try {
        execSync(`chmod +x "${postInstallPath}" && "${postInstallPath}"`, {
          cwd: targetPath,
          stdio: 'pipe',
          timeout: 30000,
        });
      } catch {
        // Post-install failure is not critical
        console.warn(`Warning: post-install script failed for ${targetPath}`);
      }
    }
  }

  /**
   * List installed components of a specific type
   */
  listInstalled(type: ComponentType): string[] {
    const dir = path.join(this.basePath, COMPONENT_PATHS[type]);

    if (!fs.existsSync(dir)) {
      return [];
    }

    return fs.readdirSync(dir).filter((name) => {
      const stat = fs.statSync(path.join(dir, name));
      return stat.isDirectory();
    });
  }
}
