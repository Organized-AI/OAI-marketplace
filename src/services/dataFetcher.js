/**
 * DataFetcher Service
 * Fetches component data from GitHub API with caching and fallback support
 *
 * Features:
 * - Fetches from davila7/claude-code-templates repository
 * - 5-minute in-memory cache
 * - LocalStorage fallback for offline mode
 * - GitHub API rate limit handling
 */

class DataFetcher {
  constructor(config = {}) {
    this.baseURL = config.baseURL || 'https://api.github.com/repos/davila7/claude-code-templates';
    this.rawBaseURL = 'https://raw.githubusercontent.com/davila7/claude-code-templates/main';
    this.branch = config.branch || 'main';
    this.cache = new Map();
    this.cacheDuration = config.cacheDuration || 5 * 60 * 1000; // 5 minutes
    this.rateLimitRemaining = 60;
    this.rateLimitReset = null;

    // GitHub personal access token (optional, increases rate limit from 60 to 5000/hour)
    this.githubToken = config.githubToken || null;
  }

  /**
   * Fetch all components from repository
   * @returns {Promise<Object>} Categorized components
   */
  async fetchAllComponents() {
    console.log('[DataFetcher] Fetching all components...');

    try {
      // Check cache first
      const cacheKey = 'all-components';
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        console.log('[DataFetcher] Returning cached data');
        return cached;
      }

      // Check rate limit
      await this._checkRateLimit();

      // Fetch data files (faster than crawling directory structure)
      const categories = ['agents', 'commands', 'mcps', 'hooks', 'settings', 'plugins', 'skills'];
      const components = {};

      // Fetch all categories in parallel
      console.log('[DataFetcher] Fetching categories in parallel...');
      const promises = categories.map(category =>
        this._fetchCategoryFromDataFile(category)
      );

      const results = await Promise.all(promises);

      // Combine results
      categories.forEach((category, index) => {
        components[category] = results[index];
      });

      // Cache the results
      this._saveToCache(cacheKey, components);

      const totalCount = Object.values(components).reduce((sum, arr) => sum + arr.length, 0);
      console.log(`[DataFetcher] ✓ Fetched ${totalCount} components:`,
        Object.keys(components).map(k => `${k}:${components[k].length}`).join(', '));

      return components;

    } catch (error) {
      console.error('[DataFetcher] Failed to fetch components:', error);

      // Try loading from localStorage as last resort
      const fallback = this._loadFromLocalStorage();
      if (fallback) {
        console.log('[DataFetcher] Using localStorage fallback');
        return fallback;
      }

      // Ultimate fallback: return existing mock data
      console.log('[DataFetcher] Using mock data fallback');
      return this._getMockData();
    }
  }

  /**
   * Fetch category data from data/{category}.json files
   * This is faster than crawling the components/ directory structure
   */
  async _fetchCategoryFromDataFile(category) {
    try {
      // Try fetching from data/{category}.json first (structured data files)
      const dataFileUrl = `${this.rawBaseURL}/data/${category}.json`;
      const response = await this._fetch(dataFileUrl);

      if (response.ok) {
        const data = await response.json();
        console.log(`[DataFetcher] ✓ Loaded ${data.length} ${category} from data file`);
        return data.map(component => this._normalizeComponent(component, category));
      }

      // Fallback: fetch from components directory (slower but more flexible)
      console.log(`[DataFetcher] Data file not found for ${category}, trying directory listing...`);
      return await this._fetchCategoryFromDirectory(category);

    } catch (error) {
      console.error(`[DataFetcher] Failed to fetch ${category}:`, error);
      return [];
    }
  }

  /**
   * Fallback: Fetch by listing components/{category}/ directory
   */
  async _fetchCategoryFromDirectory(category) {
    try {
      const dirUrl = `${this.baseURL}/contents/components/${category}`;
      const response = await this._fetch(dirUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const items = await response.json();

      // Filter directories only
      const directories = items.filter(item => item.type === 'dir');

      console.log(`[DataFetcher] Found ${directories.length} ${category} in directory`);

      // Fetch component.json from each directory
      const componentPromises = directories.map(dir =>
        this._fetchComponentFromDirectory(category, dir.name)
      );

      const components = await Promise.all(componentPromises);
      return components.filter(c => c !== null);

    } catch (error) {
      console.error(`[DataFetcher] Directory listing failed for ${category}:`, error);
      return [];
    }
  }

  /**
   * Fetch individual component from its directory
   */
  async _fetchComponentFromDirectory(category, componentId) {
    try {
      // Try different common filenames
      const filenames = ['component.json', 'agent.json', 'config.json', 'metadata.json'];

      for (const filename of filenames) {
        const url = `${this.rawBaseURL}/components/${category}/${componentId}/${filename}`;
        const response = await this._fetch(url);

        if (response.ok) {
          const data = await response.json();
          return this._normalizeComponent({ ...data, id: componentId }, category);
        }
      }

      console.warn(`[DataFetcher] No metadata file found for ${category}/${componentId}`);
      return null;

    } catch (error) {
      console.error(`[DataFetcher] Failed to fetch ${category}/${componentId}:`, error);
      return null;
    }
  }

  /**
   * Normalize component data to marketplace format
   */
  _normalizeComponent(rawComponent, category) {
    return {
      // Core identification
      id: rawComponent.id || this._generateId(rawComponent.name),
      name: rawComponent.name,
      description: rawComponent.description || 'No description available',
      category: category,
      version: rawComponent.version || '1.0.0',

      // Display
      icon: this._getIconForCategory(category),
      company: rawComponent.author || rawComponent.company || 'Community',
      tags: rawComponent.metadata?.tags || rawComponent.tags || [],

      // Dependencies
      dependencies: rawComponent.dependencies?.required || rawComponent.dependencies || [],
      optionalDependencies: rawComponent.dependencies?.optional || [],
      conflicts: rawComponent.dependencies?.conflicts || [],

      // Configuration
      requiredEnvVars: rawComponent.configuration?.requiredEnvVars || rawComponent.requiredEnvVars || [],
      optionalEnvVars: rawComponent.configuration?.optionalEnvVars || rawComponent.optionalEnvVars || [],
      settings: rawComponent.configuration?.settings || rawComponent.settings || {},

      // Installation
      installationType: rawComponent.installation?.type || category,
      files: rawComponent.installation?.files || rawComponent.files || {},
      postInstall: rawComponent.installation?.postInstall || [],

      // Compatibility
      compatibility: {
        os: rawComponent.compatibility?.os || ['macOS', 'Linux', 'Windows'],
        minClaudeVersion: rawComponent.compatibility?.minClaudeVersion || '1.0.0',
        maxClaudeVersion: rawComponent.compatibility?.maxClaudeVersion || null
      },

      // Stats
      downloads: rawComponent.stats?.downloads || rawComponent.downloads || 0,
      rating: rawComponent.stats?.rating || rawComponent.rating || 0,
      totalRatings: rawComponent.stats?.totalRatings || 0,

      // Metadata
      createdAt: rawComponent.createdAt || new Date().toISOString(),
      updatedAt: rawComponent.stats?.lastUpdated || rawComponent.updatedAt || new Date().toISOString()
    };
  }

  /**
   * Fetch with GitHub token authentication (if available)
   */
  async _fetch(url) {
    const headers = {
      'Accept': 'application/vnd.github.v3+json'
    };

    if (this.githubToken) {
      headers['Authorization'] = `token ${this.githubToken}`;
    }

    const response = await fetch(url, { headers });

    // Update rate limit info from response headers
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');

    if (remaining) this.rateLimitRemaining = parseInt(remaining);
    if (reset) this.rateLimitReset = new Date(parseInt(reset) * 1000);

    return response;
  }

  /**
   * Check GitHub API rate limit
   */
  async _checkRateLimit() {
    if (this.rateLimitRemaining < 5) {
      const now = new Date();
      const resetTime = this.rateLimitReset || new Date(now.getTime() + 60 * 60 * 1000);

      if (now < resetTime) {
        const waitMinutes = Math.ceil((resetTime - now) / (60 * 1000));
        console.warn(`[DataFetcher] ⚠️  Rate limit low (${this.rateLimitRemaining} remaining). Resets in ${waitMinutes} minutes.`);

        // Use cached data instead of waiting
        throw new Error('GitHub API rate limit exceeded. Using cached data.');
      }
    }
  }

  /**
   * Get data from in-memory cache
   */
  _getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    const isExpired = age > this.cacheDuration;

    if (isExpired) {
      this.cache.delete(key);
      console.log(`[DataFetcher] Cache expired for ${key} (age: ${Math.round(age / 1000)}s)`);
      return null;
    }

    console.log(`[DataFetcher] Cache hit for ${key} (age: ${Math.round(age / 1000)}s)`);
    return cached.data;
  }

  /**
   * Save data to in-memory cache and localStorage
   */
  _saveToCache(key, data) {
    // In-memory cache
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Persistent cache in localStorage
    try {
      localStorage.setItem(`cache-${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      console.log(`[DataFetcher] Saved to cache: ${key}`);
    } catch (e) {
      console.warn('[DataFetcher] Failed to save to localStorage:', e.message);
    }
  }

  /**
   * Load from localStorage (for offline mode)
   */
  _loadFromLocalStorage() {
    try {
      const cached = localStorage.getItem('cache-all-components');
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);

      // Allow stale cache for offline mode (7 days)
      const age = Date.now() - timestamp;
      const maxAge = 7 * 24 * 60 * 60 * 1000;

      if (age > maxAge) {
        console.log(`[DataFetcher] LocalStorage cache too old (${Math.round(age / (24 * 60 * 60 * 1000))} days)`);
        return null;
      }

      console.log(`[DataFetcher] Loaded from localStorage (${Math.round(age / (60 * 60 * 1000))} hours old)`);
      return data;

    } catch (e) {
      console.warn('[DataFetcher] Failed to load from localStorage:', e);
      return null;
    }
  }

  /**
   * Fallback to existing mock data (from data.js)
   */
  _getMockData() {
    // This will use the existing marketplaceData from data.js
    if (typeof marketplaceData !== 'undefined') {
      console.log('[DataFetcher] Using existing mock data');
      return marketplaceData;
    }

    // Return empty structure if no mock data available
    return {
      agents: [],
      commands: [],
      mcps: [],
      hooks: [],
      settings: [],
      plugins: [],
      skills: []
    };
  }

  /**
   * Generate ID from name
   */
  _generateId(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Get icon emoji for category
   */
  _getIconForCategory(category) {
    const icons = {
      agents: '🤖',
      commands: '⚡',
      settings: '⚙️',
      hooks: '🪝',
      mcps: '🔌',
      plugins: '🧩',
      skills: '💡'
    };
    return icons[category] || '📦';
  }

  /**
   * Track component download for analytics
   */
  async trackDownload(componentId) {
    try {
      console.log(`[Analytics] Component downloaded: ${componentId}`);

      // Send to analytics (Plausible, Google Analytics, etc.)
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('Component Download', {
          props: { component: componentId }
        });
      }
    } catch (e) {
      // Silent fail - analytics should never break the app
    }
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.cache.clear();
    try {
      localStorage.removeItem('cache-all-components');
      console.log('[DataFetcher] Cache cleared');
    } catch (e) {
      console.warn('[DataFetcher] Failed to clear localStorage cache:', e);
    }
  }
}

// Export singleton instance
const dataFetcher = new DataFetcher({
  // Optional: Add GitHub token for higher rate limits (60 → 5000/hour)
  // Get from: https://github.com/settings/tokens (no scopes needed for public repos)
  // githubToken: 'ghp_your_token_here'
});

// Make available globally for browser console debugging
if (typeof window !== 'undefined') {
  window.dataFetcher = dataFetcher;
}
