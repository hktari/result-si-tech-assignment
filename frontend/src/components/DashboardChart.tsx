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

import type { operations } from '@/lib/api-types'
import {
  formatDurationTooltip,
  formatDurationYAxisTick,
  getColorForActivity,
} from '@/lib/utils/chartUtils'

interface DashboardChartProps {
  data: operations['InsightsController_getInsights']['responses']['200']['content']['application/json']['data']
}

export function DashboardChart({ data }: DashboardChartProps) {
  const formatTooltip = (value: number, name: string) => {
    if (name === 'durationMinutes') {
      return formatDurationTooltip(value, 'Total Time')
    }
    return [value, name === 'activityCount' ? 'Activities' : name]
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
          <YAxis tickFormatter={formatDurationYAxisTick} />
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
