'use client'

import { usePathname } from 'next/navigation'
import { AuthGuard } from './AuthGuard'
import { Navigation } from './Navigation'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

// Routes that don't require authentication
const publicRoutes = ['/login', '/register']

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const pathname = usePathname()
  
  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(pathname)
  
  if (isPublicRoute) {
    // Public routes don't need AuthGuard or Navigation
    return <>{children}</>
  }
  
  // Protected routes need AuthGuard and Navigation
  return (
    <AuthGuard>
      <Navigation />
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </AuthGuard>
  )
}
