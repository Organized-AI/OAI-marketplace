/**
 * Stack Builder Store (Zustand)
 *
 * Manages the state for the visual Stack Builder canvas including:
 * - Components on canvas (nodes)
 * - Connections between components (edges)
 * - Component configurations
 * - Selected node
 * - Validation warnings
 * - Auto-save to localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import type {
  StackBuilderNode,
  StackBuilderEdge,
  Component,
  ComponentConfig,
  ValidationWarning,
  DraftState,
} from '@/lib/types/stack-builder';
import {
  isValidConnection,
  getConnectionValidationMessage,
} from '@/lib/validation/connection-rules';

interface StackBuilderState {
  // Canvas state
  nodes: StackBuilderNode[];
  edges: StackBuilderEdge[];
  selectedNodeId: string | null;

  // Validation
  validationWarnings: ValidationWarning[];

  // Draft management
  lastSaved: Date | null;
  stackName: string;
  stackDescription: string;

  // Actions - Node management
  addComponent: (component: Component, position: { x: number; y: number }) => void;
  removeComponent: (nodeId: string) => void;
  updateComponentConfig: (nodeId: string, config: Partial<ComponentConfig>) => void;
  selectNode: (nodeId: string | null) => void;

  // Actions - Canvas changes (React Flow)
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Actions - Stack management
  setStackName: (name: string) => void;
  setStackDescription: (description: string) => void;
  clearCanvas: () => void;
  loadDraft: (draft: DraftState) => void;
  loadStack: (stack: { nodes: StackBuilderNode[]; edges: StackBuilderEdge[]; name?: string; description?: string }) => void;

  // Actions - Validation
  validateStack: () => ValidationWarning[];

  // Actions - Export
  generateCLICommand: () => string;
  generateZipMetadata: () => Promise<{
    stackName: string;
    components: Component[];
    configurations: Record<string, ComponentConfig>;
  }>;
}

export const useStackBuilderStore = create<StackBuilderState>()(
  persist(
    (set, get) => ({
      // Initial state
      nodes: [],
      edges: [],
      selectedNodeId: null,
      validationWarnings: [],
      lastSaved: null,
      stackName: '',
      stackDescription: '',

      // Add component to canvas
      addComponent: (component, position) => {
        const instanceId = `${component.id}-${Date.now()}`;

        const newNode: StackBuilderNode = {
          id: instanceId,
          type: component.type,
          position,
          data: {
            ...component,
            instanceId,
            config: {},
            isConfigured: false,
          },
        };

        set((state) => ({
          nodes: [...state.nodes, newNode],
          lastSaved: new Date(),
        }));
      },

      // Remove component from canvas
      removeComponent: (nodeId) => {
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== nodeId),
          edges: state.edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          ),
          selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
          lastSaved: new Date(),
        }));
      },

      // Update component configuration
      updateComponentConfig: (nodeId, config) => {
        set((state) => ({
          nodes: state.nodes.map((node) => {
            if (node.id === nodeId) {
              const updatedConfig = { ...node.data.config, ...config };
              const configSchema = node.data.configSchema || {};

              // Check if all required fields are filled
              const isConfigured = Object.entries(configSchema).every(
                ([key, field]) => {
                  if (!field.required) return true;
                  const value = updatedConfig[key];
                  return value !== undefined && value !== null && value !== '';
                }
              );

              return {
                ...node,
                data: {
                  ...node.data,
                  config: updatedConfig,
                  isConfigured,
                },
              };
            }
            return node;
          }),
          lastSaved: new Date(),
        }));
      },

      // Select node for details panel
      selectNode: (nodeId) => {
        set({ selectedNodeId: nodeId });
      },

      // Handle React Flow node changes (drag, select, etc.)
      onNodesChange: (changes) => {
        set((state) => ({
          nodes: applyNodeChanges(changes, state.nodes as any) as StackBuilderNode[],
          lastSaved: new Date(),
        }));
      },

      // Handle React Flow edge changes (delete, etc.)
      onEdgesChange: (changes) => {
        set((state) => ({
          edges: applyEdgeChanges(changes, state.edges as any) as StackBuilderEdge[],
          lastSaved: new Date(),
        }));
      },

      // Handle new connection between nodes
      onConnect: (connection) => {
        set((state) => {
          // Validate connection based on component types
          const sourceNode = state.nodes.find((n) => n.id === connection.source);
          const targetNode = state.nodes.find((n) => n.id === connection.target);

          if (!sourceNode || !targetNode) {
            console.warn('Cannot create connection: source or target node not found');
            return state;
          }

          const isValid = isValidConnection(sourceNode.type, targetNode.type);

          if (!isValid) {
            // Show validation error
            const errorMessage = getConnectionValidationMessage(
              sourceNode.type,
              targetNode.type
            );
            console.error('Invalid connection:', errorMessage);

            // Add validation warning
            const newWarning: ValidationWarning = {
              id: `invalid-connection-${Date.now()}`,
              type: 'error',
              message: errorMessage,
              componentId: sourceNode.id,
            };

            return {
              ...state,
              validationWarnings: [...state.validationWarnings, newWarning],
            };
          }

          // Create valid connection
          const newEdge: any = {
            ...connection,
            id: `${connection.source}-${connection.target}`,
            data: {
              type: 'required',
              description: `${sourceNode.data.name} connects to ${targetNode.data.name}`,
            },
          };

          return {
            edges: addEdge(newEdge, state.edges as any) as StackBuilderEdge[],
            validationWarnings: state.validationWarnings.filter(
              (w) => !w.message.includes('Invalid connection')
            ),
            lastSaved: new Date(),
          };
        });
      },

      // Set stack name
      setStackName: (name) => {
        set({ stackName: name, lastSaved: new Date() });
      },

      // Set stack description
      setStackDescription: (description) => {
        set({ stackDescription: description, lastSaved: new Date() });
      },

      // Clear canvas (new stack)
      clearCanvas: () => {
        set({
          nodes: [],
          edges: [],
          selectedNodeId: null,
          validationWarnings: [],
          stackName: '',
          stackDescription: '',
          lastSaved: new Date(),
        });
      },

      // Load draft from restore
      loadDraft: (draft) => {
        set({
          nodes: draft.nodes,
          edges: draft.edges,
          stackName: draft.stackName || '',
          stackDescription: draft.stackDescription || '',
          lastSaved: draft.lastSaved,
        });
      },

      // Load a popular stack or template
      loadStack: (stack) => {
        set({
          nodes: stack.nodes,
          edges: stack.edges,
          stackName: stack.name || '',
          stackDescription: stack.description || '',
          selectedNodeId: null,
          validationWarnings: [],
          lastSaved: new Date(),
        });
      },

      // Validate stack and return warnings
      validateStack: () => {
        const { nodes, edges } = get();
        const warnings: ValidationWarning[] = [];

        // Check each node for configuration issues
        nodes.forEach((node) => {
          // Missing required configuration
          if (!node.data.isConfigured) {
            const configSchema = node.data.configSchema || {};
            const missingFields = Object.entries(configSchema)
              .filter(([key, field]) => {
                if (!field.required) return false;
                const value = node.data.config[key];
                return value === undefined || value === null || value === '';
              })
              .map(([key]) => key);

            if (missingFields.length > 0) {
              warnings.push({
                id: `missing-config-${node.id}`,
                nodeId: node.id,
                type: 'missing-config',
                severity: 'warning',
                message: `Missing required configuration: ${missingFields.join(', ')}`,
                suggestion: 'Click the component and fill in the Configuration tab',
              });
            }
          }

          // Check dependencies
          if (node.data.dependencies && node.data.dependencies.length > 0) {
            const missingDeps = node.data.dependencies.filter((depId) => {
              return !nodes.some((n) => n.data.id === depId);
            });

            if (missingDeps.length > 0) {
              warnings.push({
                id: `missing-dep-${node.id}`,
                nodeId: node.id,
                type: 'missing-dependency',
                severity: 'error',
                message: `Missing required dependencies: ${missingDeps.join(', ')}`,
                suggestion: 'Add the required components from the library',
              });
            }
          }

          // Security check: API keys hardcoded
          if (node.data.configSchema) {
            Object.entries(node.data.configSchema).forEach(([key, field]) => {
              if (field.sensitive) {
                const value = node.data.config[key];
                if (typeof value === 'string' && value.length > 10 && !value.includes('{{')) {
                  warnings.push({
                    id: `security-${node.id}-${key}`,
                    nodeId: node.id,
                    type: 'security',
                    severity: 'warning',
                    field: key,
                    message: `Potential hardcoded secret in ${key}`,
                    suggestion: 'Secrets will be replaced with placeholders on export',
                  });
                }
              }
            });
          }
        });

        set({ validationWarnings: warnings });
        return warnings;
      },

      // Generate CLI installation command
      generateCLICommand: () => {
        const { stackName } = get();
        const stackId = 'temp-' + Date.now(); // Placeholder until saved

        return `npx claude-code-templates@latest install-stack https://aitmpl.com/stack/${stackId}`;
      },

      // Generate metadata for ZIP export
      generateZipMetadata: async () => {
        const { nodes, stackName } = get();

        const components = nodes.map((node) => node.data);
        const configurations = nodes.reduce((acc, node) => {
          acc[node.id] = node.data.config;
          return acc;
        }, {} as Record<string, ComponentConfig>);

        return {
          stackName: stackName || 'my-stack',
          components,
          configurations,
        };
      },
    }),
    {
      name: 'stack-builder-draft', // localStorage key
      partialize: (state) => ({
        // Only persist these fields
        nodes: state.nodes,
        edges: state.edges,
        stackName: state.stackName,
        stackDescription: state.stackDescription,
        lastSaved: state.lastSaved,
      }),
    }
  )
);
