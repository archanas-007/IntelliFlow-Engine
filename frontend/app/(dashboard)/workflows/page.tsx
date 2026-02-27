'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { workflowsApi } from '@/lib/api/workflows'
import { Workflow } from '@/lib/types'

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkflows()
  }, [])

  const loadWorkflows = async () => {
    try {
      const data = await workflowsApi.getWorkflows()
      setWorkflows(data.items)
    } catch (error) {
      console.error('Error loading workflows:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return

    try {
      await workflowsApi.deleteWorkflow(id)
      setWorkflows(workflows.filter((w) => w.id !== id))
    } catch (error) {
      console.error('Error deleting workflow:', error)
      alert('Failed to delete workflow')
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Workflows
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and create your AI-powered workflows
          </p>
        </div>
        <Link href="/dashboard/workflows/new">
          <Button>
            <span className="mr-2">➕</span>
            Create Workflow
          </Button>
        </Link>
      </div>

      {/* Workflows Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading workflows...</p>
        </div>
      ) : workflows.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🔄</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No workflows yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first AI-powered workflow to get started
            </p>
            <Link href="/dashboard/workflows/new">
              <Button>Create Your First Workflow</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link href={`/dashboard/workflows/${workflow.id}`}>
                      <h3 className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                        {workflow.name}
                      </h3>
                    </Link>
                    {workflow.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {workflow.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      workflow.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}
                  >
                    {workflow.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span>
                    {workflow.definition?.nodes?.length || 0} nodes
                  </span>
                  <span>
                    {new Date(workflow.updated_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link href={`/dashboard/workflows/${workflow.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(workflow.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
