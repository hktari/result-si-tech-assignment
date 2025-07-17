import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { components } from '../../api-types'

type ActivityResponseDto = components['schemas']['ActivityResponseDto']
type CreateActivityDto = components['schemas']['CreateActivityDto']
type UpdateActivityDto = components['schemas']['UpdateActivityDto']
type ActivitiesListResponseDto = components['schemas']['ActivitiesListResponseDto']

export const activitiesApi = createApi({
  reducerPath: 'activitiesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Add auth token if available
      const token = (getState() as { auth: { token?: string } }).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Activity', 'Insights'],
  endpoints: (builder) => ({
    getActivities: builder.query<ActivitiesListResponseDto, { search?: string; limit?: number; offset?: number }>({
      query: ({ search, limit = 50, offset = 0 }) => ({
        url: 'activities',
        params: { search, limit, offset },
      }),
      providesTags: ['Activity'],
    }),
    createActivity: builder.mutation<ActivityResponseDto, CreateActivityDto>({
      query: (newActivity) => ({
        url: 'activities',
        method: 'POST',
        body: newActivity,
      }),
      invalidatesTags: ['Activity', 'Insights'],
    }),
    updateActivity: builder.mutation<ActivityResponseDto, { id: string; updates: UpdateActivityDto }>({
      query: ({ id, updates }) => ({
        url: `activities/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Activity', 'Insights'],
    }),
    deleteActivity: builder.mutation<void, string>({
      query: (id) => ({
        url: `activities/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Activity', 'Insights'],
    }),
    getInsights: builder.query<{ data: Array<{ date: string; totalDuration: number; activityCount: number }> }, { metric: 'daily' | 'weekly' | 'monthly' }>({
      query: ({ metric }) => ({
        url: 'insights',
        params: { metric },
      }),
      providesTags: ['Insights'],
    }),
  }),
})

export const {
  useGetActivitiesQuery,
  useCreateActivityMutation,
  useUpdateActivityMutation,
  useDeleteActivityMutation,
  useGetInsightsQuery,
} = activitiesApi
