'use client';

/**
 * Stack Builder Canvas Component
 *
 * The main canvas for visually composing Claude Code stacks.
 * Uses @xyflow/react for drag-and-drop node-based interface.
 *
 * Features:
 * - Drag components from sidebar onto canvas
 * - Zoom and pan
 * - Connect components with arrows
 * - Select components to view/edit details
 * - Auto-save to localStorage
 */

import { useCallback, useEffect, DragEvent as ReactDragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStackBuilderStore } from '@/stores/stack-builder-store';
import type { Component } from '@/lib/types/stack-builder';

// Custom node types (we'll create these next)
import { ComponentNode } from './ComponentNode';

const nodeTypes = {
  agent: ComponentNode,
  mcp: ComponentNode,
  command: ComponentNode,
  hook: ComponentNode,
  setting: ComponentNode,
  skill: ComponentNode,
};

export function StackBuilderCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addComponent,
    selectNode,
    selectedNodeId,
    lastSaved,
  } = useStackBuilderStore();

  // Handle drop event from component library
  const onDrop = useCallback(
    (event: ReactDragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const componentData = event.dataTransfer.getData('application/json');
      if (!componentData) return;

      const component: Component = JSON.parse(componentData);

      // Get canvas bounds for positioning
      const canvasRect = (event.target as HTMLElement).getBoundingClientRect();
      const position = {
        x: event.clientX - canvasRect.left,
        y: event.clientY - canvasRect.top,
      };

      addComponent(component, position);
    },
    [addComponent]
  );

  const onDragOver = useCallback((event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle node click for selection
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  // Deselect when clicking canvas background
  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return 'Not saved';

    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(lastSaved).getTime()) / 1000);

    if (diff < 60) return 'Saved just now';
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)} min ago`;
    return `Saved at ${new Date(lastSaved).toLocaleTimeString()}`;
  };

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-50"
      >
        {/* Grid background */}
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />

        {/* Zoom/pan controls */}
        <Controls />

        {/* Minimap */}
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="bg-white border border-slate-200 rounded-lg"
        />

        {/* Top toolbar */}
        <Panel position="top-center" className="bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-4">
          <div className="text-sm text-slate-600">
            <span className="font-medium">{nodes.length}</span> components
          </div>
          <div className="text-sm text-slate-400">•</div>
          <div className="text-sm text-slate-600">
            <span className="font-medium">{edges.length}</span> connections
          </div>
          <div className="text-sm text-slate-400">•</div>
          <div className="text-xs text-slate-500">{formatLastSaved()}</div>
        </Panel>

        {/* Empty state */}
        {nodes.length === 0 && (
          <Panel position="top-center" className="pointer-events-none mt-20">
            <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg p-8 border-2 border-dashed border-slate-300">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Start Building Your Stack
              </h3>
              <p className="text-sm text-slate-600">
                Drag components from the left sidebar onto this canvas
              </p>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
