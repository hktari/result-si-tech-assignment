'use client'

import React from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts'


import { InsightsResponseDto } from '@/lib/features/activities/activitiesApi'



export function InsightsChart({ data, metric }: InsightsResponseDto ) {

  const transformStackedData = (rawData: any) => {
    // TODO: Improve insights response typing using swagger
    // @ts-expect-error: Disabling type checking for this until we have better swagger typing
    return rawData?.map(item => {
      const dateKey = item.date || item.week || item.month
      const transformed: Record<string, any> = {
        period: dateKey,
        ...item
      }
      delete transformed.date
      delete transformed.week
      delete transformed.month
      delete transformed.totalDuration
      delete transformed.activityCount
      return transformed
    })
  }

  const chartData = metric === 'timePerTitle' 
    ? data
    : transformStackedData(data)

  // Extract unique activity names for chart colors
  const getActivityNames = (data: InsightsResponseDto['data'], metric: string): string[] => {
    if (metric === 'timePerTitleStacked') {
      return Array.from(new Set(
        data?.flatMap(item => 
          Object.keys(item).filter(key => 
            key !== 'date' && key !== 'week' && key !== 'month' && 
            key !== 'totalDuration' && key !== 'activityCount'
          )
        ) || []
      ))
    }else if (metric === 'timePerTitle') {
      return Array.from(new Set(
        data?.map(item => item.name).filter((name): name is string => name !== undefined) || []
      ))
    }
    return []
  }

  const activityNames = getActivityNames(data, metric!)


  // Color palette for different activities
  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
    '#0088fe', '#ff8042', '#8dd1e1', '#d084d0', '#ffb347'
  ]

  const formatTooltip = (value: number, name: string) => {
    const hours = Math.floor(value / 60)
    const minutes = value % 60
    const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
    return [timeStr, name]
  }

  const formatYAxisTick = (value: number) => {
    const hours = Math.floor(value / 60)
    return hours > 0 ? `${hours}h` : `${value}m`
  }

  if (metric === 'timePerTitle') {
    return (
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis tickFormatter={formatYAxisTick} />
            <Tooltip formatter={formatTooltip} />
            <Bar dataKey="durationMinutes" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis tickFormatter={formatYAxisTick} />
          <Tooltip formatter={formatTooltip} />
          <Legend />
          {activityNames.map((activity, index) => (
            <Bar 
              key={activity}
              dataKey={activity} 
              stackId="a"
              fill={colors[index % colors.length]} 
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
