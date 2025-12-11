/**
 * Phase 0 Dependency Detection Types
 */

/**
 * Types of dependencies that can be detected
 */
export type DependencyType = 'env' | 'npm' | 'system' | 'runtime' | 'credential';

/**
 * Status of a dependency check
 */
export type DependencyStatus = 'present' | 'missing' | 'invalid' | 'outdated';

/**
 * Result of checking a single dependency
 */
export interface Dependency {
  type: DependencyType;
  name: string;
  required: boolean;
  status: DependencyStatus;
  currentValue?: string;
  requiredValue?: string;
  error?: string;
  suggestion?: string;
}

/**
 * Result of checking all dependencies for a component
 */
export interface DetectionResult {
  component: string;
  dependencies: Dependency[];
  allSatisfied: boolean;
  missingRequired: Dependency[];
  timestamp: Date;
}

/**
 * Environment variable requirement
 */
export interface EnvRequirement {
  required?: boolean;
  description?: string;
  pattern?: string;
  sensitive?: boolean;
  setupUrl?: string;
}

/**
 * Component manifest with dependencies
 */
export interface ComponentManifest {
  name: string;
  version: string;
  description?: string;
  dependencies?: {
    env?: Record<string, EnvRequirement>;
    npm?: Record<string, string>;
    system?: string[];
    runtime?: {
      node?: string;
    };
  };
}

/**
 * Resolution action for a missing dependency
 */
export interface ResolutionAction {
  dependency: Dependency;
  action: 'install' | 'configure' | 'manual';
  command?: string;
  instructions?: string[];
  url?: string;
}

/**
 * Resolution plan for all missing dependencies
 */
export interface ResolutionPlan {
  component: string;
  actions: ResolutionAction[];
  canAutoResolve: boolean;
  manualSteps: ResolutionAction[];
  autoSteps: ResolutionAction[];
}
