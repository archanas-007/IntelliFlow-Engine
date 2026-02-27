'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { executionsApi } from '@/lib/api/executions'
import { Execution, NodeExecutionLog } from '@/lib/types'

export default function ExecutionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [execution, setExecution] = useState<Execution | null>(null)
  const [logs, setLogs] = useState<NodeExecutionLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExecution()
  }, [params.id])

  const loadExecution = async () => {
    try {
      const [executionData, logsData] = await Promise.all([
        executionsApi.getExecution(params.id as string),
        executionsApi.getExecutionLogs(params.id as string),
      ])
      setExecution(executionData)
      setLogs(logsData)
    } catch (error) {
      console.error('Error loading execution:', error)
      alert('Failed to load execution')
      router.push('/dashboard/executions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅'
      case 'running': return '🔄'
      case 'failed': return '❌'
      case 'pending': return '⏳'
      case 'cancelled': return '🚫'
      default: return '❓'
    }
  }

  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'trigger': return '⚡'
      case 'agent': return '🤖'
      case 'http_request': return '🌐'
      case 'condition': return '🔀'
      case 'transform': return '🔄'
      case 'output': return '📤'
      default: return '📦'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading execution...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard/executions">
            <Button variant="outline">← Back</Button>
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Execution Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {execution?.id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getStatusIcon(execution?.status || '')}</span>
            <span className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
              {execution?.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Info Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Started At
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {execution?.started_at ? new Date(execution.started_at).toLocaleString() : '-'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {execution?.duration_seconds
                ? `${execution.duration_seconds}s`
                : execution?.status === 'running'
                ? 'Running...'
                : '-'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Workflow ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {execution?.workflow_id.slice(0, 8)}...
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Input/Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Input Data</CardTitle>
            <CardDescription>Data provided to the workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(execution?.input_data || {}, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Output Data</CardTitle>
            <CardDescription>Data produced by the workflow</CardDescription>
          </CardHeader>
          <CardContent>
            {execution?.output_data ? (
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(execution.output_data, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                {execution?.status === 'running'
                  ? 'Waiting for output...'
                  : 'No output data'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {execution?.error_message && (
        <Card className="mb-8 border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 dark:text-red-400">{execution.error_message}</p>
          </CardContent>
        </Card>
      )}

      {/* Node Execution Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Node Execution Logs</CardTitle>
          <CardDescription>Detailed logs for each node in the workflow</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No node logs available
            </p>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getNodeIcon(log.node_type)}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {log.node_id}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {log.node_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getStatusIcon(log.status)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : log.status === 'failed'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Started: </span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(log.started_at).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Completed: </span>
                      <span className="text-gray-900 dark:text-white">
                        {log.completed_at ? new Date(log.completed_at).toLocaleString() : '-'}
                      </span>
                    </div>
                  </div>

                  {log.output_data && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-indigo-600 dark:text-indigo-400">
                        View Output
                      </summary>
                      <pre className="mt-2 bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.output_data, null, 2)}
                      </pre>
                    </details>
                  )}

                  {log.error_message && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
                      {log.error_message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
