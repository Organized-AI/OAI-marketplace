/**
 * Stack Builder Types
 *
 * Type definitions for component installation.
 */

/**
 * Component types supported by Claude Code
 */
export type ComponentType = 'skill' | 'agent' | 'mcp' | 'command' | 'hook' | 'setting' | 'subagent';

/**
 * Component to be installed
 */
export interface Component {
  id: string;
  name: string;
  type: ComponentType;
  repository: string;
  version: string;
  dependencies?: {
    env?: Record<string, { required?: boolean }>;
    npm?: Record<string, string>;
    system?: string[];
  };
}

/**
 * Result of a single component installation
 */
export interface InstallResult {
  success: boolean;
  component: string;
  duration: number;
  error?: string;
  path?: string;
}

/**
 * Overall installation progress
 */
export interface InstallProgress {
  total: number;
  completed: number;
  current?: string;
  results: InstallResult[];
}

/**
 * Installation options
 */
export interface InstallOptions {
  /**
   * Base path for installation (defaults to cwd)
   */
  basePath?: string;

  /**
   * Skip dependency checks
   */
  skipDependencyCheck?: boolean;

  /**
   * Force reinstall even if already exists
   */
  force?: boolean;

  /**
   * Progress callback
   */
  onProgress?: (progress: InstallProgress) => void;
}

/**
 * Stack definition (multiple components)
 */
export interface Stack {
  id: string;
  name: string;
  description?: string;
  components: Component[];
  settings?: Record<string, unknown>;
}

/**
 * Pre-installation check result
 */
export interface PreInstallCheck {
  canInstall: boolean;
  missingDependencies: string[];
  suggestions: string[];
}
