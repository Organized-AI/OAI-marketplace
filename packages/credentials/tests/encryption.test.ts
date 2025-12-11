/**
 * Encryption Module Tests
 *
 * Tests for the AES-256-GCM encryption functionality.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  deriveKey,
  generateSalt,
  generateIv,
  encrypt,
  decrypt,
  hashValue,
} from '../src/encryption';

// Polyfill crypto for Node.js test environment
beforeAll(async () => {
  if (typeof globalThis.crypto === 'undefined') {
    const { webcrypto } = await import('crypto');
    globalThis.crypto = webcrypto as unknown as Crypto;
  }
});

describe('generateSalt', () => {
  it('should generate a 16-byte salt', () => {
    const salt = generateSalt();
    expect(salt).toBeInstanceOf(Uint8Array);
    expect(salt.length).toBe(16);
  });

  it('should generate unique salts', () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    expect(salt1).not.toEqual(salt2);
  });
});

describe('generateIv', () => {
  it('should generate a 12-byte IV', () => {
    const iv = generateIv();
    expect(iv).toBeInstanceOf(Uint8Array);
    expect(iv.length).toBe(12);
  });

  it('should generate unique IVs', () => {
    const iv1 = generateIv();
    const iv2 = generateIv();
    expect(iv1).not.toEqual(iv2);
  });
});

describe('deriveKey', () => {
  it('should derive a CryptoKey from password and salt', async () => {
    const password = 'test-password-123';
    const salt = generateSalt();
    const key = await deriveKey(password, salt);

    expect(key).toBeDefined();
    expect(key.type).toBe('secret');
    expect(key.algorithm).toMatchObject({ name: 'AES-GCM', length: 256 });
  });

  it('should derive the same key from same password and salt', async () => {
    const password = 'test-password-123';
    const salt = generateSalt();

    const key1 = await deriveKey(password, salt);
    const key2 = await deriveKey(password, salt);

    // Export keys to compare (since CryptoKey objects can't be directly compared)
    const testValue = 'test data';
    const encrypted1 = await encrypt(testValue, key1);
    const decrypted1 = await decrypt(encrypted1.ciphertext, encrypted1.iv, key2);

    expect(decrypted1).toBe(testValue);
  });

  it('should derive different keys from different passwords', async () => {
    const salt = generateSalt();
    const key1 = await deriveKey('password1', salt);
    const key2 = await deriveKey('password2', salt);

    const testValue = 'test data';
    const encrypted = await encrypt(testValue, key1);

    // Should fail to decrypt with different key
    await expect(
      decrypt(encrypted.ciphertext, encrypted.iv, key2)
    ).rejects.toThrow();
  });

  it('should derive different keys from different salts', async () => {
    const password = 'same-password';
    const salt1 = generateSalt();
    const salt2 = generateSalt();

    const key1 = await deriveKey(password, salt1);
    const key2 = await deriveKey(password, salt2);

    const testValue = 'test data';
    const encrypted = await encrypt(testValue, key1);

    // Should fail to decrypt with key derived from different salt
    await expect(
      decrypt(encrypted.ciphertext, encrypted.iv, key2)
    ).rejects.toThrow();
  });

  it('should support custom iteration count', async () => {
    const password = 'test-password';
    const salt = generateSalt();

    // Lower iterations for faster test
    const key = await deriveKey(password, salt, 1000);
    expect(key).toBeDefined();
    expect(key.type).toBe('secret');
  });
});

describe('encrypt and decrypt', () => {
  let key: CryptoKey;

  beforeAll(async () => {
    const salt = generateSalt();
    key = await deriveKey('test-password', salt);
  });

  it('should encrypt a string and return ciphertext and IV', async () => {
    const plaintext = 'Hello, World!';
    const result = await encrypt(plaintext, key);

    expect(result).toHaveProperty('ciphertext');
    expect(result).toHaveProperty('iv');
    expect(typeof result.ciphertext).toBe('string');
    expect(typeof result.iv).toBe('string');
    expect(result.ciphertext).not.toBe(plaintext);
  });

  it('should decrypt ciphertext back to original plaintext', async () => {
    const plaintext = 'Secret API Key: sk-1234567890';
    const encrypted = await encrypt(plaintext, key);
    const decrypted = await decrypt(encrypted.ciphertext, encrypted.iv, key);

    expect(decrypted).toBe(plaintext);
  });

  it('should handle empty strings', async () => {
    const plaintext = '';
    const encrypted = await encrypt(plaintext, key);
    const decrypted = await decrypt(encrypted.ciphertext, encrypted.iv, key);

    expect(decrypted).toBe(plaintext);
  });

  it('should handle long strings', async () => {
    const plaintext = 'A'.repeat(10000);
    const encrypted = await encrypt(plaintext, key);
    const decrypted = await decrypt(encrypted.ciphertext, encrypted.iv, key);

    expect(decrypted).toBe(plaintext);
  });

  it('should handle special characters', async () => {
    const plaintext = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`\n\t\r';
    const encrypted = await encrypt(plaintext, key);
    const decrypted = await decrypt(encrypted.ciphertext, encrypted.iv, key);

    expect(decrypted).toBe(plaintext);
  });

  it('should handle unicode characters', async () => {
    const plaintext = '你好世界 🔐 مرحبا 🌍 Привет';
    const encrypted = await encrypt(plaintext, key);
    const decrypted = await decrypt(encrypted.ciphertext, encrypted.iv, key);

    expect(decrypted).toBe(plaintext);
  });

  it('should produce different ciphertext for same plaintext (due to random IV)', async () => {
    const plaintext = 'Same text';
    const encrypted1 = await encrypt(plaintext, key);
    const encrypted2 = await encrypt(plaintext, key);

    expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
    expect(encrypted1.iv).not.toBe(encrypted2.iv);

    // Both should decrypt to same value
    const decrypted1 = await decrypt(encrypted1.ciphertext, encrypted1.iv, key);
    const decrypted2 = await decrypt(encrypted2.ciphertext, encrypted2.iv, key);

    expect(decrypted1).toBe(plaintext);
    expect(decrypted2).toBe(plaintext);
  });

  it('should fail to decrypt with wrong IV', async () => {
    const plaintext = 'Test data';
    const encrypted = await encrypt(plaintext, key);
    const wrongIv = generateIv();

    // Convert to base64 for the wrong IV
    const wrongIvBase64 = Buffer.from(wrongIv).toString('base64');

    await expect(
      decrypt(encrypted.ciphertext, wrongIvBase64, key)
    ).rejects.toThrow();
  });

  it('should fail to decrypt tampered ciphertext', async () => {
    const plaintext = 'Test data';
    const encrypted = await encrypt(plaintext, key);

    // Tamper with ciphertext
    const tamperedCiphertext =
      encrypted.ciphertext.slice(0, -4) + 'AAAA';

    await expect(
      decrypt(tamperedCiphertext, encrypted.iv, key)
    ).rejects.toThrow();
  });
});

describe('hashValue', () => {
  it('should return a base64-encoded SHA-256 hash', async () => {
    const value = 'test-value';
    const hash = await hashValue(value);

    expect(typeof hash).toBe('string');
    // Base64-encoded SHA-256 is 44 characters
    expect(hash.length).toBe(44);
  });

  it('should produce consistent hashes for same input', async () => {
    const value = 'consistent-input';
    const hash1 = await hashValue(value);
    const hash2 = await hashValue(value);

    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different inputs', async () => {
    const hash1 = await hashValue('input1');
    const hash2 = await hashValue('input2');

    expect(hash1).not.toBe(hash2);
  });

  it('should handle empty strings', async () => {
    const hash = await hashValue('');
    expect(typeof hash).toBe('string');
    expect(hash.length).toBe(44);
  });

  it('should handle unicode characters', async () => {
    const hash = await hashValue('🔐 Secret Key');
    expect(typeof hash).toBe('string');
    expect(hash.length).toBe(44);
  });
});

describe('integration: full encryption workflow', () => {
  it('should complete a full encryption/decryption cycle', async () => {
    // 1. Generate salt
    const salt = generateSalt();
    expect(salt.length).toBe(16);

    // 2. Derive key from master password
    const masterPassword = 'super-secure-master-password-123!';
    const key = await deriveKey(masterPassword, salt);
    expect(key.type).toBe('secret');

    // 3. Encrypt sensitive data
    const credentials = {
      apiKey: 'sk-ant-api03-xxxxx',
      apiSecret: 'supersecret',
    };
    const plaintext = JSON.stringify(credentials);
    const encrypted = await encrypt(plaintext, key);

    // 4. Store encrypted data (simulated)
    const storedData = {
      salt: Buffer.from(salt).toString('base64'),
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
    };

    // 5. Retrieve and decrypt (simulated as another session)
    const retrievedSalt = new Uint8Array(
      Buffer.from(storedData.salt, 'base64')
    );
    const retrievedKey = await deriveKey(masterPassword, retrievedSalt);
    const decrypted = await decrypt(
      storedData.ciphertext,
      storedData.iv,
      retrievedKey
    );

    // 6. Verify
    const parsedCredentials = JSON.parse(decrypted);
    expect(parsedCredentials).toEqual(credentials);
  });

  it('should reject wrong master password', async () => {
    const salt = generateSalt();
    const correctPassword = 'correct-password';
    const wrongPassword = 'wrong-password';

    const key = await deriveKey(correctPassword, salt);
    const encrypted = await encrypt('secret data', key);

    const wrongKey = await deriveKey(wrongPassword, salt);

    await expect(
      decrypt(encrypted.ciphertext, encrypted.iv, wrongKey)
    ).rejects.toThrow();
  });
});
