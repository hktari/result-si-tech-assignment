describe('Insights Functionality', () => {
  beforeEach(() => {
    cy.setupApiInterceptors()
    cy.login()
  })

  it('should display insights page components', () => {
    cy.visit('/insights')
    
    // Wait for insights data to load
    cy.wait('@getInsights')
    
    // Check main insights elements
    cy.contains('Insights').should('be.visible')
    cy.contains('Filter').should('be.visible')
    
    // Check if chart is rendered (adjust selector based on your implementation)
    cy.get('[data-testid="insights-chart"]').should('be.visible')
  })

  it('should filter insights by date range', () => {
    cy.visit('/insights')
    cy.wait('@getInsights')
    
    // Find and use date range filter (adjust selectors based on your implementation)
    cy.get('select[data-testid="interval-select"]').select('weekly')
    
    // Wait for filtered data
    cy.wait('@getInsights')
    
    // Verify chart updates (this depends on your implementation)
    cy.get('[data-testid="insights-chart"]').should('be.visible')
  })

  it('should change metric type', () => {
    cy.visit('/insights')
    cy.wait('@getInsights')
    
    // Change metric type (adjust selector based on your implementation)
    cy.get('select[data-testid="metric-select"]').select('timePerTitleStacked')
    
    // Wait for new data
    cy.wait('@getInsights')
    
    // Verify chart updates
    cy.get('[data-testid="insights-chart"]').should('be.visible')
  })

  it('should navigate back to dashboard', () => {
    cy.visit('/insights')
    cy.wait('@getInsights')
    
    // Click Dashboard navigation
    cy.contains('Dashboard').click()
    
    // Verify navigation worked
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    
    // Wait for dashboard data
    cy.wait('@getActivities')
  })

  it('should display insights data correctly', () => {
    cy.visit('/insights')
    cy.wait('@getInsights')
    
    // Verify mock data is displayed (adjust based on your mock data)
    cy.contains('Reading').should('be.visible')
    cy.contains('Exercise').should('be.visible')
    cy.contains('Coding').should('be.visible')
    
    // Check if total is displayed
    cy.contains('510').should('be.visible') // total from mock data
  })
})
