describe('Insights Functionality', () => {
  beforeEach(() => {
    cy.setupApiInterceptors()
    cy.login()
  })

  it('should display insights page components', () => {
    cy.get('a').contains('Insights').click()
    cy.wait('@getInsights')

    cy.contains('Insights').should('be.visible')
    cy.get('[data-testid="insights-chart"]').should('be.visible')
  })

  it('should filter insights by date range', () => {
    cy.get('a').contains('Insights').click()
    cy.wait('@getInsights')

    cy.get('[data-testid="metric-select"]')
      .find('button[data-testid="timePerTitleStacked"]')
      .click()

    cy.get('[data-testid="interval-select"]')
      .find('button[data-testid="weekly"]')
      .click()

    cy.wait('@getInsights')

    cy.get('[data-testid="insights-chart"]').should('be.visible')
  })

  it('should change metric type', () => {
    cy.get('a').contains('Insights').click()
    cy.wait('@getInsights')

    cy.get('[data-testid="metric-select"]')
      .find('button[data-testid="timePerTitleStacked"]')
      .click()

    cy.wait('@getInsights')

    cy.get('[data-testid="insights-chart"]').should('be.visible')
  })

  it('should navigate back to dashboard', () => {
    cy.get('a').contains('Insights').click()
    cy.wait('@getInsights')

    cy.contains('Dashboard').click()

    cy.url().should('eq', Cypress.config().baseUrl + '/')

    cy.wait('@getActivities')
  })

  it('should display insights data correctly', () => {
    cy.get('a').contains('Insights').click()
    cy.wait('@getInsights')

    cy.contains('Reading').should('be.visible')
    cy.contains('Exercise').should('be.visible')
    cy.contains('Coding').should('be.visible')

    cy.contains('510').should('be.visible')
  })
})
