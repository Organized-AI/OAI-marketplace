/**
 * ConfigMerger Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConfigMerger } from '../src/config-merger';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('ConfigMerger', () => {
  let tempDir: string;
  let merger: ConfigMerger;

  beforeEach(() => {
    // Create temp directory for each test
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-merger-test-'));
    merger = new ConfigMerger(tempDir);
  });

  afterEach(() => {
    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('mergeSettings', () => {
    it('should create settings file if it does not exist', async () => {
      await merger.mergeSettings({ key: 'value' });

      const settingsPath = path.join(tempDir, '.claude', 'settings.json');
      expect(fs.existsSync(settingsPath)).toBe(true);

      const content = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      expect(content).toEqual({ key: 'value' });
    });

    it('should merge with existing settings', async () => {
      const settingsDir = path.join(tempDir, '.claude');
      fs.mkdirSync(settingsDir, { recursive: true });
      fs.writeFileSync(
        path.join(settingsDir, 'settings.json'),
        JSON.stringify({ existing: 'value', nested: { a: 1 } })
      );

      await merger.mergeSettings({ new: 'data', nested: { b: 2 } });

      const content = merger.getSettings();
      expect(content).toEqual({
        existing: 'value',
        new: 'data',
        nested: { a: 1, b: 2 },
      });
    });

    it('should handle invalid existing JSON', async () => {
      const settingsDir = path.join(tempDir, '.claude');
      fs.mkdirSync(settingsDir, { recursive: true });
      fs.writeFileSync(path.join(settingsDir, 'settings.json'), 'invalid json');

      await merger.mergeSettings({ key: 'value' });

      const content = merger.getSettings();
      expect(content).toEqual({ key: 'value' });
    });

    it('should deep merge nested objects', async () => {
      const settingsDir = path.join(tempDir, '.claude');
      fs.mkdirSync(settingsDir, { recursive: true });
      fs.writeFileSync(
        path.join(settingsDir, 'settings.json'),
        JSON.stringify({
          level1: {
            level2: {
              existing: true,
              override: 'old',
            },
          },
        })
      );

      await merger.mergeSettings({
        level1: {
          level2: {
            new: true,
            override: 'new',
          },
        },
      });

      const content = merger.getSettings();
      expect(content.level1.level2).toEqual({
        existing: true,
        new: true,
        override: 'new',
      });
    });

    it('should merge arrays with unique values', async () => {
      const settingsDir = path.join(tempDir, '.claude');
      fs.mkdirSync(settingsDir, { recursive: true });
      fs.writeFileSync(
        path.join(settingsDir, 'settings.json'),
        JSON.stringify({ permissions: ['read', 'write'] })
      );

      await merger.mergeSettings({ permissions: ['write', 'execute'] });

      const content = merger.getSettings();
      expect(content.permissions).toEqual(['read', 'write', 'execute']);
    });
  });

  describe('getSettings', () => {
    it('should return empty object if file does not exist', () => {
      const settings = merger.getSettings();
      expect(settings).toEqual({});
    });

    it('should return parsed settings', () => {
      const settingsDir = path.join(tempDir, '.claude');
      fs.mkdirSync(settingsDir, { recursive: true });
      fs.writeFileSync(
        path.join(settingsDir, 'settings.json'),
        JSON.stringify({ key: 'value' })
      );

      const settings = merger.getSettings();
      expect(settings).toEqual({ key: 'value' });
    });

    it('should return empty object for invalid JSON', () => {
      const settingsDir = path.join(tempDir, '.claude');
      fs.mkdirSync(settingsDir, { recursive: true });
      fs.writeFileSync(path.join(settingsDir, 'settings.json'), 'not json');

      const settings = merger.getSettings();
      expect(settings).toEqual({});
    });
  });

  describe('addMcpServer', () => {
    it('should add MCP server configuration', async () => {
      await merger.addMcpServer('test-mcp', {
        command: 'node',
        args: ['server.js'],
        env: { API_KEY: 'xxx' },
      });

      const settings = merger.getSettings();
      expect(settings.mcps).toEqual({
        'test-mcp': {
          command: 'node',
          args: ['server.js'],
          env: { API_KEY: 'xxx' },
        },
      });
    });

    it('should add multiple MCP servers', async () => {
      await merger.addMcpServer('mcp1', { command: 'cmd1' });
      await merger.addMcpServer('mcp2', { command: 'cmd2' });

      const settings = merger.getSettings();
      expect(Object.keys(settings.mcps || {})).toHaveLength(2);
    });
  });

  describe('removeMcpServer', () => {
    it('should remove MCP server configuration', async () => {
      await merger.addMcpServer('test-mcp', { command: 'test' });
      await merger.removeMcpServer('test-mcp');

      const settings = merger.getSettings();
      expect(settings.mcps?.['test-mcp']).toBeUndefined();
    });

    it('should handle removing non-existent server', async () => {
      await expect(
        merger.removeMcpServer('non-existent')
      ).resolves.not.toThrow();
    });
  });

  describe('addPermissions', () => {
    it('should add permissions for a component', async () => {
      await merger.addPermissions('my-component', ['read', 'write', 'execute']);

      const settings = merger.getSettings();
      expect(settings.permissions?.['my-component']).toEqual([
        'read',
        'write',
        'execute',
      ]);
    });
  });

  describe('backup and restore', () => {
    it('should create a backup of settings', async () => {
      await merger.mergeSettings({ key: 'value' });
      const backupPath = await merger.backup();

      expect(backupPath).not.toBeNull();
      expect(fs.existsSync(backupPath!)).toBe(true);

      const backupContent = JSON.parse(fs.readFileSync(backupPath!, 'utf-8'));
      expect(backupContent).toEqual({ key: 'value' });
    });

    it('should return null if no settings to backup', async () => {
      const backupPath = await merger.backup();
      expect(backupPath).toBeNull();
    });

    it('should restore settings from backup', async () => {
      await merger.mergeSettings({ original: 'value' });
      const backupPath = await merger.backup();

      await merger.mergeSettings({ new: 'value', original: 'changed' });

      await merger.restore(backupPath!);

      const settings = merger.getSettings();
      expect(settings).toEqual({ original: 'value' });
    });

    it('should throw error for non-existent backup', async () => {
      await expect(merger.restore('/non/existent/path')).rejects.toThrow(
        'Backup not found'
      );
    });
  });
});
