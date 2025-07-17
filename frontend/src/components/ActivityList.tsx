'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { useDeleteActivityMutation } from '@/lib/features/activities/activitiesApi'
import type { components } from '@/lib/api-types'

type ActivityResponseDto = components['schemas']['ActivityResponseDto']

interface ActivityListProps {
  activities: ActivityResponseDto[]
}

export function ActivityList({ activities }: ActivityListProps) {
  const [deleteActivity] = useDeleteActivityMutation()

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      try {
        await deleteActivity(id).unwrap()
      } catch (error) {
        console.error('Failed to delete activity:', error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">{activity.title}</h3>
              <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {formatDuration(activity.duration)}
              </span>
            </div>
            {activity.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {activity.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {formatDate(activity.timestamp)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(activity.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
