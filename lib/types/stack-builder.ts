/**
 * Stack Builder Type Definitions
 *
 * These types define the structure for components, nodes, edges, and configuration
 * used in the visual Stack Builder canvas.
 */

import { Node, Edge } from '@xyflow/react';

/**
 * Component Types
 *
 * - agent: Full-featured AI specialists that coordinate workflows
 * - subagent: Task-oriented entities spawned to complete specific tasks
 * - skill: Capability definitions that describe what agents can do
 * - mcp: Model Context Protocol integrations for external services
 * - command: Custom slash commands for automation
 * - hook: Event-driven automation triggers
 * - setting: Configuration options
 */
export type ComponentType = 'agent' | 'subagent' | 'skill' | 'mcp' | 'command' | 'hook' | 'setting';

/**
 * Component Metadata
 * Represents a single component available in the marketplace
 */
export interface Component {
  id: string;
  type: ComponentType;
  name: string;
  description: string;
  icon: string; // emoji or icon name
  author: string;
  githubUrl?: string;
  downloads: number;
  rating: number;
  tags: string[];
  dependencies?: string[]; // IDs of required components
  compatibleModels: string[]; // e.g., ['claude-opus-4', 'claude-sonnet-4']

  // Configuration schema
  configSchema?: Record<string, ConfigField>;

  // Installation details
  installCommand?: string;
  npmPackages?: string[];
}

/**
 * Configuration Field Schema
 * Defines the shape of each configuration field for a component
 */
export interface ConfigField {
  type: 'string' | 'number' | 'boolean' | 'select' | 'file';
  required: boolean;
  sensitive?: boolean; // For API keys, passwords
  description: string;
  placeholder?: string;
  default?: string | number | boolean;
  options?: string[]; // For select fields
  validation?: {
    min?: number;
    max?: number;
    pattern?: string; // regex pattern
    message?: string; // validation error message
  };
}

/**
 * Component Configuration
 * User-provided configuration values for a component instance
 */
export interface ComponentConfig {
  [key: string]: string | number | boolean | File | null | undefined;
}

/**
 * Canvas Node Data
 * Extends Component with instance-specific data
 */
export interface NodeData extends Component {
  config: ComponentConfig;
  instanceId: string; // Unique ID for this instance on canvas
  isConfigured: boolean; // Whether all required fields are filled
  validationErrors?: string[];
  [key: string]: unknown; // Index signature for React Flow compatibility
}

/**
 * Canvas Node
 * @xyflow/react Node with our custom data type
 */
export type StackBuilderNode = Node<NodeData>;

/**
 * Canvas Edge (Connection)
 * Represents dependencies between components
 */
export interface StackBuilderEdge extends Edge {
  data?: {
    type: 'required' | 'optional';
    description?: string;
  };
}

/**
 * Stack
 * Represents a complete collection of components configured together
 */
export interface Stack {
  id: string;
  name: string;
  description: string;
  author: string;
  visibility: 'public' | 'unlisted' | 'private';
  createdAt: Date;
  updatedAt: Date;

  // Components on canvas
  nodes: StackBuilderNode[];
  edges: StackBuilderEdge[];

  // Metadata
  downloads: number;
  clones: number;
  upvotes: number;
  tags: string[];

  // Screenshot/thumbnail
  thumbnail?: string; // base64 or URL
}

/**
 * Export Options
 * Configuration for exporting a stack
 */
export interface ExportOptions {
  stackName: string;
  description?: string;
  includeReadme: boolean;
  includeEnvExample: boolean;
  format: 'zip' | 'cli-command' | 'json';
}

/**
 * Validation Warning
 * Represents a validation issue with a component or stack
 */
export interface ValidationWarning {
  id: string;
  nodeId: string; // Component node this warning applies to
  type: 'missing-config' | 'incompatible' | 'missing-dependency' | 'security';
  severity: 'error' | 'warning' | 'info';
  message: string;
  field?: string; // Specific config field (if applicable)
  suggestion?: string; // How to fix
}

/**
 * Draft State
 * Auto-saved draft stored in localStorage
 */
export interface DraftState {
  lastSaved: Date;
  nodes: StackBuilderNode[];
  edges: StackBuilderEdge[];
  stackName?: string;
  stackDescription?: string;
}

/**
 * Skill Definition
 * Represents a capability that agents can possess
 */
export interface Skill extends Component {
  type: 'skill';
  capabilities: string[];
  tools?: string[];
  models?: string[];
  prerequisites?: string[];
  proficiencyLevels?: ('beginner' | 'intermediate' | 'expert')[];
  complexity: 'low' | 'medium' | 'high';
  estimatedTokens?: number;
  usedByAgents?: string[]; // Agent IDs that have this skill
}

/**
 * Sub-Agent Template
 * Defines a type of sub-agent that can be spawned
 */
export interface SubAgentTemplate extends Component {
  type: 'subagent';
  requiredSkills: string[]; // Skill IDs required
  optionalSkills?: string[]; // Skill IDs that enhance capability
  recommendedModel: 'claude-haiku-4' | 'claude-sonnet-4' | 'claude-opus-4';
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedDuration?: string; // e.g., "2-5 minutes"
  tokenBudget?: number;
  canBeSpawnedBy?: string[]; // Agent IDs that can spawn this sub-agent
}

/**
 * Sub-Agent Instance
 * Runtime instance of a spawned sub-agent
 */
export interface SubAgentInstance {
  id: string;
  templateId: string; // References SubAgentTemplate
  task: string; // Specific task assigned
  skills: string[]; // Skill IDs being used
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number; // 0-100
  spawnedBy: string; // Parent agent ID
  spawnedAt: Date;
  completedAt?: Date;
  result?: unknown;
  error?: string;
  model: string;
  tokensUsed?: number;
  cost?: number;
}

/**
 * Agent with Skills
 * Extends Component with skill-related properties
 */
export interface AgentWithSkills extends Component {
  type: 'agent';
  skills: string[]; // Skill IDs this agent possesses
  canSpawnSubAgents: boolean;
  subAgentTemplates?: string[]; // SubAgent template IDs this agent can spawn
  maxConcurrentSubAgents?: number;
}

/**
 * Orchestration Group
 * Defines how sub-agents are executed
 */
export interface OrchestrationGroup {
  groupNumber: number;
  executionMode: 'sequential' | 'parallel';
  description: string;
  subagents: {
    templateId: string;
    name: string;
    icon: string;
    model: 'claude-haiku-4' | 'claude-sonnet-4' | 'claude-opus-4';
    priority: 'critical' | 'high' | 'medium' | 'low';
    timeout?: number;
    retries?: number;
    description: string;
  }[];
}

/**
 * Retry Configuration
 * Defines retry behavior for sub-agents
 */
export interface RetryConfig {
  maxRetries: number;
  backoffMultiplier?: number;
  initialDelay?: number;
}
