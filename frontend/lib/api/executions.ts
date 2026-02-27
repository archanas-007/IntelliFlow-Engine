import { apiClient } from './client'
import {
  Execution,
  CreateExecutionRequest,
  NodeExecutionLog,
  PaginatedResponse,
} from '../types'

export const executionsApi = {
  async getExecutions(
    workflowId?: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Execution>> {
    return apiClient.get<PaginatedResponse<Execution>>('/executions', {
      workflow_id: workflowId,
      page,
      page_size: pageSize,
    })
  },

  async getExecution(id: string): Promise<Execution> {
    return apiClient.get<Execution>(`/executions/${id}`)
  },

  async createExecution(data: CreateExecutionRequest): Promise<Execution> {
    return apiClient.post<Execution>('/executions', data)
  },

  async cancelExecution(id: string): Promise<void> {
    return apiClient.post<void>(`/executions/${id}/cancel`)
  },

  async getExecutionLogs(executionId: string): Promise<NodeExecutionLog[]> {
    return apiClient.get<NodeExecutionLog[]>(`/executions/${executionId}/logs`)
  },
}
