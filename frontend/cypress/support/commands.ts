// ***********************************************
// Cypress custom commands with API interceptors
// ***********************************************
import type { components } from '@/lib/api-types'

// Type aliases for better readability
type LoginResponseDto = components['schemas']['LoginResponseDto']
type ActivityResponseDto = components['schemas']['ActivityResponseDto']
type ActivitiesListResponseDto =
  components['schemas']['ActivitiesListResponseDto']
type ActivitySuggestionResponseDto =
  components['schemas']['ActivitySuggestionResponseDto']
type UserResponseDto = components['schemas']['UserResponseDto']

// Mock data for testing
const mockUser: UserResponseDto = {
  id: 'test-user-id',
  email: Cypress.env('DEMO_USER_EMAIL'),
  name: 'Demo User',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
}

const mockLoginResponse: LoginResponseDto = {
  access_token: 'mock-jwt-token',
  user: mockUser,
}

const mockActivities: ActivityResponseDto[] = [
  {
    id: 'activity-1',
    title: 'Reading',
    description: 'Reading technical books',
    duration: 60,
    timestamp: '2025-07-18T10:00:00Z',
    userId: 'test-user-id',
    createdAt: '2025-07-18T10:00:00Z',
    updatedAt: '2025-07-18T10:00:00Z',
  },
  {
    id: 'activity-2',
    title: 'Exercise',
    description: 'Morning workout',
    duration: 45,
    timestamp: '2025-07-18T08:00:00Z',
    userId: 'test-user-id',
    createdAt: '2025-07-18T08:00:00Z',
    updatedAt: '2025-07-18T08:00:00Z',
  },
]

const mockActivitiesResponse: ActivitiesListResponseDto = {
  activities: mockActivities,
  total: mockActivities.length,
}

const mockSuggestions: ActivitySuggestionResponseDto[] = [
  { title: 'Reading', count: 5 },
  { title: 'Exercise', count: 3 },
  { title: 'Coding', count: 8 },
]
// Custom command for setting up API interceptors
Cypress.Commands.add('setupApiInterceptors', () => {
  // Auth endpoints
  cy.intercept('**/auth/login', req => {
    if (
      req.body.email === Cypress.env('DEMO_USER_EMAIL') &&
      req.body.password === Cypress.env('DEMO_USER_PASSWORD')
    ) {
      req.reply({
        statusCode: 200,
        body: mockLoginResponse,
      })
    } else {
      req.reply({
        statusCode: 401,
        body: {
          message: 'Invalid credentials',
        },
      })
    }
  }).as('loginRequest')

  cy.intercept('**/auth/register', {
    statusCode: 201,
    body: {
      message: 'User registered successfully',
      user: mockUser,
    },
  }).as('registerRequest')

  cy.intercept('**/auth/profile', {
    statusCode: 200,
    body: mockUser,
  }).as('getProfile')

  // Activity endpoints
  cy.intercept('**/activities*', {
    statusCode: 200,
    body: mockActivitiesResponse,
  }).as('getActivities')

  cy.intercept('**/activities', {
    statusCode: 201,
    body: mockActivities[0],
  }).as('createActivity')

  cy.intercept('**/activities/*', {
    statusCode: 200,
    body: mockActivities[0],
  }).as('updateActivity')

  cy.intercept('**/activities/*', {
    statusCode: 200,
    body: {
      message: 'Activity deleted successfully',
      id: 'activity-1',
    },
  }).as('deleteActivity')

  cy.intercept('**/activities/suggestions*', {
    statusCode: 200,
    body: mockSuggestions,
  }).as('getActivitySuggestions')

  // Insights endpoints
  cy.intercept(new URL('/insights*', Cypress.env('API_URL')).href, {
    statusCode: 200,
    body: {
      metric: 'timePerTitle',
      date_range: {
        from: '2025-07-01',
        to: '2025-07-16',
      },
      data: [
        { name: 'Reading', durationMinutes: 180 },
        { name: 'Exercise', durationMinutes: 90 },
        { name: 'Coding', durationMinutes: 240 },
      ],
    },
  }).as('getInsights')
})

// Custom command for login with interceptors
Cypress.Commands.add(
  'login',
  (
    email = Cypress.env('DEMO_USER_EMAIL'),
    password = Cypress.env('DEMO_USER_PASSWORD')
  ) => {
    cy.setupApiInterceptors()

    cy.visit('/login')
    cy.get('input[type="email"]').clear().type(email)
    cy.get('input[type="password"]').clear().type(password)
    cy.get('form').find('button[type="submit"]').click()

    // Wait for login request to complete
    cy.wait('@loginRequest')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  }
)

// Custom command for logout
Cypress.Commands.add('logout', () => {
  cy.window().then(win => {
    win.localStorage.clear()
    win.sessionStorage.clear()
  })
  cy.visit('/login')
})

// Custom command for creating an activity
Cypress.Commands.add(
  'createActivity',
  (title: string, description?: string, duration = 60) => {
    cy.setupApiInterceptors()

    cy.contains('Log Activity').click()
    cy.get('input[placeholder*="Reading, Exercise, Coding"]').type(title)

    if (description) {
      cy.get('textarea[placeholder*="Optional notes"]').type(description)
    }

    cy.get('input[type="number"]').clear().type(duration.toString())

    const now = new Date()
    const dateTimeString = now.toISOString().slice(0, 16)
    cy.get('input[type="datetime-local"]').type(dateTimeString)

    cy.contains('button', 'Log Activity').click()
    cy.wait('@createActivity')
  }
)
