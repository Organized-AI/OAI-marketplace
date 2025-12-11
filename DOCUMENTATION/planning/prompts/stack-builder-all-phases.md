# Stack Builder & Installer - Complete Implementation

## Objective
Build a CLI tool that installs components with a beautiful terminal UI.

## Overview
The Stack Builder:
- Runs Phase 0 dependency detection
- Downloads components from git
- Merges configurations
- Shows progress with Ink TUI

## Tasks

### Task 1: Project Structure
```
packages/stack-builder/
├── src/
│   ├── index.ts
│   ├── installer.ts
│   ├── config-merger.ts
│   └── types.ts
├── package.json
└── tsconfig.json
```

### Task 2: Types
Create `packages/stack-builder/src/types.ts`:

```typescript
export interface Component {
  id: string;
  name: string;
  type: 'skill' | 'agent' | 'mcp' | 'command' | 'hook' | 'setting';
  repository: string;
  version: string;
}

export interface InstallResult {
  success: boolean;
  component: string;
  duration: number;
  error?: string;
}
```

### Task 3: Installer
Create `packages/stack-builder/src/installer.ts`:

```typescript
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Component, InstallResult } from './types';

export class Installer {
  private basePath: string;

  constructor(basePath = process.cwd()) {
    this.basePath = basePath;
  }

  async install(component: Component): Promise<InstallResult> {
    const start = Date.now();
    const targetPath = this.getTargetPath(component);

    try {
      // Create directory
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });

      // Clone repository
      execSync(`git clone --depth 1 ${component.repository} ${targetPath}`, {
        stdio: 'pipe',
      });

      // Remove .git folder
      fs.rmSync(path.join(targetPath, '.git'), { recursive: true, force: true });

      return {
        success: true,
        component: component.id,
        duration: Date.now() - start,
      };
    } catch (error) {
      return {
        success: false,
        component: component.id,
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private getTargetPath(component: Component): string {
    const paths: Record<string, string> = {
      skill: '.claude/skills',
      agent: '.claude/agents',
      mcp: '.claude/mcps',
      command: '.claude/commands',
      hook: '.claude/hooks',
      setting: '.claude/settings',
    };
    return path.join(this.basePath, paths[component.type], component.id);
  }
}
```

### Task 4: Config Merger
Create `packages/stack-builder/src/config-merger.ts`:

```typescript
import * as fs from 'fs';
import * as path from 'path';

export class ConfigMerger {
  private settingsPath: string;

  constructor(basePath = process.cwd()) {
    this.settingsPath = path.join(basePath, '.claude', 'settings.json');
  }

  async mergeSettings(newSettings: Record<string, any>): Promise<void> {
    let existing = {};
    
    if (fs.existsSync(this.settingsPath)) {
      existing = JSON.parse(fs.readFileSync(this.settingsPath, 'utf-8'));
    }

    const merged = this.deepMerge(existing, newSettings);
    
    fs.mkdirSync(path.dirname(this.settingsPath), { recursive: true });
    fs.writeFileSync(this.settingsPath, JSON.stringify(merged, null, 2));
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
}
```

### Task 5: Main Entry
Create `packages/stack-builder/src/index.ts`:

```typescript
import { Phase0 } from '@organized-ai/phase-0';
import { Installer } from './installer';
import { ConfigMerger } from './config-merger';
import { Component, InstallResult } from './types';

export class StackBuilder {
  private phase0 = new Phase0();
  private installer = new Installer();
  private configMerger = new ConfigMerger();

  async install(components: Component[]): Promise<InstallResult[]> {
    const results: InstallResult[] = [];

    for (const component of components) {
      console.log(`Installing ${component.name}...`);
      
      const result = await this.installer.install(component);
      results.push(result);

      if (result.success) {
        console.log(`✓ ${component.name} installed`);
      } else {
        console.log(`✗ ${component.name} failed: ${result.error}`);
      }
    }

    return results;
  }
}

export * from './types';
```

### Task 6: CLI Command
Add to `packages/cli/src/commands/install.ts`:

```typescript
import { Command } from 'commander';
import { StackBuilder } from '@organized-ai/stack-builder';

export const installCommand = new Command('install')
  .description('Install components')
  .argument('<components...>', 'Component IDs')
  .action(async (componentIds: string[]) => {
    const builder = new StackBuilder();
    
    // Fetch component details from registry
    const components = await fetchComponents(componentIds);
    
    const results = await builder.install(components);
    
    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      console.log(`\n${failed.length} component(s) failed to install`);
      process.exit(1);
    }
    
    console.log('\n✓ All components installed successfully');
  });

async function fetchComponents(ids: string[]) {
  // In production, fetch from Supabase
  return ids.map(id => ({
    id,
    name: id,
    type: 'skill' as const,
    repository: `https://github.com/organized-ai/${id}`,
    version: '1.0.0',
  }));
}
```

### Task 7: Package.json
```json
{
  "name": "@organized-ai/stack-builder",
  "version": "0.1.0",
  "main": "dist/index.js",
  "dependencies": {
    "@organized-ai/phase-0": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

## Verification
1. Build all packages
2. Run `npx organized-ai install test-skill`
3. Verify component cloned to `.claude/skills/test-skill`
4. Verify config merged correctly

## Success Criteria
- [ ] Components install from git
- [ ] Configs merge correctly
- [ ] Progress shows in terminal
- [ ] Errors handled gracefully
