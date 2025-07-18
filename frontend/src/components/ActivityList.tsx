'use client'

import { DeleteIcon, TrashIcon } from 'lucide-react'

import React from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { components } from '@/lib/api-types'
import { useDeleteActivityMutation } from '@/lib/features/activities/activitiesApi'

type ActivityResponseDto = components['schemas']['ActivityResponseDto']

interface ActivityListProps {
  activities: ActivityResponseDto[]
}

export function ActivityList({ activities }: ActivityListProps) {
  const [deleteActivity, { isLoading: isDeleting }] =
    useDeleteActivityMutation()
  const handleDelete = async (activityId: string) => {
    if (!activityId) return

    try {
      await deleteActivity(activityId).unwrap()
    } catch (error) {
      console.error('Failed to delete activity:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
    <>
      <div className="space-y-4">
        {activities.map(activity => (
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
              <Dialog>
                <DialogTrigger>
                  {' '}
                  <Button variant="outline">
                    <TrashIcon />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <>
                    <p>Are you sure you want to delete this activity?</p>
                    <Button
                      disabled={isDeleting}
                      onClick={() => handleDelete(activity.id)}
                      variant="destructive"
                    >
                      Yes
                    </Button>
                  </>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
