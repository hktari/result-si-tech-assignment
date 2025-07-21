import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import type { components, operations } from '../../../api-types'

export type ActivityResponseDto = components['schemas']['ActivityResponseDto']
export type CreateActivityDto = components['schemas']['CreateActivityDto']
export type UpdateActivityDto = components['schemas']['UpdateActivityDto']
export type ActivitiesListResponseDto =
  components['schemas']['ActivitiesListResponseDto']
export type ActivitySuggestionResponseDto =
  components['schemas']['ActivitySuggestionResponseDto']
export type InsightsParams =
  operations['InsightsController_getInsights']['parameters']['query']
export type InsightsResponseDto =
  operations['InsightsController_getInsights']['responses']['200']['content']['application/json']
export type GetActivitiesParams =
  operations['ActivitiesController_findAll']['parameters']['query']
export type GetSuggestionsParams =
  operations['ActivitiesController_getSuggestions']['parameters']['query']

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
  tagTypes: ['Activity', 'Insights', 'FilteredActivity'],
  endpoints: builder => ({
    filterActivities: builder.query<
      ActivitiesListResponseDto,
      GetActivitiesParams
    >({
      query: params => ({
        url: 'activities',
        params,
      }),
      providesTags: ['FilteredActivity'],
    }),
    getActivities: builder.query<
      ActivitiesListResponseDto,
      GetActivitiesParams
    >({
      query: params => ({
        url: 'activities',
        params,
      }),
      providesTags: ['Activity'],
    }),
    createActivity: builder.mutation<ActivityResponseDto, CreateActivityDto>({
      query: newActivity => ({
        url: 'activities',
        method: 'POST',
        body: newActivity,
      }),
      invalidatesTags: ['Activity', 'Insights', 'FilteredActivity'],
    }),
    updateActivity: builder.mutation<
      ActivityResponseDto,
      { id: string; updates: UpdateActivityDto }
    >({
      query: params => ({
        url: `activities/${params.id}`,
        method: 'PATCH',
        body: params.updates,
      }),
      invalidatesTags: ['Activity', 'Insights', 'FilteredActivity'],
    }),
    deleteActivity: builder.mutation<void, string>({
      query: id => ({
        url: `activities/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Activity', 'Insights', 'FilteredActivity'],
    }),
    getInsights: builder.query<InsightsResponseDto, InsightsParams>({
      query: params => ({
        url: 'insights',
        params,
      }),
      providesTags: ['Insights'],
    }),
    getSuggestions: builder.query<
      ActivitySuggestionResponseDto[],
      GetSuggestionsParams
    >({
      query: params => ({
        url: 'activities/suggestions',
        params,
      }),
      providesTags: ['Activity'],
    }),
  }),
})

export const {
  useFilterActivitiesQuery,
  useGetActivitiesQuery,
  useCreateActivityMutation,
  useUpdateActivityMutation,
  useDeleteActivityMutation,
  useGetInsightsQuery,
  useGetSuggestionsQuery,
} = activitiesApi
