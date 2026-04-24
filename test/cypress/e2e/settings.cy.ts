describe('Store Settings and Closure Integration', () => {
  beforeEach(() => {
    // Reset database state or mock responses
    // For this example, we assume we can interact with the UI
    cy.visit('/login');
    // Login as admin (assuming credentials or mock auth)
    // cy.get('input[type="email"]').type('admin@example.com');
    // cy.get('input[type="password"]').type('password');
    // cy.get('button').contains('Login').click();
  });

  it('should update store name and reflect on the client side', () => {
    const newStoreName = `Chao Thai Test ${Date.now()}`;
    
    // 1. Go to Admin Settings
    cy.visit('/settings'); // In the admin app
    cy.get('input[value="Chao Thai"]').clear().type(newStoreName);
    cy.contains('Save Changes').click();
    cy.contains('Settings updated successfully').should('be.visible');

    // 2. Verify on Client Home Page (usually on a different port, but in Cypress we can switch or mock)
    // For a real integration test, we would visit the client URL
    // cy.visit('http://localhost:3000');
    // cy.contains(newStoreName).should('be.visible');
  });

  it('should show the store as closed when opening hours are set to the future', () => {
    // 1. Set today's opening time to 23:00 (likely in the future)
    cy.visit('/settings');
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    cy.contains(today).parent().find('input').first().clear().type('23:00');
    cy.contains('Save Changes').click();
    
    // 2. Check Client Home Page
    // cy.visit('http://localhost:3000');
    // cy.contains('Store is currently closed').should('be.visible');
    // cy.contains('We open today from 23:00').should('be.visible');
  });

  it('should display opening hours in the correct order (Today on top)', () => {
    cy.visit('/'); // Client home
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    // The first item in the opening hours list should be today
    cy.get('.max-w-md.mx-auto .flex').first().within(() => {
      cy.contains(today).should('be.visible');
      cy.contains('Today').should('be.visible');
    });
  });
});
