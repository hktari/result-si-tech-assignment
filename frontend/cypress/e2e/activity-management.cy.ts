describe('Activity Management', () => {
  beforeEach(() => {
    cy.setupApiInterceptors()
    cy.login()
  })

  it('should create a new activity with autocomplete', () => {
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
    cy.get('#description')
      .focus()
      .type('Reading a great novel', { force: true })
    cy.get('input[type="number"]').clear().type('60')

    // Set date/time
    const now = new Date()
    const dateTimeString = now.toISOString().slice(0, 16)
    cy.get('input[type="datetime-local"]').type(dateTimeString)

    // Submit form
    cy.contains('button', 'Save Activity').click()

    // Wait for activity creation
    cy.wait('@createActivity')

    // Verify modal is closed
    cy.get('input[placeholder*="Reading, Exercise, Coding"]').should(
      'not.exist'
    )
  })

  it('should delete an activity', () => {
    cy.wait('@getActivities')

    // Find and click delete button (this depends on your UI)
    // You might need to hover over an activity or click a menu button first
    cy.get('[data-testid^="delete-activity-"]').first().click()

    // Confirm deletion if there's a confirmation dialog
    cy.contains('button', 'Delete').click()

    // Wait for delete request
    cy.wait('@deleteActivity')

    // Toast should have the correct message
    cy.get('[data-sonner-toaster]')
      .contains('Activity deleted')
      .should('be.visible')
  })
})
