'use client'

import { Toaster } from 'sonner'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'group border border-border rounded-lg p-4 shadow-lg',
          title: 'text-sm font-medium',
          description: 'text-sm text-muted-foreground',
          success: 'bg-background text-green-600 border-green-500/20',
          error: 'bg-background text-destructive border-destructive/20',
          info: 'bg-background text-blue-600 border-blue-500/20',
          warning: 'bg-background text-yellow-600 border-yellow-500/20',
        },
        duration: 3000,
      }}
    />
  )
}
