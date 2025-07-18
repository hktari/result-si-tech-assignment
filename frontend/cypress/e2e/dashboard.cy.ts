describe('Dashboard Functionality', () => {
  beforeEach(() => {
    cy.setupApiInterceptors()
    cy.login()
  })

  it('should display dashboard components', () => {
    cy.visit('/')
    
    // Wait for activities to load
    cy.wait('@getActivities')
    
    // Check main dashboard elements
    cy.contains('Activity Journal').should('be.visible')
    cy.contains('Log Activity').should('be.visible')
    cy.contains('Quick Stats').should('be.visible')
    cy.contains('Recent Activities').should('be.visible')
    
    // Check navigation
    cy.contains('Dashboard').should('be.visible')
    cy.contains('Insights').should('be.visible')
    
    // Verify mock data is displayed
    cy.contains('Reading').should('be.visible')
    cy.contains('Exercise').should('be.visible')
  })

  it('should open activity modal when clicking Log Activity', () => {
    cy.visit('/')
    cy.wait('@getActivities')
    
    // Click Log Activity button
    cy.contains('Log Activity').click()
    
    // Verify modal is open
    cy.get('input[placeholder*="Reading, Exercise, Coding"]').should('be.visible')
    cy.get('textarea[placeholder*="Optional notes"]').should('be.visible')
    cy.get('input[type="number"]').should('be.visible')
    cy.get('input[type="datetime-local"]').should('be.visible')
  })

  it('should create a new activity', () => {
    cy.visit('/')
    cy.wait('@getActivities')
    
    // Use the custom command to create an activity
    cy.createActivity('Coding', 'Working on a new feature', 120)
    
    // Verify the activity was created (modal should close)
    cy.get('input[placeholder*="Reading, Exercise, Coding"]').should('not.exist')
  })

  it('should display activity suggestions', () => {
    cy.visit('/')
    cy.wait('@getActivities')
    
    // Open activity modal
    cy.contains('Log Activity').click()
    
    // Type to trigger suggestions
    cy.get('input[placeholder*="Reading, Exercise, Coding"]').type('Re')
    
    // Wait for suggestions request
    cy.wait('@getActivitySuggestions')
    
    // Verify suggestions appear (this depends on your UI implementation)
    // You might need to adjust the selector based on how suggestions are displayed
    cy.contains('Reading').should('be.visible')
  })

  it('should close modal when clicking cancel or background', () => {
    cy.visit('/')
    cy.wait('@getActivities')
    
    // Open modal
    cy.contains('Log Activity').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Close with cancel button (if available)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="cancel-button"]').length > 0) {
        cy.get('[data-testid="cancel-button"]').click()
      } else {
        // Close by pressing escape
        cy.get('body').type('{esc}')
      }
    })
    
    // Modal should be closed
    cy.get('[role="dialog"]').should('not.exist')
  })

  it('should navigate to insights page', () => {
    cy.visit('/')
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
