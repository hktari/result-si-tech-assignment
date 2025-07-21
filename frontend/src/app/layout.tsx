import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { ProtectedLayout } from '@/components/ProtectedLayout'
import { ToastProvider } from '@/components/ui/toast-provider'

import StoreProvider from './StoreProvider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Activity Journal',
  description:
    'Track your activities, reflect on habits, and visualize your progress',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          <ToastProvider />
          <ProtectedLayout>{children}</ProtectedLayout>
        </StoreProvider>
      </body>
    </html>
  )
}
