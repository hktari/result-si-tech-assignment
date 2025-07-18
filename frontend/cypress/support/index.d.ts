/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to set up API interceptors for testing
     */
    setupApiInterceptors(): Chainable<void>

    /**
     * Custom command to login with mocked API responses
     * @param email - User email (default: 'demo@example.com')
     * @param password - User password (default: 'demo123')
     */
    login(email?: string, password?: string): Chainable<void>

    /**
     * Custom command to logout and clear storage
     */
    logout(): Chainable<void>

    /**
     * Custom command to create an activity with mocked API responses
     * @param title - Activity title
     * @param description - Optional activity description
     * @param duration - Activity duration in minutes (default: 60)
     */
    createActivity(
      title: string,
      description?: string,
      duration?: number
    ): Chainable<void>
  }
}
