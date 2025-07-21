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
  ActivityResponseDto,
  useGetActivitiesQuery,
  useGetInsightsQuery,
} from '@/lib/features/activities/activitiesApi'
import { dateRangeToStartEnd } from '@/lib/utils/dateUtils'

import { ActivityList } from './ActivityList'
import { ActivityModal } from './ActivityModal'
import { DashboardChart } from './DashboardChart'
import { QuickStats } from './QuickStats'
import { SearchFilter } from './SearchFilter'

export function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<ActivityResponseDto[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const {
    data: activitiesData,
    isLoading,
    error,
  } = useGetActivitiesQuery({ limit: '10' })
  const { data: insightsData } = useGetInsightsQuery({
    metric: 'timePerTitle',
    interval: 'daily',
    ...dateRangeToStartEnd('today'),
  })

  const originalActivities = activitiesData?.activities || []
  const displayedActivities = isSearching ? searchResults : originalActivities

  const handleSearchResults = (results: ActivityResponseDto[]) => {
    setSearchResults(results)
    setIsSearching(results.length > 0)
  }

  const handleClearSearch = () => {
    setSearchResults([])
    setIsSearching(false)
  }

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
      <SearchFilter
        onSearchResults={handleSearchResults}
        onClearSearch={handleClearSearch}
      />

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isSearching ? 'Search Results' : 'Recent Activities'}
          </CardTitle>
          <CardDescription>
            {isSearching
              ? `Found ${searchResults.length} matching activities`
              : 'Your latest logged activities'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && !isSearching ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error && !isSearching ? (
            <div className="text-center py-8 text-red-500">
              Error loading activities. Please try again.
            </div>
          ) : displayedActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isSearching
                ? 'No activities found matching your search.'
                : 'No activities logged yet. Start by logging your first activity!'}
            </div>
          ) : (
            <ActivityList activities={displayedActivities} />
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
