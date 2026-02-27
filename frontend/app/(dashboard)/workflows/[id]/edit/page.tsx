'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { workflowsApi } from '@/lib/api/workflows'
import { Workflow, WorkflowNode as WorkflowNodeType, NodeType } from '@/lib/types'

// Custom node component
function CustomNode({ data, selected }: { data: any; selected: boolean }) {
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'trigger': return '⚡'
      case 'agent': return '🤖'
      case 'http_request': return '🌐'
      case 'condition': return '🔀'
      case 'transform': return '🔄'
      case 'output': return '📤'
      default: return '📦'
    }
  }

  return (
    <div className={`px-4 py-2 rounded-lg border-2 shadow-md min-w-[150px] ${
      selected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 bg-white dark:bg-gray-800'
    }`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{getNodeIcon(data.type)}</span>
        <span className="font-medium text-sm">{data.label}</span>
      </div>
    </div>
  )
}

const nodeTypes = {
  custom: CustomNode,
}

export default function WorkflowEditPage() {
  const params = useParams()
  const router = useRouter()
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    loadWorkflow()
  }, [params.id])

  const loadWorkflow = async () => {
    try {
      const data = await workflowsApi.getWorkflow(params.id as string)
      setWorkflow(data)

      // Convert workflow nodes to ReactFlow nodes
      const flowNodes: Node[] = data.definition.nodes.map((node: WorkflowNodeType) => ({
        id: node.id,
        type: 'custom',
        position: node.position,
        data: {
          ...node.data,
          type: node.type,
        },
      }))

      // Convert workflow edges to ReactFlow edges
      const flowEdges: Edge[] = data.definition.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      }))

      setNodes(flowNodes)
      setEdges(flowEdges)
    } catch (error) {
      console.error('Error loading workflow:', error)
      alert('Failed to load workflow')
      router.push('/dashboard/workflows')
    } finally {
      setLoading(false)
    }
  }

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds))
    },
    [setEdges]
  )

  const addNode = (type: NodeType) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type: 'custom',
      position: { x: 250, y: 100 + nodes.length * 100 },
      data: {
        type,
        label: `New ${type.replace('_', ' ')}`,
      },
    }
    setNodes((nds) => [...nds, newNode])
  }

  const handleSave = async () => {
    if (!workflow) return

    setSaving(true)
    try {
      // Convert ReactFlow nodes back to workflow nodes
      const workflowNodes = nodes.map((node) => ({
        id: node.id,
        type: node.data.type as NodeType,
        position: node.position,
        data: { label: node.data.label, config: node.data.config },
      }))

      // Convert ReactFlow edges back to workflow edges
      const workflowEdges = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      }))

      await workflowsApi.updateWorkflow(workflow.id, {
        definition: { nodes: workflowNodes, edges: workflowEdges },
      })

      alert('Workflow saved successfully!')
    } catch (error) {
      console.error('Error saving workflow:', error)
      alert('Failed to save workflow')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading workflow...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              ← Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {workflow?.name}
              </h1>
              {workflow?.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {workflow.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => addNode('trigger')}>
              ⚡ Trigger
            </Button>
            <Button variant="outline" onClick={() => addNode('agent')}>
              🤖 Agent
            </Button>
            <Button variant="outline" onClick={() => addNode('http_request')}>
              🌐 HTTP
            </Button>
            <Button variant="outline" onClick={() => addNode('condition')}>
              🔀 Condition
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : '💾 Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Flow Canvas */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  )
}
