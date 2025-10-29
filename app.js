// ===========================
// Application State
// ===========================

const appState = {
    currentCategory: 'agents',
    searchQuery: '',
    selectedCompany: 'all',
    sortBy: 'downloads',
    stack: [],
    filteredComponents: []
};

// ===========================
// DOM Elements
// ===========================

const elements = {
    categoryTabs: document.querySelectorAll('.category-tab'),
    searchInput: document.getElementById('searchInput'),
    resultsCount: document.getElementById('resultsCount'),
    sortSelect: document.getElementById('sortSelect'),
    companyFilter: document.getElementById('companyFilter'),
    componentsGrid: document.getElementById('componentsGrid'),
    stacksGrid: document.getElementById('stacksGrid'),
    stackBuilder: document.getElementById('stackBuilder'),
    stackItems: document.getElementById('stackItems'),
    stackSummary: document.getElementById('stackSummary'),
    generateCommand: document.getElementById('generateCommand'),
    shareStack: document.getElementById('shareStack'),
    clearStack: document.getElementById('clearStack'),
    commandOutput: document.getElementById('commandOutput'),
    installCommand: document.getElementById('installCommand'),
    copyCommand: document.getElementById('copyCommand')
};

// ===========================
// Initialization
// ===========================

async function init() {
    console.log('[App] Initializing Organized AI Marketplace...');

    // Setup event listeners first
    setupEventListeners();

    // Show loading state
    showLoadingState();

    try {
        // Fetch real component data from GitHub
        console.log('[App] Fetching components from GitHub...');
        const components = await dataFetcher.fetchAllComponents();

        // Replace global marketplaceData with real data
        Object.keys(components).forEach(category => {
            marketplaceData[category] = components[category];
        });

        const totalCount = getAllComponents().length;
        console.log(`[App] ✓ Loaded ${totalCount} components from marketplace`);

        // Render UI
        renderCompanyFilter();
        renderPopularStacks();
        updateView();
        loadStackFromURL();

        hideLoadingState();

        // Show success notification
        showNotification(
            `✓ Loaded ${totalCount} components from marketplace`,
            'success'
        );

    } catch (error) {
        console.error('[App] Failed to initialize:', error);

        // Show error but still render with fallback data
        showErrorState(error.message);

        // Still render UI with mock/cached data
        renderCompanyFilter();
        renderPopularStacks();
        updateView();

        setTimeout(() => {
            showNotification(
                'Using cached data. Some components may be outdated.',
                'warning'
            );
        }, 1000);
    }
}

function showLoadingState() {
    elements.componentsGrid.innerHTML = `
        <div class="loading-container" style="grid-column: 1 / -1; padding: 4rem; text-align: center;">
            <div class="spinner" style="
                width: 50px;
                height: 50px;
                border: 4px solid var(--color-border);
                border-top-color: var(--color-primary);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            "></div>
            <p style="font-size: 1.2rem; color: var(--color-text-secondary);">
                Loading components from GitHub...
            </p>
            <p style="font-size: 0.9rem; color: var(--color-text-muted); margin-top: 0.5rem;">
                This may take a few seconds
            </p>
        </div>
    `;
}

function hideLoadingState() {
    // Will be replaced by renderComponents()
}

function showErrorState(errorMessage) {
    console.error('[App] Error state:', errorMessage);

    // Show error banner at top of page
    const errorBanner = document.createElement('div');
    errorBanner.className = 'error-banner';
    errorBanner.innerHTML = `
        <div class="container" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 0;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span class="error-icon" style="font-size: 1.5rem;">⚠️</span>
                <span class="error-message" style="color: #721c24;">
                    Failed to load latest components. ${errorMessage}
                </span>
            </div>
            <button class="retry-btn btn btn-sm btn-secondary" onclick="location.reload()">
                Retry
            </button>
        </div>
    `;

    errorBanner.style.cssText = `
        background: #f8d7da;
        border-bottom: 1px solid #f5c6cb;
        margin-bottom: 1rem;
    `;

    document.querySelector('.hero').insertAdjacentElement('afterend', errorBanner);
}

// ===========================
// Event Listeners
// ===========================

function setupEventListeners() {
    // Category tabs
    elements.categoryTabs.forEach(tab => {
        tab.addEventListener('click', handleCategoryChange);
    });

    // Search input
    elements.searchInput.addEventListener('input', debounce(handleSearch, 300));

    // Sort select
    elements.sortSelect.addEventListener('change', handleSortChange);

    // Stack actions
    elements.generateCommand.addEventListener('click', handleGenerateCommand);
    elements.shareStack.addEventListener('click', handleShareStack);
    elements.clearStack.addEventListener('click', handleClearStack);
    elements.copyCommand.addEventListener('click', handleCopyCommand);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// ===========================
// Event Handlers
// ===========================

function handleCategoryChange(event) {
    const category = event.target.dataset.category;
    appState.currentCategory = category;
    appState.searchQuery = '';
    appState.selectedCompany = 'all';
    elements.searchInput.value = '';

    // Update active tab
    elements.categoryTabs.forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
    });
    event.target.classList.add('active');
    event.target.setAttribute('aria-selected', 'true');

    updateView();
}

