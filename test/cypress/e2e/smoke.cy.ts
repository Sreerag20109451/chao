describe('Smoke Test', () => {
  it('should load the home page', () => {
    cy.visit('/');
    // Check for some text that should be on the home page
    cy.contains(/Chao/i).should('be.visible');
  });

  it('should navigate to menu page', () => {
    cy.visit('/menu');
    cy.url().should('include', '/menu');
    cy.contains(/Our Menu/i).should('be.visible');
  });
});
