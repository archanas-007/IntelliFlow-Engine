// User Types
export interface User {
  id: string
  username: string
  created_at: string
  is_active: boolean
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

// Workflow Types
export interface Workflow {
  id: string
  user_id: string
  name: string
  description?: string
  definition: WorkflowDefinition
  is_active: boolean
  created_at: string
  updated_at: string
  last_executed_at?: string
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export interface WorkflowNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  data: NodeData
}

export type NodeType =
  | 'trigger'
  | 'agent'
  | 'http_request'
  | 'condition'
  | 'transform'
  | 'output'

export interface NodeData {
  label: string
  config?: Record<string, any>
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface CreateWorkflowRequest {
  name: string
  description?: string
  definition: WorkflowDefinition
}

export interface UpdateWorkflowRequest {
  name?: string
  description?: string
  definition?: WorkflowDefinition
  is_active?: boolean
}

// Execution Types
export interface Execution {
  id: string
  workflow_id: string
  user_id: string
  status: ExecutionStatus
  started_at: string
  completed_at?: string
  duration_seconds?: number
  input_data?: Record<string, any>
  output_data?: Record<string, any>
  error_message?: string
}

export type ExecutionStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface CreateExecutionRequest {
  workflow_id: string
  input_data?: Record<string, any>
}

export interface NodeExecutionLog {
  id: string
  execution_id: string
  node_id: string
  node_type: string
  status: ExecutionStatus
  started_at: string
  completed_at?: string
  output_data?: Record<string, any>
  error_message?: string
}

// WebSocket Event Types
export interface WebSocketEvent {
  type: EventType
  data: any
}

export type EventType =
  | 'execution_started'
  | 'execution_completed'
  | 'execution_failed'
  | 'node_started'
  | 'node_completed'
  | 'node_failed'
  | 'agent_token'
  | 'stream_chunk'

export interface ExecutionStartedEvent {
  execution_id: string
  workflow_id: string
  workflow_name: string
}

export interface NodeStartedEvent {
  execution_id: string
  node_id: string
  node_type: string
}

export interface AgentTokenEvent {
  execution_id: string
  node_id: string
  token: string
  full_response: string
}

// Agent Types
export interface AgentConfig {
  id: string
  name: string
  model: string
  system_prompt?: string
  temperature?: number
  max_tokens?: number
  tools?: string[]
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
