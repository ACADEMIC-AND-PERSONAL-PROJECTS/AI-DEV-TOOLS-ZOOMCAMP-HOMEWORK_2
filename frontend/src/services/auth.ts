import api from './api'
import type { AuthResponse } from '@/types'

export function register(email: string, password: string, fullName: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/register', { email, password, fullName }).then((r) => r.data)
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data)
}
