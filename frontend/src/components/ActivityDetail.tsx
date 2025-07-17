'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import type { components } from '@/lib/api-types'

type ActivityResponseDto = components['schemas']['ActivityResponseDto']

interface ActivityDetailProps {
  activity: ActivityResponseDto
  onClose: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function ActivityDetail({ activity, onClose, onEdit, onDelete }: ActivityDetailProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{activity.title}</CardTitle>
              <CardDescription className="text-lg mt-2">
                {formatDuration(activity.duration)} • {formatDate(activity.timestamp)}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {activity.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {activity.description}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-1">Duration</h3>
              <p className="text-muted-foreground">{formatDuration(activity.duration)}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Date & Time</h3>
              <p className="text-muted-foreground">{formatDate(activity.timestamp)}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            {onEdit && (
              <Button onClick={onEdit} variant="outline">
                Edit Activity
              </Button>
            )}
            {onDelete && (
              <Button onClick={onDelete} variant="destructive">
                Delete Activity
              </Button>
            )}
            <Button onClick={onClose} variant="secondary" className="ml-auto">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
