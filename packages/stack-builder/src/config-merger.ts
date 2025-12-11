/**
 * Configuration Merger
 *
 * Handles merging component configurations with existing Claude settings.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Default settings structure for Claude Code
 */
interface ClaudeSettings {
  skills?: Record<string, unknown>;
  agents?: Record<string, unknown>;
  mcps?: Record<string, unknown>;
  permissions?: Record<string, unknown>;
  [key: string]: unknown;
}

export class ConfigMerger {
  private settingsPath: string;

  constructor(basePath = process.cwd()) {
    this.settingsPath = path.join(basePath, '.claude', 'settings.json');
  }

  /**
   * Merge new settings with existing settings
   */
  async mergeSettings(newSettings: Record<string, unknown>): Promise<void> {
    let existing: ClaudeSettings = {};

    // Load existing settings if present
    if (fs.existsSync(this.settingsPath)) {
      try {
        const content = fs.readFileSync(this.settingsPath, 'utf-8');
        existing = JSON.parse(content);
      } catch {
        // Invalid JSON, start fresh
        existing = {};
      }
    }

    // Deep merge settings
    const merged = this.deepMerge(existing, newSettings);

    // Ensure directory exists
    fs.mkdirSync(path.dirname(this.settingsPath), { recursive: true });

    // Write merged settings
    fs.writeFileSync(this.settingsPath, JSON.stringify(merged, null, 2));
  }

  /**
   * Get current settings
   */
  getSettings(): ClaudeSettings {
    if (!fs.existsSync(this.settingsPath)) {
      return {};
    }

    try {
      const content = fs.readFileSync(this.settingsPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  /**
   * Add an MCP server configuration
   */
  async addMcpServer(
    name: string,
    config: { command: string; args?: string[]; env?: Record<string, string> }
  ): Promise<void> {
    const settings = this.getSettings();

    if (!settings.mcps) {
      settings.mcps = {};
    }

    (settings.mcps as Record<string, unknown>)[name] = config;

    await this.mergeSettings(settings);
  }

  /**
   * Remove an MCP server configuration
   */
  async removeMcpServer(name: string): Promise<void> {
    const settings = this.getSettings();

    if (settings.mcps && typeof settings.mcps === 'object') {
      delete (settings.mcps as Record<string, unknown>)[name];
      // Write directly instead of merging to ensure deletion takes effect
      fs.mkdirSync(path.dirname(this.settingsPath), { recursive: true });
      fs.writeFileSync(this.settingsPath, JSON.stringify(settings, null, 2));
    }
  }

  /**
   * Add permissions for a component
   */
  async addPermissions(
    componentId: string,
    permissions: string[]
  ): Promise<void> {
    const settings = this.getSettings();

    if (!settings.permissions) {
      settings.permissions = {};
    }

    (settings.permissions as Record<string, unknown>)[componentId] = permissions;

    await this.mergeSettings(settings);
  }

  /**
   * Deep merge two objects
   */
  private deepMerge(
    target: Record<string, unknown>,
    source: Record<string, unknown>
  ): Record<string, unknown> {
    const result: Record<string, unknown> = { ...target };

    for (const key of Object.keys(source)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        // Recursively merge objects
        result[key] = this.deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        );
      } else if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
        // Merge arrays (unique values)
        result[key] = [...new Set([...targetValue, ...sourceValue])];
      } else {
        // Overwrite with source value
        result[key] = sourceValue;
      }
    }

    return result;
  }

  /**
   * Create a backup of current settings
   */
  async backup(): Promise<string | null> {
    if (!fs.existsSync(this.settingsPath)) {
      return null;
    }

    const backupPath = `${this.settingsPath}.backup.${Date.now()}`;
    fs.copyFileSync(this.settingsPath, backupPath);
    return backupPath;
  }

  /**
   * Restore settings from a backup
   */
  async restore(backupPath: string): Promise<void> {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupPath}`);
    }

    fs.copyFileSync(backupPath, this.settingsPath);
  }
}
