/**
 * Organized AI Shared Types
 *
 * Core type definitions used across packages.
 */

/**
 * Credential stored in the vault
 */
export interface Credential {
  id: string;
  userId: string;
  serviceId: string;
  envVar: string;
  label?: string;
  encryptedValue: string;
  encryptionIv: string;
  validationStatus: 'valid' | 'invalid' | 'unknown' | 'expired';
  lastValidatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

/**
 * Service definition (e.g., GitHub, Anthropic, Supabase)
 */
export interface Service {
  id: string;
  name: string;
  iconUrl?: string;
  setupUrl?: string;
  setupInstructions?: string[];
  documentationUrl?: string;
  validationType: 'api' | 'connection' | 'format' | 'none';
  validationConfig?: Record<string, unknown>;
  keyFormat?: string;
  category: string;
  envVars: string[];
}

/**
 * Result of credential validation
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  validatedAt: Date;
}

/**
 * Configuration for the credential manager
 */
export interface CredentialManagerConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  onAuthRequired?: () => Promise<void>;
}

/**
 * User profile in the system
 */
export interface UserProfile {
  id: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Audit log entry for credential operations
 */
export interface AuditLogEntry {
  id: string;
  userId: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'validate' | 'export';
  credentialId?: string;
  serviceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
