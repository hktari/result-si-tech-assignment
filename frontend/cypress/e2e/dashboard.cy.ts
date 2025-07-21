describe('Dashboard Functionality', () => {
  beforeEach(() => {
    cy.setupApiInterceptors()
    cy.login()
  })

  it('should display dashboard components', () => {
    cy.wait('@getActivities')

    // Check main dashboard elements
    cy.contains('Activity Journal').should('be.visible')
    cy.contains('Log Activity').should('be.visible')
    cy.contains('Total Activities').should('be.visible')
    cy.contains('Recent Activities').should('be.visible')

    // Check navigation
    cy.contains('Dashboard').should('be.visible')
    cy.contains('Insights').should('be.visible')

    // Verify mock data is displayed
    cy.contains('Reading').should('be.visible')
    cy.contains('Exercise').should('be.visible')
  })

  it('should navigate to insights page', () => {
    cy.wait('@getActivities')

    // Click Insights navigation
    cy.contains('Insights').click()

    // Verify navigation worked
    cy.url().should('include', '/insights')

    // Wait for insights data to load
    cy.wait('@getInsights')

    // Verify insights page content
    cy.contains('Insights').should('be.visible')
  })
})
