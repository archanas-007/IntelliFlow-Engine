import { create } from 'zustand'
import { Workflow, WorkflowDefinition, WorkflowNode, WorkflowEdge } from '../types'

interface WorkflowStore {
  workflow: Workflow | null
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  selectedNode: WorkflowNode | null
  setWorkflow: (workflow: Workflow) => void
  setNodes: (nodes: WorkflowNode[]) => void
  setEdges: (edges: WorkflowEdge[]) => void
  addNode: (node: WorkflowNode) => void
  updateNode: (nodeId: string, data: any) => void
  deleteNode: (nodeId: string) => void
  addEdge: (edge: WorkflowEdge) => void
  deleteEdge: (edgeId: string) => void
  setSelectedNode: (node: WorkflowNode | null) => void
  saveWorkflow: () => Promise<void>
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  workflow: null,
  nodes: [],
  edges: [],
  selectedNode: null,

  setWorkflow: (workflow) => {
    set({
      workflow,
      nodes: workflow.definition.nodes,
      edges: workflow.definition.edges,
    })
  },

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node],
    }))
  },

  updateNode: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
    }))
  },

  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode,
    }))
  },

  addEdge: (edge) => {
    set((state) => ({
      edges: [...state.edges, edge],
    }))
  },

  deleteEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId),
    }))
  },

  setSelectedNode: (node) => set({ selectedNode: node }),

  saveWorkflow: async () => {
    const { workflow, nodes, edges } = get()
    if (!workflow) return

    // This would call the API to save
    const definition: WorkflowDefinition = { nodes, edges }
    console.log('Saving workflow:', definition)
  },
}))
