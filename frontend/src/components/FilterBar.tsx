'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface FilterBarProps {
  filters: {
    dateRange: string
    interval: 'daily' | 'weekly' | 'monthly'
    metric: 'timePerTitle' | 'timePerTitleStacked'
  }
  onFilterChange: (filters: FilterBarProps['filters']) => void
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisYear', label: 'This Year' },
  ]

  const intervalOptions = [
    { value: 'daily' as const, label: 'Daily' },
    { value: 'weekly' as const, label: 'Weekly' },
    { value: 'monthly' as const, label: 'Monthly' },
  ]

  const metricOptions = [
    { value: 'timePerTitle' as const, label: 'Time per Activity' },
    { value: 'timePerTitleStacked' as const, label: 'Stacked View' },
  ]

  const handleDateRangeChange = (value: string) => {
    onFilterChange({ ...filters, dateRange: value })
  }

  const handleIntervalChange = (value: 'daily' | 'weekly' | 'monthly') => {
    onFilterChange({ ...filters, interval: value })
  }

  const handleMetricChange = (
    value: 'timePerTitle' | 'timePerTitleStacked'
  ) => {
    onFilterChange({ ...filters, metric: value })
  }

  return (
    <Card className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Date Range Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Date Range:</label>
            <select
              value={filters.dateRange}
              onChange={e => handleDateRangeChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Interval Selector (only show when metric is timePerTitleStacked) */}
          {filters.metric === 'timePerTitleStacked' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Interval:</label>
              <div className="flex gap-1">
                {intervalOptions.map(option => (
                  <Button
                    key={option.value}
                    variant={
                      filters.interval === option.value ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleIntervalChange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Metric Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">View:</label>
            <div className="flex gap-1">
              {metricOptions.map(option => (
                <Button
                  key={option.value}
                  variant={
                    filters.metric === option.value ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => handleMetricChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
