/**
 * Connection Help Panel
 *
 * Shows users valid connection patterns and examples based on AITMPL documentation.
 * Appears when user selects a node to help them understand what connections are possible.
 */

'use client';

import { getSuggestedConnections } from '@/lib/validation/connection-rules';
import type { ComponentType } from '@/lib/types/stack-builder';

interface ConnectionHelpPanelProps {
  componentType: ComponentType;
  componentName: string;
}

const COMPONENT_TYPE_ICONS: Record<ComponentType, string> = {
  agent: '🤖',
  subagent: '🤖',
  skill: '🎯',
  mcp: '🔌',
  command: '⚡',
  hook: '🪝',
  setting: '⚙️',
};

const COMPONENT_TYPE_COLORS: Record<ComponentType, string> = {
  agent: 'bg-blue-50 border-blue-200 text-blue-900',
  subagent: 'bg-blue-50 border-blue-200 text-blue-900',
  skill: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  mcp: 'bg-purple-50 border-purple-200 text-purple-900',
  command: 'bg-amber-50 border-amber-200 text-amber-900',
  hook: 'bg-green-50 border-green-200 text-green-900',
  setting: 'bg-slate-50 border-slate-200 text-slate-900',
};

export function ConnectionHelpPanel({
  componentType,
  componentName,
}: ConnectionHelpPanelProps) {
  const suggestedConnections = getSuggestedConnections(componentType);

  if (suggestedConnections.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-4">
        <p className="text-sm text-slate-600">
          No outgoing connections available for this component type.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-slate-200" />
        <h3 className="text-sm font-semibold text-slate-700">
          How to Connect This Component
        </h3>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="space-y-3">
        {suggestedConnections.map((rule) => (
          <div
            key={`${rule.sourceType}-${rule.targetType}`}
            className="bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
          >
            {/* Connection Pattern */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{COMPONENT_TYPE_ICONS[rule.sourceType]}</span>
              <span className="text-xs font-mono text-slate-400">→</span>
              <span className="text-lg">{COMPONENT_TYPE_ICONS[rule.targetType]}</span>
              <span
                className={`ml-auto text-xs px-2 py-1 rounded-full font-medium ${
                  rule.defaultType === 'required'
                    ? 'bg-red-100 text-red-700'
                    : rule.defaultType === 'triggers'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {rule.defaultType}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 mb-3">{rule.description}</p>

            {/* Examples */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Examples:
              </p>
              {rule.examples.slice(0, 2).map((example, idx) => (
                <div
                  key={idx}
                  className="text-xs text-slate-600 pl-3 border-l-2 border-slate-200"
                >
                  {example}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex gap-2">
          <span className="text-blue-600 text-sm">💡</span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-blue-900 mb-1">Quick Tip</p>
            <p className="text-xs text-blue-700">
              Drag from the <strong>{componentName}</strong> handle to another component to
              create a connection. Invalid connections will be automatically rejected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
