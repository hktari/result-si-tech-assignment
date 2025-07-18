import { configureStore } from '@reduxjs/toolkit'

import { activitiesApi } from './features/activities/activitiesApi'
import { authApi } from './features/auth/authApi'
import authReducer from './features/auth/authSlice'
import todosReducer from './features/todos/todosSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      todos: todosReducer,
      auth: authReducer,
      [authApi.reducerPath]: authApi.reducer,
      [activitiesApi.reducerPath]: activitiesApi.reducer,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        activitiesApi.middleware
      ),
    devTools: process.env.NODE_ENV !== 'production',
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
