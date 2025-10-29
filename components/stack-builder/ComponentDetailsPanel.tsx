'use client';

/**
 * Component Details Panel
 *
 * Right sidebar panel that shows details and configuration options
 * for the currently selected component on the canvas.
 *
 * Features:
 * - Component metadata display
 * - Configuration form with validation
 * - Remove component button
 * - Tabs: Details | Configuration
 * - Show/hide toggle for sensitive fields
 * - File upload support
 */

import { useState } from 'react';
import { useStackBuilderStore } from '@/stores/stack-builder-store';

// Track which sensitive fields are currently visible
type VisibilityState = Record<string, boolean>;

export function ComponentDetailsPanel() {
  const { nodes, selectedNodeId, updateComponentConfig, removeComponent } =
    useStackBuilderStore();
  const [activeTab, setActiveTab] = useState<'details' | 'config'>('details');
  const [fieldVisibility, setFieldVisibility] = useState<VisibilityState>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Get selected node
  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="w-80 h-full bg-white border-l border-slate-200 flex items-center justify-center">
        <div className="text-center text-slate-400 p-8">
          <div className="text-4xl mb-3">👈</div>
          <p className="text-sm">Select a component to view details</p>
        </div>
      </div>
    );
  }

  const { data } = selectedNode;

  // Toggle visibility of sensitive field
  const toggleFieldVisibility = (key: string) => {
    setFieldVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Validate field value
  const validateField = (key: string, value: any, field: any): string | null => {
    // Required field check
    if (field.required && (value === '' || value === null || value === undefined)) {
      return `${key} is required`;
    }

    // Validation rules
    if (field.validation) {
      const { min, max, pattern, message } = field.validation;

      // Number validation
      if (field.type === 'number' && typeof value === 'number') {
        if (min !== undefined && value < min) {
          return message || `Must be at least ${min}`;
        }
        if (max !== undefined && value > max) {
          return message || `Must be at most ${max}`;
        }
      }

      // String validation
      if (field.type === 'string' && typeof value === 'string') {
        if (pattern) {
          const regex = new RegExp(pattern);
          if (!regex.test(value)) {
            return message || 'Invalid format';
          }
        }
        if (min !== undefined && value.length < min) {
          return message || `Must be at least ${min} characters`;
        }
        if (max !== undefined && value.length > max) {
          return message || `Must be at most ${max} characters`;
        }
      }
    }

    return null;
  };

  // Handle configuration change with validation
  const handleConfigChange = (key: string, value: string | number | boolean | File) => {
    const field = data.configSchema?.[key];
    if (!field) return;

    // Validate the new value
    const error = validateField(key, value, field);
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[key] = error;
      } else {
        delete newErrors[key];
      }
      return newErrors;
    });

    // Update config regardless (allow invalid state but show error)
    updateComponentConfig(selectedNode.id, { [key]: value });
  };

  // Handle file upload
  const handleFileUpload = (key: string, file: File | null) => {
    if (file) {
      // For now, store the file object directly
      // In production, you'd upload to server or convert to base64
      handleConfigChange(key, file);
    }
  };

  // Handle remove component
  const handleRemove = () => {
    if (confirm(`Remove ${data.name} from canvas?`)) {
      removeComponent(selectedNode.id);
    }
  };

  return (
    <div className="w-96 h-full bg-white border-l border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-3xl">{data.icon}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">{data.name}</h3>
            <p className="text-xs text-slate-500 capitalize">{data.type}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('details')}
            className={`
              flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors
              ${
                activeTab === 'details'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }
            `}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`
              flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors
              ${
                activeTab === 'config'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }
            `}
          >
            Configuration
            {!data.isConfigured && data.configSchema && (
              <span className="ml-1 inline-block w-2 h-2 bg-yellow-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'details' ? (
          <div className="space-y-4">
            {/* Description */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-1">Description</h4>
              <p className="text-sm text-slate-600">{data.description}</p>
            </div>

            {/* Author */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-1">Author</h4>
              <p className="text-sm text-slate-600">{data.author}</p>
            </div>

            {/* Stats */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-2">Stats</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-slate-500">Rating</div>
                  <div className="text-lg font-semibold text-slate-900">
                    ⭐ {data.rating}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-slate-500">Downloads</div>
                  <div className="text-lg font-semibold text-slate-900">
                    ↓ {data.downloads}
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {data.tags && data.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {data.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Compatible Models */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-2">
                Compatible Models
              </h4>
              <div className="space-y-1">
                {data.compatibleModels.map((model) => (
                  <div key={model} className="text-sm text-slate-600">
                    • {model}
                  </div>
                ))}
              </div>
            </div>

            {/* Dependencies */}
            {data.dependencies && data.dependencies.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-2">
                  Dependencies
                </h4>
                <div className="space-y-1">
                  {data.dependencies.map((dep) => (
                    <div key={dep} className="text-sm text-slate-600">
                      • {dep}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {data.configSchema && Object.keys(data.configSchema).length > 0 ? (
              Object.entries(data.configSchema).map(([key, field]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    {key}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <p className="text-xs text-slate-500 mb-2">{field.description}</p>

                  {field.type === 'boolean' ? (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={Boolean(data.config[key] ?? field.default)}
                        onChange={(e) => handleConfigChange(key, e.target.checked)}
                        className="rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-600">
                        Enable {key.toLowerCase()}
                      </span>
                    </label>
                  ) : field.type === 'select' && field.options ? (
                    <select
                      value={(data.config[key] as string) ?? field.default ?? ''}
                      onChange={(e) => handleConfigChange(key, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select {key}</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'number' ? (
                    <input
                      type="number"
                      value={(data.config[key] as number) ?? field.default ?? ''}
                      onChange={(e) =>
                        handleConfigChange(key, parseFloat(e.target.value))
                      }
                      placeholder={field.placeholder}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                        validationErrors[key]
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                  ) : field.type === 'file' ? (
                    <div>
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          handleFileUpload(key, file);
                        }}
                        className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {data.config[key] && (
                        <p className="text-xs text-slate-500 mt-1">
                          ✓ File selected: {(data.config[key] as File).name}
                        </p>
                      )}
                    </div>
                  ) : field.sensitive ? (
                    <div className="relative">
                      <input
                        type={fieldVisibility[key] ? 'text' : 'password'}
                        value={(data.config[key] as string) ?? ''}
                        onChange={(e) => handleConfigChange(key, e.target.value)}
                        placeholder={field.placeholder}
                        className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                          validationErrors[key]
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-slate-300 focus:ring-blue-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => toggleFieldVisibility(key)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {fieldVisibility[key] ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={(data.config[key] as string) ?? ''}
                      onChange={(e) => handleConfigChange(key, e.target.value)}
                      placeholder={field.placeholder}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                        validationErrors[key]
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                  )}

                  {/* Validation error message */}
                  {validationErrors[key] && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <span>⚠️</span>
                      {validationErrors[key]}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                No configuration required for this component
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={handleRemove}
          className="w-full py-2 px-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
        >
          Remove from Canvas
        </button>
      </div>
    </div>
  );
}
