'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import React from 'react'

import { InsightsResponseDto } from '@/lib/redux/features/activities/activitiesApi'
import {
  CHART_COLORS,
  formatDurationTooltip,
  formatDurationYAxisTick,
  getColorForActivity,
} from '@/lib/utils/chartUtils'

export function InsightsChart({ data, metric }: InsightsResponseDto) {
  const transformStackedData = (rawData: any) => {
    // TODO: Improve insights response typing using swagger
    // @ts-expect-error: Disabling type checking for this until we have better swagger typing
    return rawData?.map(item => {
      const dateKey = item.date || item.week || item.month
      const transformed: Record<string, any> = {
        period: dateKey,
        ...item,
      }
      delete transformed.date
      delete transformed.week
      delete transformed.month
      delete transformed.totalDuration
      delete transformed.activityCount
      return transformed
    })
  }

  const chartData =
    metric === 'timePerTitle' ? data : transformStackedData(data)

  // Extract unique activity names for chart colors
  const getActivityNames = (
    data: InsightsResponseDto['data'],
    metric: string
  ): string[] => {
    if (metric === 'timePerTitleStacked') {
      return Array.from(
        new Set(
          data?.flatMap(item =>
            Object.keys(item).filter(
              key =>
                key !== 'date' &&
                key !== 'week' &&
                key !== 'month' &&
                key !== 'totalDuration' &&
                key !== 'activityCount'
            )
          ) || []
        )
      )
    } else if (metric === 'timePerTitle') {
      return Array.from(
        new Set(
          data
            ?.map(item => item.name)
            .filter((name): name is string => name !== undefined) || []
        )
      )
    }
    return []
  }

  const activityNames = getActivityNames(data, metric!)

  return (
    <div className="h-96" data-testid="insights-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={metric === 'timePerTitle' ? 'name' : 'period'}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis tickFormatter={formatDurationYAxisTick} />
          <Tooltip formatter={formatDurationTooltip} />
          {metric === 'timePerTitle' ? (
            <Bar dataKey="durationMinutes">
              {data?.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColorForActivity(entry.name || '')}
                />
              ))}
            </Bar>
          ) : (
            <>
              <Legend />
              {activityNames.map((activity, index) => (
                <Bar
                  key={activity}
                  dataKey={activity}
                  stackId="a"
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
