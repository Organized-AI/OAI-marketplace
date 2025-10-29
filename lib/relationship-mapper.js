/**
 * Agent-Subagent Relationship Mapper
 *
 * Creates dynamic visual relationships between agents and subagents
 * based on naming patterns, categories, and functional domains.
 */

class RelationshipMapper {
    constructor() {
        // Define relationship rules based on domain logic
        this.relationshipRules = {
            // Development agents -> related subagents
            'frontend-developer': [
                'core-development-frontend-developer',
                'language-specialists-typescript-pro',
                'language-specialists-react-specialist',
                'quality-security-code-reviewer',
                'quality-security-performance-engineer',
                'quality-security-qa-expert'
            ],
            'backend-developer': [
                'core-development-backend-developer',
                'core-development-api-designer',
                'quality-security-code-reviewer',
                'quality-security-security-auditor',
                'quality-security-performance-engineer',
                'data-ai-database-optimizer'
            ],
            'fullstack-developer': [
                'core-development-fullstack-developer',
                'core-development-frontend-developer',
                'core-development-backend-developer',
                'core-development-api-designer',
                'quality-security-code-reviewer'
            ],

            // Infrastructure agents -> infrastructure subagents
            'devops-engineer': [
                'infrastructure-devops-engineer',
                'infrastructure-terraform-engineer',
                'infrastructure-kubernetes-specialist',
                'infrastructure-sre-engineer',
                'quality-security-security-auditor'
            ],
            'cloud-architect': [
                'infrastructure-cloud-architect',
                'infrastructure-terraform-engineer',
                'infrastructure-kubernetes-specialist',
                'infrastructure-sre-engineer',
                'quality-security-security-auditor'
            ],

            // AI/ML agents -> data-ai subagents
            'ai-engineer': [
                'data-ai-ai-engineer',
                'data-ai-machine-learning-engineer',
                'data-ai-nlp-engineer',
                'data-ai-data-engineer',
                'quality-security-performance-engineer'
            ],
            'data-scientist': [
                'data-ai-data-scientist',
                'data-ai-data-engineer',
                'research-analysis-research-analyst',
                'research-analysis-data-researcher'
            ],

            // Security agents -> security subagents
            'security-engineer': [
                'quality-security-security-auditor',
                'quality-security-penetration-tester',
                'quality-security-code-reviewer',
                'infrastructure-sre-engineer'
            ],

            // Product/Business agents -> business subagents
            'product-manager': [
                'business-product-product-manager',
                'business-product-business-analyst',
                'research-analysis-market-researcher',
                'research-analysis-competitive-analyst',
                'research-analysis-trend-analyst'
            ],
            'project-manager': [
                'business-product-project-manager',
                'business-product-business-analyst',
                'meta-orchestration-workflow-orchestrator',
                'meta-orchestration-task-distributor'
            ]
        };

        // Category-based fallback relationships
        this.categoryMappings = {
            'development-team': ['core-development', 'quality-security'],
            'ai-specialists': ['data-ai', 'research-analysis'],
            'cloud-infrastructure': ['infrastructure', 'quality-security'],
            'database': ['data-ai', 'quality-security'],
            'security': ['quality-security'],
            'testing': ['quality-security', 'developer-experience']
        };
    }

    /**
     * Find related subagents for a given agent
     * @param {Object} agent - Agent object
     * @param {Array} allSubagents - All available subagents
     * @returns {Array} Related subagents
     */
    findRelatedSubagents(agent, allSubagents) {
        const related = [];

        // 1. Check explicit rules by agent name
        if (this.relationshipRules[agent.name]) {
            const subagentNames = this.relationshipRules[agent.name];
            subagentNames.forEach(name => {
                const subagent = allSubagents.find(s =>
                    s.id.includes(name) || s.name === name.split('-').pop()
                );
                if (subagent && !related.includes(subagent)) {
                    related.push({
                        ...subagent,
                        relationshipType: 'explicit',
                        matchReason: 'Domain expertise'
                    });
                }
            });
        }

        // 2. Check category-based relationships
        const categoryMatches = this.categoryMappings[agent.subCategory] || [];
        categoryMatches.forEach(subCategory => {
            const matches = allSubagents.filter(s =>
                s.subCategory === subCategory &&
                !related.some(r => r.id === s.id)
            );
            matches.forEach(match => {
                related.push({
                    ...match,
                    relationshipType: 'category',
                    matchReason: `Complementary ${subCategory} expertise`
                });
            });
        });

        // 3. Check tag overlap (find subagents with similar tags)
        const agentTags = agent.tags || [];
        allSubagents.forEach(subagent => {
            if (related.some(r => r.id === subagent.id)) return;

            const subagentTags = subagent.tags || [];
            const commonTags = agentTags.filter(tag =>
                subagentTags.some(st => st.toLowerCase().includes(tag.toLowerCase()) ||
                    tag.toLowerCase().includes(st.toLowerCase()))
            );

            if (commonTags.length >= 2) {
                related.push({
                    ...subagent,
                    relationshipType: 'tags',
                    matchReason: `Shared expertise: ${commonTags.slice(0, 2).join(', ')}`,
                    commonTags
                });
            }
        });

        // Limit and sort by relationship strength
        return related
            .slice(0, 8) // Max 8 related subagents per agent
            .sort((a, b) => {
                const typeOrder = { explicit: 0, category: 1, tags: 2 };
                return typeOrder[a.relationshipType] - typeOrder[b.relationshipType];
            });
    }

