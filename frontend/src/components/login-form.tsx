'use client'

import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLoginMutation } from '@/lib/features/auth/authApi'
import { setCredentials } from '@/lib/features/auth/authSlice'
import { useAppDispatch } from '@/lib/hooks'
import { cn, getErrorMessage } from '@/lib/utils'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [email, setEmail] = useState(
    process.env.NEXT_PUBLIC_DEMO_USER_EMAIL || ''
  )
  const [password, setPassword] = useState(
    process.env.NEXT_PUBLIC_DEMO_USER_PASSWORD || ''
  )
  const [login, { isLoading, error, isError }] = useLoginMutation()
  const dispatch = useAppDispatch()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const result = await login({ email, password }).unwrap()
      // Store credentials in Redux state
      dispatch(
        setCredentials({
          token: result.access_token,
          user: result.user,
        })
      )
      // Redirect to dashboard or home page
      router.push('/')
    } catch (err) {
      // Error is handled by RTK Query and displayed in the UI
      console.error('Login failed:', err)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              {isError && (
                <Alert variant="destructive">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertDescription>
                    {getErrorMessage(error) || 'Invalid email or password'}
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
