'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FilterBar } from '@/components/FilterBar'
import { InsightsChart } from '@/components/InsightsChart'
import { useGetInsightsQuery } from '@/lib/features/activities/activitiesApi'

export default function InsightsPage() {
  const [filters, setFilters] = useState({
    dateRange: 'last7days',
    interval: 'daily' as 'daily' | 'weekly' | 'monthly',
    metric: 'timePerTitle' as 'timePerTitle' | 'timePerTitleStacked'
  })

  const { data: insightsData, isLoading, error } = useGetInsightsQuery({
    metric: filters.interval
  })

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
          <p className="text-muted-foreground">
            Visualize your activity patterns and trends
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filters.metric === 'timePerTitle' ? 'Time per Activity' : 'Time per Activity (Stacked)'}
          </CardTitle>
          <CardDescription>
            {filters.interval.charAt(0).toUpperCase() + filters.interval.slice(1)} view
            {insightsData && (
              <span className="ml-2 text-sm font-medium">
                • Total: {insightsData.data?.reduce((sum, item) => sum + (item.totalDuration || 0), 0) || 0} minutes
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-2">Error loading insights</div>
              <p className="text-muted-foreground">Please try again later</p>
            </div>
          ) : !insightsData?.data || insightsData.data.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-2">No data available</div>
              <p className="text-sm text-muted-foreground">
                Start logging activities to see insights
              </p>
            </div>
          ) : (
            <InsightsChart 
              data={insightsData.data} 
              metric={filters.metric}
              interval={filters.interval}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
