import { adminBaseUrl, adminEmail, adminPassword, clearBrowserState } from "../../../support/auth";
import { prepareCollectionCart } from "../../../support/ordering";

describe("Regression - Ordering - Client And Admin", () => {
  beforeEach(clearBrowserState);

  it("ORDER-REG-CROSS-001: client cash order appears in admin live orders", () => {
    prepareCollectionCart(3);

    cy.get('[data-cy="payment-method-cod"]').click();
    cy.get('[data-cy="checkout-button"]', { timeout: 15000 }).should("not.be.disabled").click();
    cy.contains("Order Received!", { timeout: 30000 }).should("be.visible");

    cy.origin(String(adminBaseUrl), { args: { adminEmail: String(adminEmail), adminPassword: String(adminPassword) } }, ({ adminEmail, adminPassword }) => {
      cy.visit("/login");
      cy.get("#login-email", { timeout: 20000 }).clear().type(adminEmail);
      cy.get("#login-password").clear().type(adminPassword, { log: false });
      cy.get("#login-submit").click();
      cy.location("pathname", { timeout: 15000 }).should("eq", "/");
      cy.visit("/orders");
      cy.get('[data-cy="admin-orders-page"]', { timeout: 30000 }).should("be.visible");
      cy.get('[data-cy="admin-order-row"]', { timeout: 30000 }).should("have.length.greaterThan", 0);
    });
  });
});
