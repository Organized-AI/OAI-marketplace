/**
 * Installer Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Installer } from '../src/installer';
import type { Component, ComponentType } from '../src/types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Installer', () => {
  let tempDir: string;
  let installer: Installer;

  const createComponent = (
    id: string,
    type: ComponentType = 'skill'
  ): Component => ({
    id,
    name: `Test ${id}`,
    type,
    repository: 'https://github.com/example/repo',
    version: '1.0.0',
  });

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'installer-test-'));
    installer = new Installer(tempDir);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('getTargetPath', () => {
    it.each([
      ['skill', '.claude/skills'],
      ['agent', '.claude/agents'],
      ['subagent', '.claude/agents'],
      ['mcp', '.claude/mcps'],
      ['command', '.claude/commands'],
      ['hook', '.claude/hooks'],
      ['setting', '.claude/settings'],
    ])('should return correct path for %s type', (type, expectedDir) => {
      const component = createComponent('test-id', type as ComponentType);
      const targetPath = installer.getTargetPath(component);

      expect(targetPath).toBe(path.join(tempDir, expectedDir, 'test-id'));
    });
  });

  describe('isInstalled', () => {
    it('should return false for non-existent component', () => {
      const component = createComponent('not-installed');
      expect(installer.isInstalled(component)).toBe(false);
    });

    it('should return true for installed component', () => {
      const component = createComponent('installed');
      const targetPath = installer.getTargetPath(component);

      fs.mkdirSync(targetPath, { recursive: true });

      expect(installer.isInstalled(component)).toBe(true);
    });
  });

  describe('install', () => {
    it('should fail if component already exists', async () => {
      const component = createComponent('existing');
      const targetPath = installer.getTargetPath(component);

      fs.mkdirSync(targetPath, { recursive: true });

      const result = await installer.install(component);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    // Note: Full git clone tests would require network access
    // or mocking execSync. Here we test the error handling.
    it('should return error for invalid repository', async () => {
      const component = createComponent('invalid-repo');
      component.repository = 'not-a-valid-url';

      const result = await installer.install(component);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should clean up on failure', async () => {
      const component = createComponent('cleanup-test');
      component.repository = 'invalid://not-real';

      await installer.install(component);

      const targetPath = installer.getTargetPath(component);
      expect(fs.existsSync(targetPath)).toBe(false);
    });
  });

  describe('uninstall', () => {
    it('should remove installed component', async () => {
      const component = createComponent('to-uninstall');
      const targetPath = installer.getTargetPath(component);

      fs.mkdirSync(targetPath, { recursive: true });
      fs.writeFileSync(path.join(targetPath, 'test.txt'), 'content');

      const result = await installer.uninstall(component);

      expect(result.success).toBe(true);
      expect(fs.existsSync(targetPath)).toBe(false);
    });

    it('should fail for non-existent component', async () => {
      const component = createComponent('non-existent');

      const result = await installer.uninstall(component);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('listInstalled', () => {
    it('should return empty array for empty directory', () => {
      const installed = installer.listInstalled('skill');
      expect(installed).toEqual([]);
    });

    it('should list installed components', () => {
      const skillsDir = path.join(tempDir, '.claude', 'skills');
      fs.mkdirSync(path.join(skillsDir, 'skill-one'), { recursive: true });
      fs.mkdirSync(path.join(skillsDir, 'skill-two'), { recursive: true });
      // Create a file (should be ignored)
      fs.writeFileSync(path.join(skillsDir, 'not-a-skill.txt'), 'content');

      const installed = installer.listInstalled('skill');

      expect(installed).toHaveLength(2);
      expect(installed).toContain('skill-one');
      expect(installed).toContain('skill-two');
    });

    it('should only list directories', () => {
      const agentsDir = path.join(tempDir, '.claude', 'agents');
      fs.mkdirSync(path.join(agentsDir, 'real-agent'), { recursive: true });
      fs.writeFileSync(path.join(agentsDir, 'file.txt'), 'not a dir');

      const installed = installer.listInstalled('agent');

      expect(installed).toHaveLength(1);
      expect(installed[0]).toBe('real-agent');
    });
  });

  describe('reinstall', () => {
    it('should remove existing and attempt install', async () => {
      const component = createComponent('reinstall-test');
      const targetPath = installer.getTargetPath(component);

      // Create existing installation
      fs.mkdirSync(targetPath, { recursive: true });
      fs.writeFileSync(path.join(targetPath, 'old-file.txt'), 'old');

      // Reinstall will fail due to invalid repo, but should remove existing
      component.repository = 'invalid://url';
      const result = await installer.reinstall(component);

      // Even if install fails, the old installation should be removed first
      expect(result.success).toBe(false);
      // The error should be about the repo, not about existing installation
      expect(result.error).not.toContain('already exists');
    });
  });
});

describe('Installer - InstallResult', () => {
  it('should include duration in results', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'duration-test-'));
    const installer = new Installer(tempDir);

    try {
      const component: Component = {
        id: 'duration-test',
        name: 'Duration Test',
        type: 'skill',
        repository: 'invalid://test',
        version: '1.0.0',
      };

      const result = await installer.install(component);

      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(typeof result.duration).toBe('number');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
