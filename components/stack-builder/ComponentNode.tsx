'use client';

/**
 * Component Node
 *
 * Custom node component for the Stack Builder canvas.
 * Displays a component with icon, name, and configuration status.
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { NodeData } from '@/lib/types/stack-builder';

type ComponentNodeProps = NodeProps & {
  data: NodeData;
};

export const ComponentNode = memo(({ data, selected }: ComponentNodeProps) => {
  const { icon, name, type, isConfigured, validationErrors } = data;

  // Type-specific colors
  const getTypeColor = () => {
    switch (type) {
      case 'agent':
        return 'bg-blue-500';
      case 'mcp':
        return 'bg-purple-500';
      case 'command':
        return 'bg-green-500';
      case 'hook':
        return 'bg-orange-500';
      case 'setting':
        return 'bg-slate-500';
      case 'skill':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Configuration status indicator
  const getStatusIndicator = () => {
    if (validationErrors && validationErrors.length > 0) {
      return (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          !
        </div>
      );
    }

    if (!isConfigured) {
      return (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          ⚙
        </div>
      );
    }

    return (
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
        ✓
      </div>
    );
  };

  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 bg-white shadow-lg
        transition-all duration-200 min-w-[180px]
        ${selected ? 'border-blue-500 shadow-xl ring-2 ring-blue-200' : 'border-slate-200'}
        hover:shadow-xl hover:border-slate-300
      `}
    >
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-slate-400"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-slate-400"
      />

      {/* Status indicator */}
      {getStatusIndicator()}

      {/* Content */}
      <div className="flex items-center gap-3">
        {/* Icon with type color */}
        <div
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center text-xl
            ${getTypeColor()} text-white
          `}
        >
          {icon}
        </div>

        {/* Component info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-slate-900 truncate">
            {name}
          </div>
          <div className="text-xs text-slate-500 capitalize">{type}</div>
        </div>
      </div>
    </div>
  );
});

ComponentNode.displayName = 'ComponentNode';
