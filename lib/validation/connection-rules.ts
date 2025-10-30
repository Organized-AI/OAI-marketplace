/**
 * Connection Validation Rules
 *
 * Based on AITMPL documentation, this defines valid connection patterns
 * between different component types in the Stack Builder.
 *
 * Connection Logic:
 * - Agents possess Skills (capabilities)
 * - Agents spawn SubAgents (task executors)
 * - SubAgents use Skills to execute tasks
 * - Agents use MCPs for external service access
 * - Agents invoke Commands for automation
 * - Hooks trigger Agents/Commands on events
 * - Agents can work with other Agents (composition)
 */

import type { ComponentType } from '@/lib/types/stack-builder';

export type ConnectionType = 'required' | 'optional' | 'triggers';

export interface ConnectionRule {
  sourceType: ComponentType;
  targetType: ComponentType;
  allowed: boolean;
  direction: 'forward' | 'reverse' | 'bidirectional';
  defaultType: ConnectionType;
  description: string;
  examples: string[];
}

/**
 * Valid connection patterns based on AITMPL documentation
 */
export const CONNECTION_RULES: ConnectionRule[] = [
  // Agent → MCP (Agents consume MCPs)
  {
    sourceType: 'agent',
    targetType: 'mcp',
    allowed: true,
    direction: 'forward',
    defaultType: 'required',
    description: 'Agents use MCPs to access external services, databases, and APIs',
    examples: [
      'React Specialist → GitHub MCP (version control)',
      'Python Specialist → Supabase MCP (database queries)',
      'Backend Developer → AWS MCP (cloud services)',
    ],
  },

  // Agent → Command (Agents invoke Commands)
  {
    sourceType: 'agent',
    targetType: 'command',
    allowed: true,
    direction: 'forward',
    defaultType: 'optional',
    description: 'Agents can execute slash commands for workflow automation',
    examples: [
      'React Specialist → Generate Tests (agent runs /generate-tests)',
      'Security Auditor → Security Audit (agent runs /security-audit)',
      'Backend Developer → Deploy Staging (agent runs /deploy-staging)',
    ],
  },

  // Agent → Agent (Agent composition/collaboration)
  {
    sourceType: 'agent',
    targetType: 'agent',
    allowed: true,
    direction: 'bidirectional',
    defaultType: 'optional',
    description: 'Agents can collaborate or delegate tasks to specialized agents',
    examples: [
      'Fullstack Developer ↔ React Specialist (frontend delegation)',
      'Lead Developer ↔ Security Auditor (security review)',
      'Backend Developer ↔ Database Specialist (data modeling)',
    ],
  },

  // Agent → Skill (Agents possess Skills)
  {
    sourceType: 'agent',
    targetType: 'skill',
    allowed: true,
    direction: 'forward',
    defaultType: 'required',
    description: 'Agents possess skills that define their capabilities',
    examples: [
      'E-Commerce Specialist → Product Writing (content creation capability)',
      'Data Scientist → Data Analysis (analytical capability)',
      'Frontend Developer → React Development (UI framework capability)',
    ],
  },

  // Agent → SubAgent (Agents spawn SubAgents)
  {
    sourceType: 'agent',
    targetType: 'subagent',
    allowed: true,
    direction: 'forward',
    defaultType: 'optional',
    description: 'Agents can spawn sub-agents to handle specific tasks',
    examples: [
      'E-Commerce Specialist → Competitor Analyst (market research task)',
      'Fullstack Developer → Code Reviewer (code quality task)',
      'DevOps Engineer → Docker Optimizer (container optimization task)',
    ],
  },

  // SubAgent → Skill (SubAgents use Skills)
  {
    sourceType: 'subagent',
    targetType: 'skill',
    allowed: true,
    direction: 'forward',
    defaultType: 'required',
    description: 'Sub-agents require skills to execute their tasks',
    examples: [
      'Competitor Analyst → Market Research (uses research skills)',
      'Code Reviewer → Code Review (uses review skills)',
      'Test Generator → Testing (uses test creation skills)',
    ],
  },

  // SubAgent → MCP (SubAgents may use MCPs)
  {
    sourceType: 'subagent',
    targetType: 'mcp',
    allowed: true,
    direction: 'forward',
    defaultType: 'optional',
    description: 'Sub-agents can use MCPs for external services during task execution',
    examples: [
      'Competitor Analyst → Web Scraping MCP (gather competitor data)',
      'Code Reviewer → GitHub MCP (access repository)',
      'Database Optimizer → Database MCP (analyze queries)',
    ],
  },

  // Skill → MCP (Skills may require MCPs)
  {
    sourceType: 'skill',
    targetType: 'mcp',
    allowed: true,
    direction: 'forward',
    defaultType: 'optional',
    description: 'Skills may depend on MCPs for external tool access',
    examples: [
      'Web Scraping → Browser MCP (browser automation)',
      'Database Design → Database MCP (schema management)',
      'API Integration → REST Client MCP (API calls)',
    ],
  },

  // Hook → Agent (Hooks trigger Agents)
  {
    sourceType: 'hook',
    targetType: 'agent',
    allowed: true,
    direction: 'forward',
    defaultType: 'triggers',
    description: 'Hooks automatically invoke agents when events occur',
    examples: [
      'Pre-Commit Review → Security Auditor (runs on git commit)',
      'File Save Hook → Code Formatter (runs on file save)',
      'Test Complete → Slack Notifier (runs after tests)',
    ],
  },

  // Hook → Command (Hooks execute Commands)
  {
    sourceType: 'hook',
    targetType: 'command',
    allowed: true,
    direction: 'forward',
    defaultType: 'triggers',
    description: 'Hooks automatically run commands on specific events',
    examples: [
      'Pre-Push Hook → Run Tests (executes /run-tests before push)',
      'File Change → Auto Format (runs /format on save)',
      'Deploy Hook → Deploy Production (runs /deploy-production)',
    ],
  },

  // Command → MCP (Commands can use MCPs indirectly)
  {
    sourceType: 'command',
    targetType: 'mcp',
    allowed: true,
    direction: 'forward',
    defaultType: 'optional',
    description: 'Commands may need MCP access when executed by agents',
    examples: [
      'Generate Tests → GitHub MCP (reads repo structure)',
      'Deploy Command → Vercel MCP (deployment operations)',
      'Database Migration → Supabase MCP (schema changes)',
    ],
  },

  // Hook → MCP (Hooks can use MCPs for notifications/data)
  {
    sourceType: 'hook',
    targetType: 'mcp',
    allowed: true,
    direction: 'forward',
    defaultType: 'optional',
    description: 'Hooks may need MCP access for external integrations',
    examples: [
      'Notification Hook → Slack MCP (send alerts)',
      'Deploy Hook → GitHub MCP (update deployment status)',
      'Monitoring Hook → Database MCP (log metrics)',
    ],
  },
];

