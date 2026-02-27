'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { workflowsApi } from '@/lib/api/workflows'
import { executionsApi } from '@/lib/api/executions'
import { Workflow, Execution } from '@/lib/types'

export default function DashboardPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [executions, setExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [workflowsData, executionsData] = await Promise.all([
        workflowsApi.getWorkflows(1, 5),
        executionsApi.getExecutions(undefined, 1, 5),
      ])
      setWorkflows(workflowsData.items)
      setExecutions(executionsData.items)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      name: 'Total Workflows',
      value: workflows.length,
      icon: '🔄',
      href: '/dashboard/workflows',
    },
    {
      name: 'Recent Executions',
      value: executions.length,
      icon: '⚡',
      href: '/dashboard/executions',
    },
    {
      name: 'Success Rate',
      value: `${executions.length > 0
        ? Math.round((executions.filter(e => e.status === 'completed').length / executions.length) * 100)
        : 100}%`,
      icon: '✅',
      href: '/dashboard/executions',
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Here's what's happening with your workflows
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </CardTitle>
                <span className="text-2xl">{stat.icon}</span>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with these common actions</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Link href="/dashboard/workflows/new">
            <Button>
              <span className="mr-2">➕</span>
              Create Workflow
            </Button>
          </Link>
          <Link href="/dashboard/templates">
            <Button variant="outline">
              <span className="mr-2">📋</span>
              Browse Templates
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Workflows */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Workflows</CardTitle>
              <CardDescription>Your latest workflow automations</CardDescription>
            </div>
            <Link href="/dashboard/workflows">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          ) : workflows.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No workflows yet. Create your first workflow!
              </p>
              <Link href="/dashboard/workflows/new">
                <Button>Create Workflow</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <Link
                  key={workflow.id}
                  href={`/dashboard/workflows/${workflow.id}`}
                  className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {workflow.name}
                      </h3>
                      {workflow.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {workflow.description}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(workflow.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
            <Link href="/dashboard/executions">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          ) : executions.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No executions yet. Run a workflow to see results here.
            </p>
          ) : (
            <div className="space-y-4">
              {executions.map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {execution.status === 'completed' && '✅'}
                      {execution.status === 'running' && '🔄'}
                      {execution.status === 'failed' && '❌'}
                      {execution.status === 'pending' && '⏳'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {execution.workflow_id}
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
