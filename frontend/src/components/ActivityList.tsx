'use client'

import { DialogTitle } from '@radix-ui/react-dialog'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { TrashIcon } from 'lucide-react'
import { toast } from 'sonner'

import React, { useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { components } from '@/lib/api-types'
import { useDeleteActivityMutation } from '@/lib/features/activities/activitiesApi'
import { getErrorMessage } from '@/lib/utils'

type ActivityResponseDto = components['schemas']['ActivityResponseDto']

interface ActivityListProps {
  activities: ActivityResponseDto[]
}

export function ActivityList({ activities }: ActivityListProps) {
  const [deleteActivity, { isLoading: isDeleting, error }] =
    useDeleteActivityMutation()
  const [activityToDelete, setActivityToDelete] =
    useState<ActivityResponseDto | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleDelete = async (activity: ActivityResponseDto) => {
    if (!activity?.id) return

    try {
      await deleteActivity(activity.id).unwrap()
      toast.success('Activity deleted', {
        description: `${activity.title} has been removed from your activities`,
      })
      setDialogOpen(false)
    } catch (err) {
      console.error('Failed to delete activity:', err)
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
              <Dialog
                open={dialogOpen && activityToDelete?.id === activity.id}
                onOpenChange={open => {
                  setDialogOpen(open)
                  if (open) {
                    setActivityToDelete(activity)
                  } else {
                    setActivityToDelete(null)
                  }
                }}
              >
                <DialogTrigger
                  data-testid={`delete-activity-${activity.id}`}
                  className="p-2 cursor-pointer rounded-md border outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:border-transparent focus-visible:outline-none hover:bg-gray-100"
                >
                  <TrashIcon size={20} />
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Activity</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete &quot;{activity.title}
                      &quot;? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>

                  {error && (
                    <Alert variant="destructive" className="mt-2">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <AlertDescription>
                        {getErrorMessage(error) || 'Failed to delete activity'}
                      </AlertDescription>
                    </Alert>
                  )}

                  <DialogFooter className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={isDeleting}
                      onClick={() => handleDelete(activity)}
                      variant="destructive"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
