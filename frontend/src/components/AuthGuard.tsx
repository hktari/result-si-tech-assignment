'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/lib/hooks'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const { token, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Check if user is authenticated
    if (!token || !user) {
      // Redirect to login page
      router.push('/login')
    }
  }, [token, user, router])

  // Show loading or nothing while redirecting
  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // User is authenticated, render children
  return <>{children}</>
}
