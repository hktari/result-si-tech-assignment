'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  // Color palette for different activities
  const colors = [
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
    '#00ff00',
    '#0088fe',
    '#ff8042',
    '#8dd1e1',
    '#d084d0',
    '#ffb347',
  ]

  // Function to get color for each activity
  const getColorForActivity = (activityName: string) => {
    // Use a simple hash function to consistently assign colors to activity names
    const hash = activityName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }

  const formatTooltip = (value: number, name: string) => {
    if (name === 'durationMinutes') {
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
          <XAxis dataKey="name" tickFormatter={value => value} />
          <YAxis tickFormatter={formatYAxisTick} />
          <Tooltip formatter={formatTooltip} />
          <Bar dataKey="durationMinutes">
            {data?.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getColorForActivity(entry.name || '')}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
