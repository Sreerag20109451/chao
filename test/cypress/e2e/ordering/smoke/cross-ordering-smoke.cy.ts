import { adminBaseUrl, adminEmail, adminPassword, clearBrowserState, visitClient } from "../../../support/auth";

describe("Smoke - Ordering - Client And Admin", () => {
  beforeEach(clearBrowserState);

  it("ORDER-SMOKE-CROSS-001: client cart and admin orders routes are both reachable", () => {
    visitClient("/cart");
    cy.get('[data-cy="empty-cart"]', { timeout: 15000 }).should("be.visible");

    cy.origin(String(adminBaseUrl), { args: { adminEmail: String(adminEmail), adminPassword: String(adminPassword) } }, ({ adminEmail, adminPassword }) => {
      cy.visit("/login");
      cy.get("#login-email", { timeout: 20000 }).clear().type(adminEmail);
      cy.get("#login-password").clear().type(adminPassword, { log: false });
      cy.get("#login-submit").click();
      cy.location("pathname", { timeout: 15000 }).should("eq", "/");
      cy.visit("/orders");
      cy.get('[data-cy="admin-orders-page"]', { timeout: 30000 }).should("be.visible");
    });
  });
});
