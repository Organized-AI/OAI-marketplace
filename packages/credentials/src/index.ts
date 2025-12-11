/**
 * @organized-ai/credentials
 *
 * Secure credential management SDK for Organized AI.
 *
 * Features:
 * - Client-side AES-256-GCM encryption
 * - PBKDF2 key derivation from master password
 * - Supabase backend with Row Level Security
 * - Export to .env, JSON formats
 *
 * @example
 * ```typescript
 * import { CredentialManager } from '@organized-ai/credentials';
 *
 * const manager = new CredentialManager({
 *   supabaseUrl: process.env.SUPABASE_URL!,
 *   supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
 * });
 *
 * await manager.initialize();
 * await manager.setMasterPassword('your-secure-password');
 *
 * // Store a credential
 * await manager.store({
 *   serviceId: 'anthropic',
 *   envVar: 'ANTHROPIC_API_KEY',
 *   value: 'sk-ant-...',
 * });
 *
 * // Export to .env format
 * const envFile = await manager.export({ format: 'dotenv' });
 * ```
 */

export { CredentialManager } from './client.js';
export * from './types.js';
export * from './encryption.js';
