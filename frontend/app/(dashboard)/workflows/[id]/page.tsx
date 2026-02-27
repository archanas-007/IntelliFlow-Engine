'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { workflowsApi, executionsApi } from '@/lib/api'
import { Workflow, Execution } from '@/lib/types'

export default function WorkflowDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [executions, setExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)

  useEffect(() => {
    loadWorkflow()
    loadExecutions()
  }, [params.id])

  const loadWorkflow = async () => {
    try {
      const data = await workflowsApi.getWorkflow(params.id as string)
      setWorkflow(data)
    } catch (error) {
      console.error('Error loading workflow:', error)
      router.push('/dashboard/workflows')
    } finally {
      setLoading(false)
    }
  }

  const loadExecutions = async () => {
    try {
      const data = await executionsApi.getExecutions(params.id as string, 1, 5)
      setExecutions(data.items)
    } catch (error) {
      console.error('Error loading executions:', error)
    }
  }

  const handleExecute = async () => {
    if (!workflow) return

    setExecuting(true)
    try {
      const execution = await executionsApi.createExecution({
        workflow_id: workflow.id,
        input_data: {},
      })
      router.push(`/dashboard/executions/${execution.id}`)
    } catch (error) {
      console.error('Error executing workflow:', error)
      alert('Failed to execute workflow')
    } finally {
      setExecuting(false)
    }
  }

  const handleDelete = async () => {
    if (!workflow) return

    if (!confirm('Are you sure you want to delete this workflow?')) {
      return
    }

    try {
      await workflowsApi.deleteWorkflow(workflow.id)
      router.push('/dashboard/workflows')
    } catch (error) {
      console.error('Error deleting workflow:', error)
      alert('Failed to delete workflow')
    }
  }

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅'
      case 'running': return '🔄'
      case 'failed': return '❌'
      case 'pending': return '⏳'
      default: return '❓'
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
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard/workflows">
            <Button variant="outline">← Back</Button>
          </Link>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {workflow?.name}
            </h1>
            {workflow?.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{workflow.description}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Link href={`/dashboard/workflows/${workflow?.id}/edit`}>
              <Button variant="outline">✏️ Edit</Button>
            </Link>
            <Button
              onClick={handleExecute}
              disabled={executing || !workflow?.is_active}
              className="bg-green-600 hover:bg-green-700"
            >
              {executing ? '⏳ Running...' : '▶️ Run Now'}
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              🗑️ Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Workflow Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Created At
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {workflow?.created_at
                ? new Date(workflow.created_at).toLocaleDateString()
                : '-'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Executions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {executions.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              workflow?.is_active
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
            }`}>
              {workflow?.is_active ? 'Active' : 'Inactive'}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Nodes */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Workflow Nodes</CardTitle>
          <CardDescription>Visual representation of your workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {workflow?.definition.nodes?.map((node) => (
              <div
                key={node.id}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <span className="text-2xl">{getNodeIcon(node.type)}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {node.data?.label || node.id}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {node.type}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Connections:</p>
            <div className="space-y-1">
              {workflow?.definition.edges?.map((edge) => (
                <div key={edge.id} className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{edge.source}</span>
                  {' → '}
                  <span className="font-medium">{edge.target}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>Latest workflow runs</CardDescription>
            </div>
            {executions.length > 0 && (
              <Link href={`/dashboard/executions?workflow=${workflow?.id}`}>
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {executions.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No executions yet. Click "Run Now" to execute this workflow.
            </p>
          ) : (
            <div className="space-y-3">
              {executions.map((execution) => (
                <Link
                  key={execution.id}
                  href={`/dashboard/executions/${execution.id}`}
                  className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getStatusIcon(execution.status)}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Execution {execution.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(execution.started_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      execution.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : execution.status === 'failed'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : execution.status === 'running'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {execution.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
