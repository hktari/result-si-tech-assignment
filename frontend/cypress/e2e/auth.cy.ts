describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear any existing auth state
    cy.window().then((win) => {
      win.localStorage.clear()
      win.sessionStorage.clear()
    })
  })

  it('should redirect to login when not authenticated', () => {
    cy.visit('/')
    cy.url().should('include', '/login')
  })

  it('should login successfully with valid credentials', () => {
    cy.visit('/login')
    
    // Fill in login form
    cy.get('input[type="email"]').type('demo@example.com')
    cy.get('input[type="password"]').type('demo123')
    
    // Submit form
    cy.get('form').submit()
    
    // Should redirect to dashboard
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    
    // Should see dashboard content
    cy.contains('Activity Journal').should('be.visible')
    cy.contains('Log Activity').should('be.visible')
  })

  it('should show error for invalid credentials', () => {
    cy.visit('/login')
    
    // Fill in login form with invalid credentials
    cy.get('input[type="email"]').type('invalid@example.com')
    cy.get('input[type="password"]').type('wrongpassword')
    
    // Submit form
    cy.get('form').submit()
    
    // Should show error message
    cy.contains('Login failed').should('be.visible')
  })

  it('should protect routes when not authenticated', () => {
    cy.visit('/insights')
    cy.url().should('include', '/login')
  })
})
