import axios from 'axios'
import type { ProblemDetail } from '@/types'

export function extractError(error: unknown): string {
  if (axios.isAxiosError<ProblemDetail>(error)) {
    const detail = error.response?.data?.detail
    if (detail) return detail
    const errors = error.response?.data?.errors
    if (errors && errors.length > 0) return errors[0]
    if (error.response?.status === 401) return 'Identifiants invalides'
  }
  return 'Une erreur est survenue, réessayez'
}
