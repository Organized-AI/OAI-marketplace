/**
 * Agent-Subagent Stack Prompt Generator
 *
 * Generates ready-to-use prompts and configurations for agent stacks
 * with intelligent subagent orchestration.
 */

class PromptGenerator {
    constructor(marketplaceData) {
        this.data = marketplaceData;
    }

    /**
     * Generate a complete stack configuration with prompts
     * @param {string} agentId - Main agent ID
     * @param {string} taskDescription - User's task description
     * @returns {Object} Complete stack configuration
     */
    generateStack(agentId, taskDescription) {
        const agent = this.getAgentById(agentId);
        if (!agent || !agent.spawnsSubagents) {
            return {
                error: 'Agent not found or does not support subagent spawning'
            };
        }

        const orchestration = agent.spawnsSubagents;

        return {
            agent: {
                id: agent.id,
                name: agent.name,
                description: agent.description
            },
            task: taskDescription,
            orchestration: this.buildOrchestrationPlan(orchestration),
            prompt: this.generateMainPrompt(agent, orchestration, taskDescription),
            installCommand: this.generateInstallCommand(agent, orchestration),
            executionScript: this.generateExecutionScript(agent, orchestration, taskDescription),
            estimatedCost: this.estimateCost(orchestration),
            estimatedTime: this.estimateTime(orchestration)
        };
    }

    /**
     * Build detailed orchestration plan
     */
    buildOrchestrationPlan(orchestration) {
        return orchestration.sequential.map(group => ({
            groupNumber: group.group,
            executionMode: group.parallel ? 'parallel' : 'sequential',
            description: group.description || `Execution group ${group.group}`,
            subagents: group.subagents.map(sub => {
                const subagent = this.getSubagentById(sub.id);
                return {
                    id: sub.id,
                    name: subagent?.name || 'unknown',
                    icon: subagent?.icon || '🤖',
                    model: sub.model,
                    priority: sub.priority,
                    timeout: sub.timeout,
                    description: subagent?.description || ''
                };
            })
        }));
    }

    /**
     * Generate main orchestration prompt
     */
    generateMainPrompt(agent, orchestration, taskDescription) {
        let prompt = `# Agent Stack: ${agent.name}\n\n`;
        prompt += `## Task\n${taskDescription}\n\n`;
        prompt += `## Orchestration Plan\n\n`;
        prompt += `You are ${agent.name}. ${agent.description}\n\n`;
        prompt += `For this task, you will coordinate with ${this.countSubagents(orchestration)} specialized subagents across ${orchestration.sequential.length} execution phases.\n\n`;

        orchestration.sequential.forEach(group => {
            prompt += `### Phase ${group.group}: ${group.description}\n`;
            prompt += `**Execution Mode**: ${group.parallel ? 'Parallel' : 'Sequential'}\n\n`;

            group.subagents.forEach(sub => {
                const subagent = this.getSubagentById(sub.id);
                prompt += `- **${subagent?.name || sub.id}** (${sub.model}, ${sub.priority} priority)\n`;
                prompt += `  ${subagent?.description || ''}\n\n`;
            });
        });

        prompt += `## Workflow\n\n`;
        prompt += this.generateWorkflowInstructions(orchestration);

        return prompt;
    }

    /**
     * Generate workflow instructions
     */
    generateWorkflowInstructions(orchestration) {
        let instructions = '';

        orchestration.sequential.forEach(group => {
            instructions += `**Phase ${group.group}:**\n`;

            if (group.parallel) {
                instructions += `Execute the following subagents in parallel:\n`;
                group.subagents.forEach(sub => {
                    const subagent = this.getSubagentById(sub.id);
                    instructions += `- Spawn \`${subagent?.name}\` using ${sub.model} model\n`;
                });
            } else {
                instructions += `Execute the following subagents sequentially:\n`;
                group.subagents.forEach((sub, index) => {
                    const subagent = this.getSubagentById(sub.id);
                    instructions += `${index + 1}. Spawn \`${subagent?.name}\` using ${sub.model} model\n`;
                });
            }

            instructions += `\nWait for all Phase ${group.group} subagents to complete before proceeding.\n\n`;
        });

        return instructions;
    }

