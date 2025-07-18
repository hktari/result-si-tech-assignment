'use client'

import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  useGetActivitiesQuery,
  useGetInsightsQuery,
} from '@/lib/features/activities/activitiesApi'

import { ActivityList } from './ActivityList'
import { ActivityModal } from './ActivityModal'
import { DashboardChart } from './DashboardChart'
import { QuickStats } from './QuickStats'
import { SearchFilter } from './SearchFilter'

export function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const {
    data: activitiesData,
    isLoading,
    error,
  } = useGetActivitiesQuery({ limit: '10' })
  const { data: insightsData } = useGetInsightsQuery({
    metric: 'timePerTitle',
  })

  const recentActivities = activitiesData?.activities || []

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Activity Journal
          </h1>
          <p className="text-muted-foreground">
            Track your activities and reflect on your habits
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Log Activity</Button>
      </div>

      {/* Quick Stats */}
      <QuickStats />

      {/* Today's Summary Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Summary</CardTitle>
          <CardDescription>
            Time spent on different activities today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insightsData?.data && insightsData.data.length > 0 ? (
            <DashboardChart data={insightsData.data} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No activity data for today yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Filter */}
      {/* TODO: review search */}
      <SearchFilter onSearchResults={() => {}} />

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Your latest logged activities</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading activities. Please try again.
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activities logged yet. Start by logging your first activity!
            </div>
          ) : (
            <ActivityList activities={recentActivities} />
          )}
        </CardContent>
      </Card>

      {/* Activity Modal */}
      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
