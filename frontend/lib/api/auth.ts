import { apiClient } from './client'
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from '../types'

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const formData = new FormData()
    formData.append('username', data.username)
    formData.append('password', data.password)

    return apiClient.post<AuthResponse>('/auth/login', formData)
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', data)
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me')
  },

  async logout(): Promise<void> {
    return apiClient.post<void>('/auth/logout')
  },
}
