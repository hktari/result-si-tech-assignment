---
trigger: always_on
---

#### REDUX

- Use Redux Toolkit (RTK) instead of plain Redux to reduce boilerplate code
- Implement the slice pattern for organizing related state, reducers, and actions
- Use RTK Query for data fetching to eliminate manual loading state management
- Prefer createSelector for memoized selectors to prevent unnecessary recalculations
- Normalize complex state structures using a flat entities approach with IDs as references
- Implement middleware selectively and avoid overusing thunks for simple state updates
- Use the listener middleware for complex side effects instead of thunks where appropriate
- Leverage createEntityAdapter for standardized CRUD operations
- Implement Redux DevTools for debugging in development environments
- Use typed hooks (useAppDispatch, useAppSelector) with TypeScript for type safety

- only use Redux for globally shared, mutable data
- use a combination of Next.js state (search params, route parameters, form state, etc.), React context and React hooks for all other state management.


---

### 🔧 Redux Toolkit + Next.js Integration Guidelines

#### 🔁 Store Setup

* ✅ Use `next-redux-wrapper` to support SSR hydration.
* ✅ Define `makeStore()` function that returns a new `configureStore(...)` instance.
* ❌ Never create or export a shared store instance globally.

#### 💡 Redux Usage

* ✅ Use `createSlice()` to define isolated state logic.
* ✅ Use `createAsyncThunk` for complex async logic.
* ✅ Prefer **RTK Query** for standardized API calls + caching.
* ❌ Avoid mixing concerns: don’t put async fetch logic directly in components or slices.

  ```ts
  store.dispatch(setUser("Boštjan"))
  ```
#### 🕸 Client-Side Behavior

* ✅ Use `useAppSelector()` and `useAppDispatch()` for typed Redux access.
* ✅ Avoid re-fetching data that was already populated via SSR.
* ✅ Use `useEffect()` for browser-only logic (e.g., accessing `localStorage`).

#### ⚠️ Common Pitfalls to Avoid

* ❌ Do not use `window`, `document`, or `localStorage` in SSR code paths.
* ❌ Do not rely on SSR to fetch data for client-side navigation (CSR).
* ❌ Do not share store state across requests.

#### ⚙️ RTK Query with SSR

* ✅ Use `getRunningOperationPromises()` to wait for all async queries:

  ```ts
  store.dispatch(api.endpoints.getUser.initiate())
  await Promise.all(api.util.getRunningOperationPromises())
  ```

#### 🧼 State Management Scope

* ✅ Use Redux for shared, persistent app state (e.g., auth, data models).
* ✅ Use `useState()` or `useReducer()` for local UI state (e.g., modals, forms).

#### 🛠 Dev Tools

* ✅ Enable `devTools: true` in `configureStore()` during development.
* ✅ Install Redux DevTools browser extension for debugging.

#### 📦 Packaging & Reuse

* ✅ Export typed hooks:

  ```ts
  export const useAppDispatch = () => useDispatch<AppDispatch>()
  export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
  ```

#### Implemetning APIs

```ts
// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Pokemon } from './types'

// Define a service using a base URL and expected endpoints
export const pokemonApi = createApi({
  reducerPath: 'pokemonApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://pokeapi.co/api/v2/' }),
  endpoints: (builder) => ({
    getPokemonByName: builder.query<Pokemon, string>({
      query: (name) => `pokemon/${name}`,
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetPokemonByNameQuery } = pokemonApi
```