describe('Activity Management', () => {
  beforeEach(() => {
    cy.setupApiInterceptors()
    cy.login()
  })

  it('should create a new activity with autocomplete', () => {
    cy.visit('/')
    cy.wait('@getActivities')

    // Open activity modal
    cy.contains('Log Activity').click()

    // Fill in activity form
    cy.get('input[placeholder*="Reading, Exercise, Coding"]').type('Reading')

    // Check if autocomplete suggestions appear
    cy.get('input[placeholder*="Reading, Exercise, Coding"]').type(
      '{backspace}{backspace}'
    )
    cy.get('input[placeholder*="Reading, Exercise, Coding"]').type('Re')

    // Wait for suggestions to load
    cy.wait('@getActivitySuggestions')

    // Continue filling form
    cy.get('input[placeholder*="Reading, Exercise, Coding"]')
      .clear()
      .type('Reading Books')
    cy.get('textarea[placeholder*="Optional notes"]').type(
      'Reading a great novel'
    )
    cy.get('input[type="number"]').clear().type('60')

    // Set date/time
    const now = new Date()
    const dateTimeString = now.toISOString().slice(0, 16)
    cy.get('input[type="datetime-local"]').type(dateTimeString)

    // Submit form
    cy.contains('button', 'Log Activity').click()

    // Wait for activity creation
    cy.wait('@createActivity')

    // Verify modal is closed
    cy.get('input[placeholder*="Reading, Exercise, Coding"]').should(
      'not.exist'
    )
  })

  it('should edit an existing activity', () => {
    cy.visit('/')
    cy.wait('@getActivities')

    // Click on an activity to edit (assuming there's an edit button or click handler)
    cy.contains('Reading').click()

    // Wait for activity details or edit form to appear
    // This depends on your UI implementation
    cy.get('input[placeholder*="Reading, Exercise, Coding"]').should(
      'be.visible'
    )

    // Edit the activity
    cy.get('input[placeholder*="Reading, Exercise, Coding"]')
      .clear()
      .type('Updated Reading')
    cy.get('textarea[placeholder*="Optional notes"]')
      .clear()
      .type('Updated description')

    // Save changes
    cy.contains('button', 'Save').click()

    // Wait for update request
    cy.wait('@updateActivity')
  })

  it('should delete an activity', () => {
    cy.visit('/')
    cy.wait('@getActivities')

    // Find and click delete button (this depends on your UI)
    // You might need to hover over an activity or click a menu button first
    cy.get('[data-testid="delete-activity"]').first().click()

    // Confirm deletion if there's a confirmation dialog
    cy.contains('button', 'Delete').click()

    // Wait for delete request
    cy.wait('@deleteActivity')
  })

  it('should filter activities by search', () => {
    cy.visit('/')
    cy.wait('@getActivities')

    // Find search input (adjust selector based on your implementation)
    cy.get('input[placeholder*="Search"]').type('Reading')

    // Wait for filtered results
    cy.wait('@getActivities')

    // Verify filtered results
    cy.contains('Reading').should('be.visible')
  })

  it('should display activity details', () => {
    cy.visit('/')
    cy.wait('@getActivities')

    // Click on an activity to view details
    cy.contains('Reading').click()

    // Verify activity details are displayed
    cy.contains('60').should('be.visible') // duration
    cy.contains('Reading technical books').should('be.visible') // description
  })

  it('should validate required fields', () => {
    cy.visit('/')
    cy.wait('@getActivities')

    // Open activity modal
    cy.contains('Log Activity').click()

    // Try to submit without required fields
    cy.contains('button', 'Log Activity').click()

    // Form should show validation errors (this depends on your validation implementation)
    cy.get('input[placeholder*="Reading, Exercise, Coding"]:invalid').should(
      'exist'
    )
  })

  it('should show activity suggestions when typing', () => {
    cy.visit('/')
    cy.wait('@getActivities')

    // Open activity modal
    cy.contains('Log Activity').click()

    // Type to trigger suggestions
    cy.get('input[placeholder*="Reading, Exercise, Coding"]').type('Cod')

    // Wait for suggestions
    cy.wait('@getActivitySuggestions')

    // Verify suggestions appear (adjust based on your UI)
    cy.contains('Coding').should('be.visible')
  })
})
