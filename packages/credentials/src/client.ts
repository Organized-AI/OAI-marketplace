/**
 * Credential Manager Client
 *
 * Main client for managing credentials with Supabase backend.
 * Handles encryption, storage, retrieval, and validation.
 */

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { deriveKey, encrypt, decrypt } from './encryption.js';
import type {
  Credential,
  Service,
  CredentialManagerConfig,
  StoreCredentialOptions,
  GetCredentialOptions,
  DecryptedCredential,
  ExportOptions,
} from './types.js';

/**
 * Credential Manager
 *
 * Securely manages credentials with client-side encryption.
 */
export class CredentialManager {
  private supabase: SupabaseClient;
  private encryptionKey: CryptoKey | null = null;
  private config: CredentialManagerConfig;
  private user: User | null = null;

  constructor(config: CredentialManagerConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
  }

  /**
   * Initialize the manager with user authentication
   */
  async initialize(): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    this.user = user;

    if (!user && this.config.onAuthRequired) {
      await this.config.onAuthRequired();
    }
  }

  /**
   * Set the master password for encryption
   * This derives an encryption key that never leaves the client
   */
  async setMasterPassword(password: string): Promise<void> {
    if (!this.user) {
      throw new Error('User must be authenticated before setting master password');
    }

    // Use user ID as part of the salt for additional security
    const encoder = new TextEncoder();
    const userIdBytes = encoder.encode(this.user.id);
    const salt = new Uint8Array(16);
    salt.set(userIdBytes.slice(0, 16));

    this.encryptionKey = await deriveKey(password, salt);
  }

  /**
   * Check if the manager is ready (authenticated and has encryption key)
   */
  isReady(): boolean {
    return this.user !== null && this.encryptionKey !== null;
  }

  /**
   * Store a new credential
   */
  async store(options: StoreCredentialOptions): Promise<Credential> {
    this.ensureReady();

    const { ciphertext, iv } = await encrypt(options.value, this.encryptionKey!);

    const { data, error } = await this.supabase
      .from('credentials')
      .insert({
        user_id: this.user!.id,
        service_id: options.serviceId,
        env_var: options.envVar,
        label: options.label,
        encrypted_value: ciphertext,
        encryption_iv: iv,
        validation_status: 'unknown',
        expires_at: options.expiresAt?.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to store credential: ${error.message}`);
    }

    return this.mapCredential(data);
  }

  /**
   * Get a single credential by ID
   */
  async get(id: string): Promise<DecryptedCredential | null> {
    this.ensureReady();

    const { data, error } = await this.supabase
      .from('credentials')
      .select('*')
      .eq('id', id)
      .eq('user_id', this.user!.id)
      .single();

    if (error || !data) {
      return null;
    }

    const value = await decrypt(
      data.encrypted_value,
      data.encryption_iv,
      this.encryptionKey!
    );

    const credential = this.mapCredential(data);
    return {
      ...credential,
      value,
    };
  }

  /**
   * List credentials with optional filtering
   */
  async list(options?: GetCredentialOptions): Promise<Credential[]> {
    this.ensureReady();

    let query = this.supabase
      .from('credentials')
      .select('*')
      .eq('user_id', this.user!.id);

    if (options?.serviceId) {
      query = query.eq('service_id', options.serviceId);
    }

    if (options?.envVar) {
      query = query.eq('env_var', options.envVar);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list credentials: ${error.message}`);
    }

    return (data || []).map(this.mapCredential);
  }

  /**
   * Update a credential
   */
  async update(
    id: string,
    updates: Partial<StoreCredentialOptions>
  ): Promise<Credential> {
    this.ensureReady();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.value) {
      const { ciphertext, iv } = await encrypt(updates.value, this.encryptionKey!);
      updateData.encrypted_value = ciphertext;
      updateData.encryption_iv = iv;
      updateData.validation_status = 'unknown';
    }

    if (updates.label !== undefined) {
      updateData.label = updates.label;
    }

    if (updates.expiresAt !== undefined) {
      updateData.expires_at = updates.expiresAt?.toISOString();
    }

    const { data, error } = await this.supabase
      .from('credentials')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', this.user!.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update credential: ${error.message}`);
    }

    return this.mapCredential(data);
  }

  /**
   * Delete a credential
   */
  async delete(id: string): Promise<void> {
    this.ensureReady();

    const { error } = await this.supabase
      .from('credentials')
      .delete()
      .eq('id', id)
      .eq('user_id', this.user!.id);

    if (error) {
      throw new Error(`Failed to delete credential: ${error.message}`);
    }
  }

  /**
   * Export credentials to various formats
   */
  async export(options: ExportOptions): Promise<string> {
    this.ensureReady();

    const credentials = await this.list(
      options.serviceIds ? { serviceId: options.serviceIds[0] } : undefined
    );

    const decrypted: DecryptedCredential[] = await Promise.all(
      credentials.map(async (cred) => {
        const full = await this.get(cred.id);
        return full!;
      })
    );

    switch (options.format) {
      case 'env':
      case 'dotenv':
        return this.formatAsDotenv(decrypted, options.includeComments);
      case 'json':
        return this.formatAsJson(decrypted);
      default:
        throw new Error(`Unknown export format: ${options.format}`);
    }
  }

  /**
   * Get available services
   */
  async getServices(): Promise<Service[]> {
    const { data, error } = await this.supabase.from('services').select('*');

    if (error) {
      throw new Error(`Failed to get services: ${error.message}`);
    }

    return (data || []).map(this.mapService);
  }

  /**
   * Sign out and clear encryption key
   */
  async signOut(): Promise<void> {
    this.encryptionKey = null;
    this.user = null;
    await this.supabase.auth.signOut();
  }

  // Private helper methods

  private ensureReady(): void {
    if (!this.user) {
      throw new Error('User must be authenticated');
    }
    if (!this.encryptionKey) {
      throw new Error('Master password must be set');
    }
  }

  private mapCredential(data: Record<string, unknown>): Credential {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      serviceId: data.service_id as string,
      envVar: data.env_var as string,
      label: data.label as string | undefined,
      encryptedValue: data.encrypted_value as string,
      encryptionIv: data.encryption_iv as string,
      validationStatus: data.validation_status as Credential['validationStatus'],
      lastValidatedAt: data.last_validated_at
        ? new Date(data.last_validated_at as string)
        : undefined,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
      expiresAt: data.expires_at ? new Date(data.expires_at as string) : undefined,
    };
  }

  private mapService(data: Record<string, unknown>): Service {
    return {
      id: data.id as string,
      name: data.name as string,
      iconUrl: data.icon_url as string | undefined,
      setupUrl: data.setup_url as string | undefined,
      setupInstructions: data.setup_instructions as string[] | undefined,
      documentationUrl: data.documentation_url as string | undefined,
      validationType: data.validation_type as Service['validationType'],
      validationConfig: data.validation_config as Record<string, unknown> | undefined,
      keyFormat: data.key_format as string | undefined,
      category: data.category as string,
      envVars: data.env_vars as string[],
    };
  }

  private formatAsDotenv(
    credentials: DecryptedCredential[],
    includeComments = true
  ): string {
    return credentials
      .map((cred) => {
        const lines: string[] = [];
        if (includeComments && cred.label) {
          lines.push(`# ${cred.label}`);
        }
        lines.push(`${cred.envVar}=${cred.value}`);
        return lines.join('\n');
      })
      .join('\n\n');
  }

  private formatAsJson(credentials: DecryptedCredential[]): string {
    const obj: Record<string, string> = {};
    for (const cred of credentials) {
      obj[cred.envVar] = cred.value;
    }
    return JSON.stringify(obj, null, 2);
  }
}
