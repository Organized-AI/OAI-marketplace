/**
 * Credentials Package Types
 *
 * Type definitions for the credentials package.
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
 * Options for storing a credential
 */
export interface StoreCredentialOptions {
  serviceId: string;
  envVar: string;
  value: string;
  label?: string;
  expiresAt?: Date;
}

/**
 * Options for retrieving credentials
 */
export interface GetCredentialOptions {
  serviceId?: string;
  envVar?: string;
}

/**
 * Decrypted credential (for internal use only)
 */
export interface DecryptedCredential extends Omit<Credential, 'encryptedValue' | 'encryptionIv'> {
  value: string;
}

/**
 * Export format options
 */
export type ExportFormat = 'env' | 'json' | 'dotenv';

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat;
  serviceIds?: string[];
  includeComments?: boolean;
}

/**
 * Import result
 */
export interface ImportResult {
  imported: number;
  skipped: number;
  errors: Array<{ envVar: string; error: string }>;
}

/**
 * Credential manager events
 */
export type CredentialEvent =
  | { type: 'credential:created'; credential: Credential }
  | { type: 'credential:updated'; credential: Credential }
  | { type: 'credential:deleted'; credentialId: string }
  | { type: 'credential:validated'; credential: Credential; result: ValidationResult }
  | { type: 'auth:required' }
  | { type: 'error'; error: Error };
