import { create } from 'zustand';
import { Node, Edge, Connection, addEdge } from '@xyflow/react';

export interface ComponentNode extends Node {
  data: {
    id: string;
    name: string;
    category: string;
    description: string;
    version?: string;
    dependencies?: string[];
    optionalDependencies?: string[];
    conflicts?: string[];
    recommends?: string[];
  };
}

interface StackBuilderState {
  nodes: ComponentNode[];
  edges: Edge[];
  selectedNode: ComponentNode | null;

  // Actions
  addNode: (node: ComponentNode) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, data: Partial<ComponentNode['data']>) => void;
  setNodes: (nodes: ComponentNode[]) => void;

  setEdges: (edges: Edge[]) => void;
  onConnect: (connection: Connection) => void;

  setSelectedNode: (node: ComponentNode | null) => void;

  clearStack: () => void;
  exportStack: () => {
    nodes: ComponentNode[];
    edges: Edge[];
  };
}

export const useStackStore = create<StackBuilderState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,

  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node]
  })),

  removeNode: (nodeId) => set((state) => ({
    nodes: state.nodes.filter((n) => n.id !== nodeId),
    edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode
  })),

  updateNode: (nodeId, data) => set((state) => ({
    nodes: state.nodes.map((n) =>
      n.id === nodeId
        ? { ...n, data: { ...n.data, ...data } }
        : n
    )
  })),

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  onConnect: (connection) => set((state) => ({
    edges: addEdge(connection, state.edges)
  })),

  setSelectedNode: (node) => set({ selectedNode: node }),

  clearStack: () => set({
    nodes: [],
    edges: [],
    selectedNode: null
  }),

  exportStack: () => {
    const { nodes, edges } = get();
    return { nodes, edges };
  }
}));
