'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import React from 'react'

import type { components, operations } from '@/lib/api-types'

interface DashboardChartProps {
  data: operations['InsightsController_getInsights']['responses']['200']['content']['application/json']['data']
}

export function DashboardChart({ data }: DashboardChartProps) {
  const formatTooltip = (value: number, name: string) => {
    if (name === 'totalDuration') {
      const hours = Math.floor(value / 60)
      const minutes = value % 60
      const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
      return [timeStr, 'Total Time']
    }
    return [value, name === 'activityCount' ? 'Activities' : name]
  }

  const formatYAxisTick = (value: number) => {
    const hours = Math.floor(value / 60)
    return hours > 0 ? `${hours}h` : `${value}m`
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={value =>
              new Date(value).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
            }
          />
          <YAxis tickFormatter={formatYAxisTick} />
          <Tooltip formatter={formatTooltip} />
          <Bar dataKey="totalDuration" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
