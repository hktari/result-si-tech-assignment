'use client'

import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetActivitiesQuery } from '@/lib/redux/features/activities/activitiesApi'
import { getMondayOfThisWeek } from '@/lib/utils/dateUtils'

export function QuickStats() {
  const { data: activitiesData } = useGetActivitiesQuery({ limit: '1000' })

  const activities = activitiesData?.activities || []
  const totalActivities = activities.length
  const totalMinutes = activities.reduce(
    (sum, activity) => sum + activity.duration,
    0
  )
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10
  // Calculate activities this week
  const monday = getMondayOfThisWeek()
  const thisWeekActivities = activities.filter(
    activity => new Date(activity.timestamp) >= monday
  ).length

  // Calculate average daily time this week
  const thisWeekMinutes = activities
    .filter(activity => new Date(activity.timestamp) >= monday)
    .reduce((sum, activity) => sum + activity.duration, 0)
  const avgDailyMinutes = Math.round(thisWeekMinutes / 7)

  const stats = [
    {
      title: 'Total Activities',
      value: totalActivities.toString(),
      description: 'All time',
    },
    {
      title: 'Total Time',
      value: `${totalHours}h`,
      description: 'Hours logged',
    },
    {
      title: 'This Week',
      value: thisWeekActivities.toString(),
      description: 'Activities logged',
    },
    {
      title: 'Daily Average',
      value: `${avgDailyMinutes}m`,
      description: 'This week',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