/**
 * Check if a connection between two component types is valid
 */
export function isValidConnection(
  sourceType: ComponentType,
  targetType: ComponentType
): boolean {
  return CONNECTION_RULES.some(
    (rule) =>
      rule.allowed &&
      rule.sourceType === sourceType &&
      rule.targetType === targetType
  );
}

/**
 * Get connection rule for specific component types
 */
export function getConnectionRule(
  sourceType: ComponentType,
  targetType: ComponentType
): ConnectionRule | null {
  return (
    CONNECTION_RULES.find(
      (rule) =>
        rule.sourceType === sourceType && rule.targetType === targetType
    ) || null
  );
}

/**
 * Get all valid target types for a given source type
 */
export function getValidTargets(sourceType: ComponentType): ComponentType[] {
  return CONNECTION_RULES.filter(
    (rule) => rule.allowed && rule.sourceType === sourceType
  ).map((rule) => rule.targetType);
}

/**
 * Get validation message for invalid connection
 */
export function getConnectionValidationMessage(
  sourceType: ComponentType,
  targetType: ComponentType
): string {
  const rule = getConnectionRule(sourceType, targetType);

  if (rule && rule.allowed) {
    return `✅ Valid: ${rule.description}`;
  }

  // Provide helpful error messages
  const reverseRule = getConnectionRule(targetType, sourceType);
  if (reverseRule && reverseRule.allowed) {
    return `❌ Invalid direction. Try connecting ${targetType} → ${sourceType} instead.\n\n${reverseRule.description}`;
  }

  return `❌ Cannot connect ${sourceType} to ${targetType}. This connection pattern is not supported by Claude Code architecture.`;
}

/**
 * Get suggested connections for a component
 */
export function getSuggestedConnections(
  componentType: ComponentType
): ConnectionRule[] {
  return CONNECTION_RULES.filter(
    (rule) => rule.allowed && rule.sourceType === componentType
  );
}
