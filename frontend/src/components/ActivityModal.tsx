'use client'

import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { toast } from 'sonner'

import React, { useEffect, useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useCreateActivityMutation } from '@/lib/features/activities/activitiesApi'
import { getErrorMessage } from '@/lib/utils'

import { AutocompleteInput } from './AutocompleteInput'

interface ActivityModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ActivityModal({ isOpen, onClose }: ActivityModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [timestamp, setTimestamp] = useState(() => {
    const now = new Date()
    return now.toISOString().slice(0, 16) // Format for datetime-local input
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [createActivity, { isLoading, error }] = useCreateActivityMutation()

  useEffect(() => {
    if (error) {
      setErrorMessage(getErrorMessage(error) || 'Failed to create activity')
    }
  }, [error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!title.trim() || !duration) {
      setErrorMessage('Title and duration are required')
      return
    }

    try {
      await createActivity({
        title: title.trim(),
        description: description.trim() || undefined,
        duration: parseInt(duration),
        timestamp: new Date(timestamp).toISOString(),
      }).unwrap()

      // Show success toast
      toast.success('Activity created successfully', {
        description: `${title} has been added to your activities`,
      })

      // Reset form
      setTitle('')
      setDescription('')
      setDuration('')
      setTimestamp(() => {
        const now = new Date()
        return now.toISOString().slice(0, 16)
      })

      onClose()
    } catch (err) {
      console.error('Failed to create activity:', err)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
        <Card className="w-full max-w-md pointer-events-auto bg-white">
          <CardHeader>
            <CardTitle>Log New Activity</CardTitle>
            <CardDescription>
              Record what you&apos;ve been working on
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <Alert variant="destructive" className="mb-4">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium mb-1"
                >
                  Activity Title *
                </label>
                <AutocompleteInput
                  value={title}
                  onChange={setTitle}
                  placeholder="e.g., Reading, Exercise, Coding"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1"
                >
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Add more details about this activity..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium mb-1"
                >
                  Duration (minutes) *
                </label>
                <input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  placeholder="30"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="timestamp"
                  className="block text-sm font-medium mb-1"
                >
                  Date & Time *
                </label>
                <input
                  id="timestamp"
                  type="datetime-local"
                  value={timestamp}
                  onChange={e => setTimestamp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading || !title.trim() || !duration}
                >
                  {isLoading ? 'Saving...' : 'Save Activity'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
