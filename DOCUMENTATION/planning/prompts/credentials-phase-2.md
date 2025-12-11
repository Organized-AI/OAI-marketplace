# Organized Credentials - Phase 2: SDK + CLI

## Objective
Build the TypeScript SDK with client-side encryption and CLI commands.

## Prerequisites
- Database schema from Phase 1
- Monorepo structure

## Tasks

### Task 1: Encryption Module
Create `packages/credentials/src/encryption.ts`:

```typescript
export class EncryptionService {
  private key: CryptoKey | null = null;

  async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    this.key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    return this.key;
  }

  async encrypt(plaintext: string): Promise<string> {
    if (!this.key) throw new Error('Key not derived');
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.key,
      encoder.encode(plaintext)
    );
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);
    return btoa(String.fromCharCode(...combined));
  }

  async decrypt(ciphertext: string): Promise<string> {
    if (!this.key) throw new Error('Key not derived');
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.key,
      data
    );
    return new TextDecoder().decode(plaintext);
  }

  generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(16));
  }
}
```

### Task 2: Main SDK Client
Create `packages/credentials/src/client.ts`:

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EncryptionService } from './encryption';

export interface Credential {
  id: string;
  serviceId: string;
  envVar: string;
  label?: string;
  validationStatus: string;
  createdAt: Date;
}

export class OrganizedCredentials {
  private supabase: SupabaseClient;
  private encryption = new EncryptionService();
  private userId: string | null = null;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.userId = data.user.id;
  }

  async setMasterPassword(password: string) {
    const salt = this.encryption.generateSalt();
    await this.encryption.deriveKey(password, salt);
    const keyCheck = await this.encryption.encrypt('organized-credentials-check');
    
    await this.supabase.from('profiles').upsert({
      id: this.userId,
      master_key_salt: btoa(String.fromCharCode(...salt)),
      key_check_blob: keyCheck,
    });
  }

  async unlock(password: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('profiles')
      .select('master_key_salt, key_check_blob')
      .eq('id', this.userId)
      .single();

    if (!data?.master_key_salt) throw new Error('Master password not set');

    const salt = Uint8Array.from(atob(data.master_key_salt), c => c.charCodeAt(0));
    await this.encryption.deriveKey(password, salt);

    try {
      const decrypted = await this.encryption.decrypt(data.key_check_blob);
      return decrypted === 'organized-credentials-check';
    } catch {
      return false;
    }
  }

  async store(serviceId: string, envVar: string, value: string, label?: string) {
    const encrypted = await this.encryption.encrypt(value);
    const { data, error } = await this.supabase
      .from('credentials')
      .upsert({
        user_id: this.userId,
        service_id: serviceId,
        env_var: envVar,
        label,
        encrypted_value: encrypted,
        encryption_iv: '',
        validation_status: 'unknown',
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async get(serviceId: string, envVar: string): Promise<string | null> {
    const { data } = await this.supabase
      .from('credentials')
      .select('encrypted_value')
      .eq('user_id', this.userId)
      .eq('service_id', serviceId)
      .eq('env_var', envVar)
      .single();

    if (!data) return null;
    return this.encryption.decrypt(data.encrypted_value);
  }

  async list(): Promise<Credential[]> {
    const { data } = await this.supabase
      .from('credentials')
      .select('*')
      .eq('user_id', this.userId);
    
    return (data || []).map(d => ({
      id: d.id,
      serviceId: d.service_id,
      envVar: d.env_var,
      label: d.label,
      validationStatus: d.validation_status,
      createdAt: new Date(d.created_at),
    }));
  }

  async exportEnv(): Promise<string> {
    const creds = await this.list();
    const lines = ['# Generated by Organized Credentials'];
    for (const c of creds) {
      const value = await this.get(c.serviceId, c.envVar);
      if (value) lines.push(`${c.envVar}=${value}`);
    }
    return lines.join('\n');
  }
}
```

### Task 3: Package Export
Create `packages/credentials/src/index.ts`:

```typescript
export { OrganizedCredentials, type Credential } from './client';
export { EncryptionService } from './encryption';
```

### Task 4: Package.json
Create `packages/credentials/package.json`:

```json
{
  "name": "@organized-ai/credentials",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

## Verification
1. `pnpm build` in packages/credentials
2. Write test script that: signs in, sets master password, stores credential, retrieves it
3. Verify encryption works (values in DB are encrypted)
4. Verify export generates valid .env format

## Success Criteria
- [ ] Encryption/decryption works
- [ ] Master password derives key correctly
- [ ] Credentials stored encrypted in Supabase
- [ ] Can export to .env format
