import { configureStore } from '@reduxjs/toolkit'
import todosReducer from './features/todos/todosSlice'
import { authApi } from './features/auth/authApi'
import authReducer from './features/auth/authSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
        todos: todosReducer,
        auth: authReducer,
        [authApi.reducerPath]: authApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(authApi.middleware),
    devTools: process.env.NODE_ENV !== 'production',
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']