    /**
     * Generate install command for the stack
     */
    generateInstallCommand(agent, orchestration) {
        const subagentIds = this.extractSubagentIds(orchestration);
        const allIds = [agent.id, ...subagentIds];

        return {
            npm: `npx claude-code-templates@latest --stack ${allIds.join(',')}`,
            individual: allIds.map(id => `npx claude-code-templates@latest --component ${id} --yes`).join(' && ')
        };
    }

    /**
     * Generate execution script for Claude Agent SDK
     */
    generateExecutionScript(agent, orchestration, taskDescription) {
        let script = '#!/usr/bin/env node\n';
        script += '// Generated Agent Stack Execution Script\n\n';
        script += 'const { AgentSDK } = require(\'@anthropic-ai/sdk\');\n\n';
        script += 'async function executeStack() {\n';
        script += `  const mainAgent = new AgentSDK('${agent.id}');\n\n`;
        script += `  console.log('Starting agent stack: ${agent.name}');\n`;
        script += `  console.log('Task: ${taskDescription}');\n\n`;

        orchestration.sequential.forEach(group => {
            script += `  // Phase ${group.group}: ${group.description}\n`;
            script += `  console.log('\\n--- Phase ${group.group}: ${group.description} ---');\n`;

            if (group.parallel) {
                script += `  const phase${group.group}Results = await Promise.all([\n`;
                group.subagents.forEach(sub => {
                    const subagent = this.getSubagentById(sub.id);
                    script += `    mainAgent.spawn('${sub.id}', {\n`;
                    script += `      model: '${sub.model}',\n`;
                    script += `      priority: '${sub.priority}',\n`;
                    script += `      task: '${subagent?.description || ''}'\n`;
                    script += `    }),\n`;
                });
                script += `  ]);\n`;
                script += `  console.log('Phase ${group.group} completed:', phase${group.group}Results.length, 'subagents');\n\n`;
            } else {
                group.subagents.forEach((sub, index) => {
                    const subagent = this.getSubagentById(sub.id);
                    script += `  const result${group.group}_${index} = await mainAgent.spawn('${sub.id}', {\n`;
                    script += `    model: '${sub.model}',\n`;
                    script += `    priority: '${sub.priority}',\n`;
                    script += `    task: '${subagent?.description || ''}'\n`;
                    script += `  });\n`;
                    script += `  console.log('Completed: ${subagent?.name}');\n\n`;
                });
            }
        });

        script += `  console.log('\\n✓ Stack execution completed successfully!');\n`;
        script += '}\n\n';
        script += 'executeStack().catch(console.error);\n';

        return script;
    }

    /**
     * Estimate cost based on model usage
     */
    estimateCost(orchestration) {
        const modelCosts = {
            haiku: 0.25,   // $ per 1M input tokens (approximate)
            sonnet: 3.00,  // $ per 1M input tokens
            opus: 15.00    // $ per 1M input tokens
        };

        const avgTokens = 5000; // Estimated average tokens per subagent
        let totalCost = 0;

        orchestration.sequential.forEach(group => {
            group.subagents.forEach(sub => {
                const costPerMillion = modelCosts[sub.model] || modelCosts.sonnet;
                totalCost += (avgTokens / 1000000) * costPerMillion;
            });
        });

        return {
            estimated: totalCost.toFixed(4),
            currency: 'USD',
            breakdown: this.getCostBreakdown(orchestration, modelCosts, avgTokens)
        };
    }

    /**
     * Get detailed cost breakdown
     */
    getCostBreakdown(orchestration, modelCosts, avgTokens) {
        const breakdown = {
            haiku: { count: 0, cost: 0 },
            sonnet: { count: 0, cost: 0 },
            opus: { count: 0, cost: 0 }
        };

        orchestration.sequential.forEach(group => {
            group.subagents.forEach(sub => {
                breakdown[sub.model].count++;
                const costPerMillion = modelCosts[sub.model];
                breakdown[sub.model].cost += (avgTokens / 1000000) * costPerMillion;
            });
        });

        return Object.entries(breakdown)
            .filter(([_, data]) => data.count > 0)
            .map(([model, data]) => ({
                model,
                count: data.count,
                cost: data.cost.toFixed(4)
            }));
    }

