describe('Smoke Test', () => {
  // Test Case: CUST-SMOKE-001 - Home page loads
  // Priority: Smoke
  // Preconditions:
  // - Customer app is running at the Cypress baseUrl.
  // Steps:
  // 1. Visit the home route.
  // 2. Verify brand content is visible.
  // Expected Result:
  // - The home page renders successfully and shows Chao branding.
  it('should load the home page', () => {
    cy.visit('/');
    cy.contains(/Chao/i).should('be.visible');
  });

  // Test Case: CUST-SMOKE-002 - Menu page loads
  // Priority: Smoke
  // Preconditions:
  // - Customer app is running at the Cypress baseUrl.
  // - Menu data is available from the configured data source.
  // Steps:
  // 1. Visit the menu route.
  // 2. Confirm the URL contains /menu.
  // 3. Verify the menu heading is visible.
  // Expected Result:
  // - The menu page loads and displays customer-facing menu content.
  it('should navigate to menu page', () => {
    cy.visit('/menu');
    cy.url().should('include', '/menu');
    cy.contains(/Our Menu/i).should('be.visible');
  });
});
