import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import type { components } from '../../api-types'

type UserResponseDto = components['schemas']['UserResponseDto']

interface AuthState {
  token: string | null
  user: UserResponseDto | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: UserResponseDto }>
    ) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.isAuthenticated = true
    },
    logout: state => {
      state.token = null
      state.user = null
      state.isAuthenticated = false
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