    /**
     * Estimate execution time
     */
    estimateTime(orchestration) {
        const modelTimes = {
            haiku: 5,    // seconds
            sonnet: 15,  // seconds
            opus: 45     // seconds
        };

        let totalTime = 0;

        orchestration.sequential.forEach(group => {
            if (group.parallel) {
                // Parallel: take the longest subagent time
                const maxTime = Math.max(...group.subagents.map(sub =>
                    modelTimes[sub.model] || modelTimes.sonnet
                ));
                totalTime += maxTime;
            } else {
                // Sequential: sum all subagent times
                group.subagents.forEach(sub => {
                    totalTime += modelTimes[sub.model] || modelTimes.sonnet;
                });
            }
        });

        return {
            estimated: totalTime,
            unit: 'seconds',
            formatted: this.formatTime(totalTime)
        };
    }

    /**
     * Format time in human-readable format
     */
    formatTime(seconds) {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    }

    /**
     * Count total subagents
     */
    countSubagents(orchestration) {
        return orchestration.sequential.reduce((count, group) =>
            count + group.subagents.length, 0
        );
    }

    /**
     * Extract all subagent IDs
     */
    extractSubagentIds(orchestration) {
        const ids = [];
        orchestration.sequential.forEach(group => {
            group.subagents.forEach(sub => ids.push(sub.id));
        });
        return ids;
    }

    /**
     * Get agent by ID
     */
    getAgentById(id) {
        return this.data.agents?.find(a => a.id === id);
    }

    /**
     * Get subagent by ID
     */
    getSubagentById(id) {
        return this.data.subagents?.find(s => s.id === id);
    }

    /**
     * Generate markdown documentation for the stack
     */
    generateMarkdownDoc(stack) {
        let md = `# ${stack.agent.name} Stack\n\n`;
        md += `## Overview\n\n`;
        md += `${stack.agent.description}\n\n`;
        md += `**Task**: ${stack.task}\n\n`;

        md += `## 📊 Stack Statistics\n\n`;
        md += `- **Total Subagents**: ${this.countSubagents(stack.orchestration)}\n`;
        md += `- **Execution Phases**: ${stack.orchestration.sequential.length}\n`;
        md += `- **Estimated Cost**: $${stack.estimatedCost.estimated}\n`;
        md += `- **Estimated Time**: ${stack.estimatedTime.formatted}\n\n`;

        md += `## 🔄 Orchestration Plan\n\n`;
        stack.orchestration.forEach(phase => {
            md += `### Phase ${phase.groupNumber}: ${phase.description}\n\n`;
            md += `**Execution Mode**: ${phase.executionMode}\n\n`;
            phase.subagents.forEach(sub => {
                md += `- ${sub.icon} **${sub.name}**\n`;
                md += `  - Model: \`${sub.model}\`\n`;
                md += `  - Priority: \`${sub.priority}\`\n`;
                md += `  - ${sub.description}\n\n`;
            });
        });

        md += `## 💰 Cost Breakdown\n\n`;
        md += `| Model | Count | Cost |\n`;
        md += `|-------|-------|------|\n`;
        stack.estimatedCost.breakdown.forEach(item => {
            md += `| ${item.model} | ${item.count} | $${item.cost} |\n`;
        });
        md += `| **Total** | | **$${stack.estimatedCost.estimated}** |\n\n`;

        md += `## 📦 Installation\n\n`;
        md += `\`\`\`bash\n`;
        md += `${stack.installCommand.npm}\n`;
        md += `\`\`\`\n\n`;

        md += `## 🚀 Execution\n\n`;
        md += `\`\`\`javascript\n`;
        md += stack.executionScript;
        md += `\`\`\`\n\n`;

        md += `## 📝 Main Prompt\n\n`;
        md += `\`\`\`\n`;
        md += stack.prompt;
        md += `\`\`\`\n`;

        return md;
    }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PromptGenerator;
}
if (typeof window !== 'undefined') {
    window.PromptGenerator = PromptGenerator;
}
