# Phase 0 Dependency Resolution - Complete Implementation

## Objective
Build a dependency detection system that identifies missing requirements before component installation.

## Overview
Phase 0 detects:
- Environment variables (missing API keys)
- NPM packages (missing dependencies)
- System tools (git, node, docker)
- Runtime versions (node >= 18)
- Credentials (via Organized Credentials)

## Tasks

### Task 1: Project Structure
Create `packages/phase-0/`:
```
packages/phase-0/
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── detector.ts
│   ├── detectors/
│   │   ├── env.ts
│   │   ├── npm.ts
│   │   ├── system.ts
│   │   └── credential.ts
│   └── resolver.ts
├── package.json
└── tsconfig.json
```

### Task 2: Types
Create `packages/phase-0/src/types.ts`:

```typescript
export type DependencyType = 'env' | 'npm' | 'system' | 'runtime' | 'credential';
export type DependencyStatus = 'present' | 'missing' | 'invalid' | 'outdated';

export interface Dependency {
  type: DependencyType;
  name: string;
  required: boolean;
  status: DependencyStatus;
  currentValue?: string;
  requiredValue?: string;
  error?: string;
}

export interface DetectionResult {
  component: string;
  dependencies: Dependency[];
  allSatisfied: boolean;
  missingRequired: Dependency[];
}

export interface ComponentManifest {
  name: string;
  version: string;
  dependencies?: {
    env?: Record<string, { required?: boolean; description?: string }>;
    npm?: Record<string, string>;
    system?: string[];
  };
}
```

### Task 3: Environment Detector
Create `packages/phase-0/src/detectors/env.ts`:

```typescript
import { Dependency } from '../types';

export class EnvDetector {
  detect(requirements: Record<string, { required?: boolean; pattern?: string }>): Dependency[] {
    return Object.entries(requirements).map(([name, config]) => {
      const value = process.env[name];
      const required = config.required ?? true;

      if (!value) {
        return { type: 'env', name, required, status: 'missing' };
      }

      if (config.pattern && !new RegExp(config.pattern).test(value)) {
        return { type: 'env', name, required, status: 'invalid', error: 'Format mismatch' };
      }

      return { type: 'env', name, required, status: 'present' };
    });
  }
}
```

### Task 4: NPM Detector
Create `packages/phase-0/src/detectors/npm.ts`:

```typescript
import { execSync } from 'child_process';
import { Dependency } from '../types';

export class NpmDetector {
  detect(requirements: Record<string, string>): Dependency[] {
    let installed: Record<string, string> = {};
    try {
      const output = execSync('npm ls --json --depth=0', { encoding: 'utf-8' });
      const parsed = JSON.parse(output);
      installed = Object.fromEntries(
        Object.entries(parsed.dependencies || {}).map(([n, i]: [string, any]) => [n, i.version])
      );
    } catch {}

    return Object.entries(requirements).map(([name, version]) => {
      const current = installed[name];
      if (!current) {
        return { type: 'npm', name, required: true, status: 'missing', requiredValue: version };
      }
      return { type: 'npm', name, required: true, status: 'present', currentValue: current };
    });
  }
}
```

### Task 5: System Detector
Create `packages/phase-0/src/detectors/system.ts`:

```typescript
import { execSync } from 'child_process';
import { Dependency } from '../types';

export class SystemDetector {
  private commands: Record<string, string> = {
    git: 'git --version',
    node: 'node --version',
    pnpm: 'pnpm --version',
    docker: 'docker --version',
    supabase: 'supabase --version',
  };

  detect(tools: string[]): Dependency[] {
    return tools.map(tool => {
      const cmd = this.commands[tool] || `${tool} --version`;
      try {
        const output = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
        const version = output.match(/(\d+\.\d+\.\d+)/)?.[1] || output.trim().slice(0, 20);
        return { type: 'system', name: tool, required: true, status: 'present', currentValue: version };
      } catch {
        return { type: 'system', name: tool, required: true, status: 'missing' };
      }
    });
  }
}
```

### Task 6: Main Detector
Create `packages/phase-0/src/index.ts`:

```typescript
import { ComponentManifest, DetectionResult } from './types';
import { EnvDetector } from './detectors/env';
import { NpmDetector } from './detectors/npm';
import { SystemDetector } from './detectors/system';

export class Phase0 {
  private envDetector = new EnvDetector();
  private npmDetector = new NpmDetector();
  private systemDetector = new SystemDetector();

  async detect(manifest: ComponentManifest): Promise<DetectionResult> {
    const dependencies = [];

    if (manifest.dependencies?.env) {
      dependencies.push(...this.envDetector.detect(manifest.dependencies.env));
    }
    if (manifest.dependencies?.npm) {
      dependencies.push(...this.npmDetector.detect(manifest.dependencies.npm));
    }
    if (manifest.dependencies?.system) {
      dependencies.push(...this.systemDetector.detect(manifest.dependencies.system));
    }

    const missingRequired = dependencies.filter(d => d.required && d.status !== 'present');

    return {
      component: manifest.name,
      dependencies,
      allSatisfied: missingRequired.length === 0,
      missingRequired,
    };
  }
}

export * from './types';
```

### Task 7: Package.json
```json
{
  "name": "@organized-ai/phase-0",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": { "build": "tsc" },
  "devDependencies": { "typescript": "^5.3.0" }
}
```

## Verification
1. Create test manifest with various dependencies
2. Run detection - verify it finds missing items
3. Install a missing package - verify status changes
4. Test with real component manifest

## Success Criteria
- [ ] Detects missing env vars
- [ ] Detects missing npm packages  
- [ ] Detects missing system tools
- [ ] Returns actionable results
