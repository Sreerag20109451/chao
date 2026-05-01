import { adminBaseUrl, adminEmail, adminPassword, clearBrowserState, visitClient } from "../../../support/auth";

describe("Accessibility - Ordering - Client And Admin", () => {
  beforeEach(clearBrowserState);

  it("ORDER-A11Y-CROSS-001: client and admin ordering surfaces expose primary landmarks/content", () => {
    visitClient("/cart");
    cy.get('[data-cy="empty-cart"]').should("be.visible");
    cy.get('[data-cy="empty-cart-explore-menu"]').should("be.visible");

    cy.origin(String(adminBaseUrl), { args: { adminEmail: String(adminEmail), adminPassword: String(adminPassword) } }, ({ adminEmail, adminPassword }) => {
      cy.visit("/login");
      cy.get("#login-email", { timeout: 20000 }).clear().type(adminEmail);
      cy.get("#login-password").clear().type(adminPassword, { log: false });
      cy.get("#login-submit").click();
      cy.location("pathname", { timeout: 15000 }).should("eq", "/");
      cy.visit("/orders");
      cy.get('[data-cy="admin-orders-page"]', { timeout: 30000 }).should("be.visible");
      cy.contains("Active Orders").should("be.visible");
    });
  });
});
