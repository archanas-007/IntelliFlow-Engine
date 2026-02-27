'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { workflowsApi } from '@/lib/api/workflows'
import { WorkflowDefinition, NodeType } from '@/lib/types'

export default function NewWorkflowPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert('Please enter a workflow name')
      return
    }

    setLoading(true)

    try {
      // Create a simple default workflow
      const definition: WorkflowDefinition = {
        nodes: [
          {
            id: 'trigger-1',
            type: 'trigger' as NodeType,
            position: { x: 250, y: 0 },
            data: { label: 'Manual Trigger' },
          },
          {
            id: 'agent-1',
            type: 'agent' as NodeType,
            position: { x: 250, y: 150 },
            data: {
              label: 'AI Agent',
              config: {
                model: 'gpt-4',
                system_prompt: 'You are a helpful assistant.',
              },
            },
          },
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'trigger-1',
            target: 'agent-1',
          },
        ],
      }

      const workflow = await workflowsApi.createWorkflow({
        name,
        description: description || undefined,
        definition,
      })

      // Navigate to edit page
      router.push(`/dashboard/workflows/${workflow.id}/edit`)
    } catch (error: any) {
      console.error('Error creating workflow:', error)
      alert(error.response?.data?.detail || 'Failed to create workflow')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Workflow</CardTitle>
            <CardDescription>
              Give your workflow a name to get started
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Workflow Name *
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="My AI Workflow"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  placeholder="What does this workflow do?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Workflow'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  )
}