function handleSearch(event) {
    appState.searchQuery = event.target.value;
    updateView();
}

function handleSortChange(event) {
    appState.sortBy = event.target.value;
    updateView();
}

function handleCompanyFilter(company) {
    appState.selectedCompany = company;
    updateView();
}

function handleAddToStack(componentId) {
    const component = getComponentById(componentId);
    if (!component) return;

    // Check if already in stack
    if (appState.stack.find(item => item.id === componentId)) {
        showNotification('Already in stack', 'warning');
        return;
    }

    appState.stack.push(component);
    updateStackView();
    showNotification(`Added ${component.name} to stack`, 'success');
}

function handleRemoveFromStack(componentId) {
    appState.stack = appState.stack.filter(item => item.id !== componentId);
    updateStackView();
    showNotification('Removed from stack', 'info');
}

function handleGenerateCommand() {
    if (appState.stack.length === 0) return;

    // Generate installation script using Claude Integration
    const script = ClaudeIntegration.generateInstallScript(appState.stack);

    // Also generate npm-style command for compatibility
    const npmCommand = `npm install @organized-ai/${appState.stack.map(c => c.id).join(' @organized-ai/')}`;

    // Show the installation script
    elements.installCommand.textContent = script;
    elements.commandOutput.style.display = 'block';

    showNotification('Installation command generated!', 'success');
}

function handleShareStack() {
    if (appState.stack.length === 0) return;

    const stackIds = appState.stack.map(c => c.id).join(',');
    const shareUrl = `${window.location.origin}${window.location.pathname}?stack=${stackIds}`;

    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
        showNotification('Stack URL copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy URL', 'error');
    });
}

function handleClearStack() {
    if (appState.stack.length === 0) return;

    if (confirm('Clear all items from your stack?')) {
        appState.stack = [];
        updateStackView();
        elements.commandOutput.style.display = 'none';
        showNotification('Stack cleared', 'info');
    }
}

function handleCopyCommand() {
    const command = elements.installCommand.textContent;

    navigator.clipboard.writeText(command).then(() => {
        elements.copyCommand.textContent = '✓';
        setTimeout(() => {
            elements.copyCommand.textContent = '📋';
        }, 2000);
        showNotification('Command copied!', 'success');
    }).catch(() => {
        showNotification('Failed to copy command', 'error');
    });
}

function handleLoadStack(stackComponents) {
    stackComponents.forEach(component => {
        if (!appState.stack.find(item => item.id === component.id)) {
            appState.stack.push(component);
        }
    });
    updateStackView();
    showNotification(`Loaded stack with ${stackComponents.length} components`, 'success');
}

function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + K for search focus
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        elements.searchInput.focus();
    }
}

// ===========================
// View Updates
// ===========================

function updateView() {
    // Get components for current category
    let components = getComponentsByCategory(appState.currentCategory);

    // Apply search filter
    if (appState.searchQuery) {
        components = searchComponents(appState.searchQuery);
        // Further filter by category if needed
        components = components.filter(c => c.category === appState.currentCategory);
    }

    // Apply company filter
    components = filterByCompany(components, appState.selectedCompany);

    // Sort components
    components = sortComponents(components, appState.sortBy);

    // Store filtered results
    appState.filteredComponents = components;

    // Update results count
    updateResultsCount(components.length);

    // Render components
    renderComponents(components);

    // Update company filter active states
    updateCompanyFilterStates();
}

function updateResultsCount(count) {
    elements.resultsCount.textContent = `${count} result${count !== 1 ? 's' : ''}`;
}

function updateStackView() {
    // Update counts
    const counts = {
        agents: 0,
        subagents: 0,
        commands: 0,
        settings: 0,
        hooks: 0,
        mcps: 0,
        skills: 0
    };

    appState.stack.forEach(item => {
        if (counts.hasOwnProperty(item.category)) {
            counts[item.category]++;
        }
    });

    document.getElementById('agentsCount').textContent = counts.agents;
    document.getElementById('subagentsCount').textContent = counts.subagents;
    document.getElementById('commandsCount').textContent = counts.commands;
    document.getElementById('settingsCount').textContent = counts.settings;
    document.getElementById('hooksCount').textContent = counts.hooks;
    document.getElementById('mcpsCount').textContent = counts.mcps;
    document.getElementById('skillsCount').textContent = counts.skills;

    // Render stack items
    renderStackItems();

    // Update button states
    const hasItems = appState.stack.length > 0;
    elements.generateCommand.disabled = !hasItems;
    elements.shareStack.disabled = !hasItems;
}

