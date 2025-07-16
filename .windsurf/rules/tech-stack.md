---
trigger: always_on
---

## FRONTEND

### Guidelines for REACT

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


#### REACT_CODING_STANDARDS

- Use functional components with hooks instead of class components
- Implement React.memo() for expensive components that render often with the same props
- Utilize React.lazy() and Suspense for code-splitting and performance optimization
- Use the useCallback hook for event handlers passed to child components to prevent unnecessary re-renders
- Prefer useMemo for expensive calculations to avoid recomputation on every render
- Implement useId() for generating unique IDs for accessibility attributes
- Use the new use hook for data fetching in React 19+ projects
- Leverage Server Components for {{data_fetching_heavy_components}} when using React with Next.js or similar frameworks
- Consider using the new useOptimistic hook for optimistic UI updates in forms
- Use useTransition for non-urgent state updates to keep the UI responsive


## BACKEND

### Guidelines for NODE

#### NEST

- Use dependency injection for services to improve testability and maintainability following SOLID principles
- Implement custom decorators for cross-cutting concerns to keep code DRY and maintain separation of business logic
- Use interceptors for transforming the response data structure consistently for {{api_standards}}
- Leverage NestJS Guards for authorization to centralize access control logic across {{protected_resources}}
- Implement domain-driven design with modules that encapsulate related functionality and maintain clear boundaries
- Use TypeORM or Mongoose with repository patterns to abstract database operations and simplify testing with mocks


