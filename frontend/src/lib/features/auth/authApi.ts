import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { components } from '../../api-types';
import type { RootState } from '../../store';

// Type aliases for better readability
type LoginDto = components['schemas']['LoginDto'];
type LoginResponseDto = components['schemas']['LoginResponseDto'];
type UserResponseDto = components['schemas']['UserResponseDto'];
type RegisterDto = components['schemas']['RegisterDto'];
type RegisterResponseDto = components['schemas']['RegisterResponseDto'];

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get token from state if available
      const token = (getState() as RootState).auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponseDto, LoginDto>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation<RegisterResponseDto, RegisterDto>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),
    getProfile: builder.query<UserResponseDto, void>({
      query: () => "/auth/profile",
      providesTags: ['User'],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetProfileQuery } =
  authApi;
