'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const templates = [
  {
    id: 1,
    name: 'AI Content Generator',
    description: 'Generate blog posts, social media content, and marketing copy using AI',
    category: 'Content',
    icon: '✍️',
    nodes: ['Trigger', 'AI Agent', 'Output'],
  },
  {
    id: 2,
    name: 'Email Auto-Responder',
    description: 'Automatically respond to emails with AI-generated personalized replies',
    category: 'Communication',
    icon: '📧',
    nodes: ['Trigger', 'AI Agent', 'HTTP Request', 'Output'],
  },
  {
    id: 3,
    name: 'Data Analysis Pipeline',
    description: 'Analyze data and generate insights with AI-powered reporting',
    category: 'Analytics',
    icon: '📊',
    nodes: ['Trigger', 'HTTP Request', 'AI Agent', 'Transform', 'Output'],
  },
  {
    id: 4,
    name: 'Customer Support Bot',
    description: 'AI-powered customer support with intelligent routing',
    category: 'Support',
    icon: '🤖',
    nodes: ['Trigger', 'Condition', 'AI Agent', 'Output'],
  },
  {
    id: 5,
    name: 'Social Media Monitor',
    description: 'Monitor social media and generate AI-powered summaries and responses',
    category: 'Marketing',
    icon: '📱',
    nodes: ['Trigger', 'HTTP Request', 'AI Agent', 'Output'],
  },
  {
    id: 6,
    name: 'Document Processor',
    description: 'Extract and summarize information from documents using AI',
    category: 'Productivity',
    icon: '📄',
    nodes: ['Trigger', 'Transform', 'AI Agent', 'Output'],
  },
]

const categories = ['All', 'Content', 'Communication', 'Analytics', 'Support', 'Marketing', 'Productivity']

export default function TemplatesPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Workflow Templates
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Start with pre-built workflows and customize them to your needs
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                category === 'All'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <span className="text-3xl">{template.icon}</span>
                <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-full">
                  {template.category}
                </span>
              </div>
              <CardTitle className="mt-4">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Nodes:</p>
                <div className="flex flex-wrap gap-1">
                  {template.nodes.map((node) => (
                    <span
                      key={node}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
                    >
                      {node}
                    </span>
                  ))}
                </div>
              </div>
              <Link href={`/dashboard/workflows/new?template=${template.id}`}>
                <Button className="w-full">Use Template</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coming Soon Banner */}
      <Card className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">More Templates Coming Soon!</h3>
          <p className="text-indigo-100">
            We're constantly adding new templates. Check back often or create your own custom workflows.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
