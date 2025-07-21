describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear any existing auth state
    cy.window().then(win => {
      win.localStorage.clear()
      win.sessionStorage.clear()
    })
  })

  it('should redirect to login when not authenticated', () => {
    cy.visit('/')
    cy.url().should('include', '/login')
  })

  it('should login successfully with valid credentials', () => {
    cy.login()
    // Should redirect to dashboard
    cy.url().should('eq', Cypress.config().baseUrl + '/')

    // Should see dashboard content
    cy.contains('Activity Journal').should('be.visible')
    cy.contains('Log Activity').should('be.visible')
  })

  it('should show error for invalid credentials', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').clear().type('invalid@example.com')
    cy.get('input[type="password"]').clear().type('invalidpassword')
    cy.get('form').find('button[type="submit"]').click()

    cy.get('div[role="alert"]').should('be.visible')
    // Should show error message
    cy.contains('Invalid credentials').should('be.visible')
  })

  it('should protect routes when not authenticated', () => {
    cy.visit('/insights')
    cy.url().should('include', '/login')
  })
})
