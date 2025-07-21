import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to extract error message from RTK Query error
export function getErrorMessage(error: unknown): string | undefined {
  if (!error) return 'An unknown error occurred'

  // Handle FetchBaseQueryError
  if (typeof error === 'object' && 'status' in error) {
    const fetchError = error as FetchBaseQueryError

    // Handle error data based on its structure
    if (fetchError.data && typeof fetchError.data === 'object') {
      if ('message' in fetchError.data) {
        return fetchError.data.message as string
      }
      if ('error' in fetchError.data) {
        return fetchError.data.error as string
      }
    }

    // Handle status-based errors
    if (fetchError.status === 401) {
      return 'Invalid email or password'
    }
    if (fetchError.status === 403) {
      return 'Access denied'
    }
    if (fetchError.status === 404) {
      return 'Resource not found'
    }
    if (fetchError.status === 500) {
      return 'Server error. Please try again later'
    }

    return `Error ${fetchError.status}: ${JSON.stringify(fetchError.data) || 'Unknown error'}`
  }

  // Handle SerializedError or other error types
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      return error.message
    }
  }
}
