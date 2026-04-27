describe("First Integration Test - Client Core Flow", () => {
  // Test Case: INT-CORE-001
  // Goal: Verify route and shell integration across core customer pages.
  // Preconditions:
  // - Client app is running at Cypress baseUrl.
  // Steps:
  // 1. Open home page.
  // 2. Navigate to menu page.
  // 3. Navigate to cart page.
  // 4. Navigate to orders page.
  // Expected:
  // - Each page renders without route breakage.
  // - Shared app shell (navbar/footer) continues to render.
  it("should integrate home, menu, cart, and orders routes", () => {
    cy.visit("/");
    cy.contains(/Chao/i).should("be.visible");

    cy.visit("/menu");
    cy.url().should("include", "/menu");
    cy.contains(/Our Menu/i).should("be.visible");

    cy.visit("/cart");
    cy.url().should("include", "/cart");
    cy.contains(/Your cart is empty/i).should("be.visible");

    cy.visit("/orders");
    cy.url().should("include", "/orders");
  });

  // Test Case: INT-CORE-002
  // Goal: Validate that cart has a deterministic recovery path back to menu.
  // Preconditions:
  // - Empty cart state is active.
  // Steps:
  // 1. Open cart page.
  // 2. Click "Explore the Menu".
  // Expected:
  // - User lands on menu page and menu heading is visible.
  it("should link empty cart recovery flow to menu", () => {
    cy.visit("/cart");
    cy.contains(/Explore the Menu/i).click();
    cy.url().should("include", "/menu");
    cy.contains(/Our Menu/i).should("be.visible");
  });
});
