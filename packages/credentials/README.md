# @organized-ai/credentials

Secure credential management SDK for Organized AI applications.

## Features

- **Client-side encryption**: All credentials are encrypted using AES-256-GCM before being sent to the server
- **PBKDF2 key derivation**: Master password is never stored; encryption keys are derived client-side
- **Supabase backend**: Leverages Supabase with Row Level Security for secure multi-tenant storage
- **Export formats**: Export credentials to `.env`, JSON, or other formats
- **Service catalog**: Pre-configured service definitions for common APIs (Anthropic, GitHub, etc.)

## Installation

```bash
pnpm add @organized-ai/credentials
```

## Quick Start

```typescript
import { CredentialManager } from '@organized-ai/credentials';

// Initialize the manager
const manager = new CredentialManager({
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
});

// Authenticate and set master password
await manager.initialize();
await manager.setMasterPassword('your-secure-password');

// Store a credential
await manager.store({
  serviceId: 'anthropic',
  envVar: 'ANTHROPIC_API_KEY',
  value: 'sk-ant-api03-...',
  label: 'My Anthropic Key',
});

// List all credentials
const credentials = await manager.list();

// Get a specific credential (decrypted)
const cred = await manager.get(credentials[0].id);
console.log(cred.value); // sk-ant-api03-...

// Export to .env format
const envFile = await manager.export({ format: 'dotenv' });
```

## Security Model

1. **Master Password**: User provides a master password that never leaves the client
2. **Key Derivation**: PBKDF2 with 100,000 iterations derives an AES-256 key
3. **Encryption**: Each credential is encrypted with AES-256-GCM using a unique IV
4. **Storage**: Only encrypted values are stored in Supabase
5. **Access Control**: Row Level Security ensures users can only access their own credentials

## API Reference

### `CredentialManager`

#### Constructor

```typescript
new CredentialManager(config: CredentialManagerConfig)
```

#### Methods

- `initialize()`: Initialize auth state
- `setMasterPassword(password: string)`: Set encryption key from password
- `isReady()`: Check if manager is authenticated and has encryption key
- `store(options)`: Store a new credential
- `get(id)`: Get a single credential (decrypted)
- `list(options?)`: List credentials (encrypted metadata only)
- `update(id, updates)`: Update a credential
- `delete(id)`: Delete a credential
- `export(options)`: Export credentials to various formats
- `getServices()`: Get available service definitions
- `signOut()`: Sign out and clear encryption key

## License

MIT