function updateCompanyFilterStates() {
    const chips = elements.companyFilter.querySelectorAll('.company-chip');
    chips.forEach(chip => {
        if (chip.dataset.company === appState.selectedCompany) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
}

// ===========================
// Rendering Functions
// ===========================

function renderComponents(components) {
    if (components.length === 0) {
        elements.componentsGrid.innerHTML = `
            <div class="text-center" style="grid-column: 1 / -1; padding: 3rem;">
                <p style="font-size: 1.5rem; color: var(--color-text-muted);">
                    No components found
                </p>
                <p style="color: var(--color-text-secondary); margin-top: 0.5rem;">
                    Try adjusting your search or filters
                </p>
            </div>
        `;
        return;
    }

    elements.componentsGrid.innerHTML = components.map(component => `
        <div class="component-card fade-in" data-id="${component.id}">
            <div class="component-card-header">
                <div class="component-icon">${component.icon}</div>
                <h3 class="component-title">${component.name}</h3>
            </div>
            <p class="component-description">${component.description}</p>
            <div class="component-meta">
                ${component.tags.slice(0, 3).map(tag =>
                    `<span class="component-tag">#${tag}</span>`
                ).join('')}
            </div>
            <div class="component-downloads">
                ⬇️ ${formatDownloads(component.downloads)} downloads
            </div>
            <div class="component-actions">
                <button class="btn btn-primary btn-sm" onclick="handleAddToStack('${component.id}')">
                    + Add to Stack
                </button>
                <button class="btn btn-secondary btn-sm" onclick="viewComponentDetails('${component.id}')">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

function renderCompanyFilter() {
    const allChip = `
        <button
            class="company-chip active"
            data-company="all"
            onclick="handleCompanyFilter('all')"
        >
            All
        </button>
    `;

    const companyChips = companies.map(company => `
        <button
            class="company-chip"
            data-company="${company}"
            onclick="handleCompanyFilter('${company}')"
        >
            ${company}
        </button>
    `).join('');

    elements.companyFilter.innerHTML = allChip + companyChips;
}

function renderStackItems() {
    if (appState.stack.length === 0) {
        elements.stackItems.innerHTML = `
            <p class="empty-stack-message">Add components to build your stack</p>
        `;
        return;
    }

    elements.stackItems.innerHTML = appState.stack.map(item => `
        <div class="stack-item">
            <div class="stack-item-info">
                <span class="stack-item-icon">${item.icon}</span>
                <span class="stack-item-name">${item.name}</span>
            </div>
            <button
                class="remove-item-btn"
                onclick="handleRemoveFromStack('${item.id}')"
                aria-label="Remove ${item.name}"
            >
                ✕
            </button>
        </div>
    `).join('');
}

function renderPopularStacks() {
    elements.stacksGrid.innerHTML = popularStacks.map(stack => `
        <div class="stack-card" onclick="loadPopularStack('${stack.id}')">
            <h4 class="stack-card-title">${stack.name}</h4>
            <p class="stack-card-description">${stack.description}</p>
            <div class="stack-card-components">
                <span>${stack.components.length} components</span>
                <span>•</span>
                <span>⬇️ ${formatDownloads(stack.downloads)}</span>
            </div>
        </div>
    `).join('');
}

// ===========================
// Utility Functions
// ===========================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background-color: var(--color-bg-secondary);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: 1rem 1.5rem;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function viewComponentDetails(componentId) {
    const component = getComponentById(componentId);
    if (!component) return;

    // Validate component compatibility
    const validation = ClaudeIntegration.validateComponent(component);

    if (!validation.valid) {
        const issues = validation.issues.join(', ');
        showNotification(`Component issues: ${issues}`, 'warning');
        return;
    }

    // TODO(human): Implement modal or detail view
    // This could show full component details, installation instructions,
    // dependencies, and a preview of what will be installed
    showNotification(`Viewing details for ${component.name}`, 'info');
}

function loadPopularStack(stackId) {
    const stack = popularStacks.find(s => s.id === stackId);
    if (!stack) return;

    const components = stack.components
        .map(id => getComponentById(id))
        .filter(c => c !== undefined);

    handleLoadStack(components);
}

function loadStackFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const stackParam = urlParams.get('stack');

    if (stackParam) {
        const componentIds = stackParam.split(',');
        const components = componentIds
            .map(id => getComponentById(id))
            .filter(c => c !== undefined);

        if (components.length > 0) {
            handleLoadStack(components);
        }
    }
}

// ===========================
// Animations
// ===========================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===========================
// Start Application
// ===========================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