    /**
     * Find related agents for a given subagent
     * @param {Object} subagent - Subagent object
     * @param {Array} allAgents - All available agents
     * @returns {Array} Related agents
     */
    findRelatedAgents(subagent, allAgents) {
        const related = [];

        // 1. Reverse lookup in explicit rules
        Object.entries(this.relationshipRules).forEach(([agentName, subagentNames]) => {
            const matches = subagentNames.some(name =>
                subagent.id.includes(name) || subagent.name === name.split('-').pop()
            );

            if (matches) {
                const agent = allAgents.find(a => a.name === agentName);
                if (agent && !related.includes(agent)) {
                    related.push({
                        ...agent,
                        relationshipType: 'explicit',
                        matchReason: 'Coordinates this specialist'
                    });
                }
            }
        });

        // 2. Category-based matches
        Object.entries(this.categoryMappings).forEach(([agentCategory, subCategories]) => {
            if (subCategories.includes(subagent.subCategory)) {
                const matches = allAgents.filter(a =>
                    a.subCategory === agentCategory &&
                    !related.some(r => r.id === a.id)
                );
                matches.forEach(match => {
                    related.push({
                        ...match,
                        relationshipType: 'category',
                        matchReason: `Can coordinate ${subagent.subCategory} specialists`
                    });
                });
            }
        });

        // 3. Tag overlap
        const subagentTags = subagent.tags || [];
        allAgents.forEach(agent => {
            if (related.some(r => r.id === agent.id)) return;

            const agentTags = agent.tags || [];
            const commonTags = subagentTags.filter(tag =>
                agentTags.some(at => at.toLowerCase().includes(tag.toLowerCase()) ||
                    tag.toLowerCase().includes(at.toLowerCase()))
            );

            if (commonTags.length >= 2) {
                related.push({
                    ...agent,
                    relationshipType: 'tags',
                    matchReason: `Shared domain: ${commonTags.slice(0, 2).join(', ')}`,
                    commonTags
                });
            }
        });

        return related
            .slice(0, 6) // Max 6 related agents per subagent
            .sort((a, b) => {
                const typeOrder = { explicit: 0, category: 1, tags: 2 };
                return typeOrder[a.relationshipType] - typeOrder[b.relationshipType];
            });
    }

    /**
     * Generate relationship strength score (0-100)
     */
    getRelationshipStrength(component1, component2) {
        let score = 0;

        // Explicit relationships get highest score
        if (component1.relationshipType === 'explicit') return 100;

        // Category match
        if (component1.subCategory && component2.subCategory) {
            const categories1 = this.categoryMappings[component1.subCategory] || [];
            if (categories1.includes(component2.subCategory)) {
                score += 60;
            }
        }

        // Tag overlap
        const tags1 = component1.tags || [];
        const tags2 = component2.tags || [];
        const commonTags = tags1.filter(t1 =>
            tags2.some(t2 => t1.toLowerCase() === t2.toLowerCase())
        );
        score += Math.min(commonTags.length * 10, 40);

        return score;
    }

    /**
     * Create visual badge HTML for relationships
     */
    createRelationshipBadge(related, type) {
        const count = related.length;
        if (count === 0) return '';

        const icon = type === 'agents' ? '🤖' : '🎯';
        const label = type === 'agents' ? 'agent' : 'subagent';
        const pluralLabel = count === 1 ? label : `${label}s`;

        return `
            <div class="relationship-badge" data-type="${type}">
                <span class="badge-icon">${icon}</span>
                <span class="badge-text">${count} related ${pluralLabel}</span>
            </div>
        `;
    }

    /**
     * Create relationship tooltip HTML
     */
    createRelationshipTooltip(related, type) {
        if (related.length === 0) return '';

        const title = type === 'agents' ? 'Can Coordinate With' : 'Works With';

        let html = `
            <div class="relationship-tooltip">
                <div class="tooltip-header">${title}</div>
                <ul class="tooltip-list">
        `;

        related.forEach(item => {
            html += `
                <li class="tooltip-item" data-id="${item.id}">
                    <span class="item-icon">${item.icon}</span>
                    <div class="item-details">
                        <span class="item-name">${item.name}</span>
                        <span class="item-reason">${item.matchReason}</span>
                    </div>
                    <span class="relationship-strength strength-${item.relationshipType}">
                        ${item.relationshipType}
                    </span>
                </li>
            `;
        });

        html += `
                </ul>
            </div>
        `;

        return html;
    }

    /**
     * Generate relationship network data for visualization
     */
    generateNetworkData(agent, allSubagents) {
        const related = this.findRelatedSubagents(agent, allSubagents);

        const nodes = [
            {
                id: agent.id,
                type: 'agent',
                name: agent.name,
                icon: agent.icon,
                x: 0,
                y: 0,
                size: 50
            },
            ...related.map((subagent, index) => {
                const angle = (index / related.length) * 2 * Math.PI;
                const radius = 150;
                return {
                    id: subagent.id,
                    type: 'subagent',
                    name: subagent.name,
                    icon: subagent.icon,
                    x: radius * Math.cos(angle),
                    y: radius * Math.sin(angle),
                    size: 30,
                    relationshipType: subagent.relationshipType
                };
            })
        ];

        const edges = related.map(subagent => ({
            source: agent.id,
            target: subagent.id,
            type: subagent.relationshipType,
            label: subagent.matchReason
        }));

        return { nodes, edges };
    }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RelationshipMapper;
}
if (typeof window !== 'undefined') {
    window.RelationshipMapper = RelationshipMapper;
}
