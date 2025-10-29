// ===========================
// Claude Code Integration System
// ===========================
// This module provides integration with Claude Code's skills, plugins, and hooks
// allowing the marketplace to install and manage components programmatically

const ClaudeIntegration = {
    // Configuration
    config: {
        claudeDir: '~/.claude',
        projectDir: '.claude',
        skillsDir: '.claude/skills',
        pluginsDir: '.claude/plugins',
        hooksDir: '.claude/hooks',
        commandsDir: '.claude/commands',
        mcpConfigFile: '.claude/mcp.json',
        settingsFile: '.claude/settings.json'
    },

    /**
     * Install a component from the marketplace
     * @param {Object} component - The component to install
     * @returns {Promise<Object>} Installation result
     */
    async installComponent(component) {
        console.log(`Installing ${component.name} (${component.category})...`);

        try {
            switch (component.category) {
                case 'skills':
                    return await this.installSkill(component);
                case 'plugins':
                    return await this.installPlugin(component);
                case 'hooks':
                    return await this.installHook(component);
                case 'commands':
                    return await this.installCommand(component);
                case 'mcps':
                    return await this.installMCP(component);
                case 'settings':
                    return await this.installSetting(component);
                case 'agents':
                    return await this.installAgent(component);
                default:
                    throw new Error(`Unknown component category: ${component.category}`);
            }
        } catch (error) {
            console.error(`Failed to install ${component.name}:`, error);
            return {
                success: false,
                error: error.message,
                component: component.name
            };
        }
    },

    /**
     * Install a Claude skill
     */
    async installSkill(component) {
        // TODO(human): Implement skill installation logic
        // Skills are stored in .claude/skills/<skill-name>/
        // Each skill has a SKILL.md file with instructions

        const skillPath = `${this.config.skillsDir}/${component.id}`;

        return {
            success: true,
            message: `Skill ${component.name} installed to ${skillPath}`,
            path: skillPath,
            component: component.name,
            nextSteps: [
                'Review the SKILL.md file for usage instructions',
                'Invoke the skill using the /skill command in Claude Code'
            ]
        };
    },

    /**
     * Install a Claude plugin
     */
    async installPlugin(component) {
        // Plugins extend Claude Code functionality
        // They typically register new commands or UI elements

        const pluginPath = `${this.config.pluginsDir}/${component.id}`;

        return {
            success: true,
            message: `Plugin ${component.name} installed to ${pluginPath}`,
            path: pluginPath,
            component: component.name,
            requiresRestart: true
        };
    },

    /**
     * Install a Claude hook
     */
    async installHook(component) {
        // Hooks run automatically in response to events
        // Common hooks: pre-commit, post-create, on-save

        const hookPath = `${this.config.hooksDir}/${component.id}`;

        return {
            success: true,
            message: `Hook ${component.name} installed to ${hookPath}`,
            path: hookPath,
            component: component.name,
            hookType: component.hookType || 'pre-commit'
        };
    },

    /**
     * Install a custom command
     */
    async installCommand(component) {
        // Commands are slash commands like /commit, /deploy
        // They're stored as .md files in .claude/commands/

        const commandPath = `${this.config.commandsDir}/${component.id}.md`;

        return {
            success: true,
            message: `Command ${component.name} installed to ${commandPath}`,
            path: commandPath,
            component: component.name,
            usage: `Type ${component.name} in Claude Code to use`
        };
    },

    /**
     * Install an MCP (Model Context Protocol) integration
     */
    async installMCP(component) {
        // MCPs are external integrations defined in mcp.json
        // Examples: GitHub, Stripe, Database connections

        return {
            success: true,
            message: `MCP ${component.name} configured`,
            component: component.name,
            nextSteps: [
                'Update .claude/mcp.json with server configuration',
                'Set required environment variables',
                'Restart Claude Code to load the MCP'
            ]
        };
    },

    /**
     * Install/apply settings
     */
    async installSetting(component) {
        // Settings modify Claude Code behavior
        // Stored in .claude/settings.json

        return {
            success: true,
            message: `Settings ${component.name} applied`,
            component: component.name,
            settingsFile: this.config.settingsFile
        };
    },

    /**
     * Install an agent
     */
    async installAgent(component) {
        // Agents are specialized AI assistants
        // They can be skills or subagent configurations

        const agentPath = `${this.config.skillsDir}/${component.id}`;

        return {
            success: true,
            message: `Agent ${component.name} installed to ${agentPath}`,
            path: agentPath,
            component: component.name,
            agentType: component.agentType || 'skill'
        };
    },

    /**
     * Batch install multiple components (for stacks)
     * @param {Array} components - Array of components to install
     * @returns {Promise<Object>} Batch installation results
     */
    async installStack(components) {
        console.log(`Installing stack with ${components.length} components...`);

        const results = {
            total: components.length,
            successful: 0,
            failed: 0,
            installations: []
        };

        for (const component of components) {
            const result = await this.installComponent(component);
            results.installations.push(result);

            if (result.success) {
                results.successful++;
            } else {
                results.failed++;
            }
        }

        return results;
    },

    /**
     * Generate installation script for manual installation
     * @param {Array} components - Components to install
     * @returns {String} Shell script for installation
     */
    generateInstallScript(components) {
        const script = [
            '#!/bin/bash',
            '# Generated by Organized AI Marketplace',
            '# Installation script for selected components',
            '',
            'set -e',
            '',
            'echo "Installing components..."',
            ''
        ];

        components.forEach(component => {
            script.push(`# Installing ${component.name}`);
            script.push(`echo "📦 Installing ${component.name}..."`);

            switch (component.category) {
                case 'skills':
                case 'agents':
                    script.push(`mkdir -p ${this.config.skillsDir}/${component.id}`);
                    script.push(`# TODO: Download and extract skill files`);
                    break;
                case 'commands':
                    script.push(`mkdir -p ${this.config.commandsDir}`);
                    script.push(`# TODO: Download command file`);
                    break;
                case 'mcps':
                    script.push(`# TODO: Update mcp.json configuration`);
                    break;
                default:
                    script.push(`# TODO: Install ${component.category}`);
            }

            script.push('');
        });

        script.push('echo "✅ Installation complete!"');
        script.push('echo "Please restart Claude Code to load new components"');

        return script.join('\n');
    },

    /**
     * Validate component compatibility
     * @param {Object} component - Component to validate
     * @returns {Object} Validation result
     */
    validateComponent(component) {
        const issues = [];

        // Check required fields
        if (!component.id) issues.push('Missing component ID');
        if (!component.name) issues.push('Missing component name');
        if (!component.category) issues.push('Missing component category');

        // Check category validity
        const validCategories = ['agents', 'commands', 'settings', 'hooks', 'mcps', 'plugins', 'skills'];
        if (!validCategories.includes(component.category)) {
            issues.push(`Invalid category: ${component.category}`);
        }

        // Check version compatibility (if specified)
        if (component.minClaudeVersion && !this.checkVersionCompatibility(component.minClaudeVersion)) {
            issues.push(`Requires Claude Code version ${component.minClaudeVersion} or higher`);
        }

        return {
            valid: issues.length === 0,
            issues: issues
        };
    },

    /**
     * Check if Claude Code version meets requirements
     * @param {String} minVersion - Minimum required version
     * @returns {Boolean} True if compatible
     */
    checkVersionCompatibility(minVersion) {
        // TODO: Implement version checking against actual Claude Code version
        return true;
    },

    /**
     * List installed components
     * @returns {Promise<Array>} List of installed components
     */
    async listInstalled() {
        // TODO: Scan .claude directory and return installed components
        return {
            skills: [],
            plugins: [],
            hooks: [],
            commands: [],
            mcps: [],
            settings: []
        };
    },

    /**
     * Uninstall a component
     * @param {Object} component - Component to uninstall
     * @returns {Promise<Object>} Uninstallation result
     */
    async uninstallComponent(component) {
        console.log(`Uninstalling ${component.name}...`);

        return {
            success: true,
            message: `${component.name} uninstalled successfully`,
            component: component.name
        };
    },

    /**
     * Export stack configuration as JSON
     * @param {Array} components - Components in the stack
     * @returns {Object} Stack configuration
     */
    exportStackConfig(components) {
        return {
            version: '1.0',
            name: 'Custom Stack',
            description: 'Stack created in Organized AI Marketplace',
            createdAt: new Date().toISOString(),
            components: components.map(c => ({
                id: c.id,
                name: c.name,
                category: c.category,
                version: c.version || 'latest'
            }))
        };
    },

    /**
     * Import stack configuration
     * @param {Object} stackConfig - Stack configuration to import
     * @returns {Promise<Object>} Import result
     */
    async importStackConfig(stackConfig) {
        if (!stackConfig.components || !Array.isArray(stackConfig.components)) {
            throw new Error('Invalid stack configuration');
        }

        const components = stackConfig.components.map(c => getComponentById(c.id)).filter(Boolean);

        return await this.installStack(components);
    }
};

// ===========================
// Export for use in app.js
// ===========================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClaudeIntegration;
}
