import { apiClient } from './client'
import {
  Workflow,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  PaginatedResponse,
} from '../types'

export const workflowsApi = {
  async getWorkflows(page = 1, pageSize = 20): Promise<PaginatedResponse<Workflow>> {
    return apiClient.get<PaginatedResponse<Workflow>>('/workflows', {
      page,
      page_size: pageSize,
    })
  },

  async getWorkflow(id: string): Promise<Workflow> {
    return apiClient.get<Workflow>(`/workflows/${id}`)
  },

  async createWorkflow(data: CreateWorkflowRequest): Promise<Workflow> {
    return apiClient.post<Workflow>('/workflows', data)
  },

  async updateWorkflow(id: string, data: UpdateWorkflowRequest): Promise<Workflow> {
    return apiClient.put<Workflow>(`/workflows/${id}`, data)
  },

  async deleteWorkflow(id: string): Promise<void> {
    return apiClient.delete<void>(`/workflows/${id}`)
  },

  async duplicateWorkflow(id: string): Promise<Workflow> {
    return apiClient.post<Workflow>(`/workflows/${id}/duplicate`)
  },
}
