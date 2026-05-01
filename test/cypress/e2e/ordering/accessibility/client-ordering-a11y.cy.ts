import { clearBrowserState, visitClient } from "../../../support/auth";
import { addFirstMenuItemToCart, loginClientAndOpenMenu } from "../../../support/ordering";

describe("Accessibility - Ordering - Client", () => {
  beforeEach(clearBrowserState);

  it("CUST-ORDER-A11Y-001: menu ordering controls expose accessible names", () => {
    visitClient("/menu");
    cy.get('[aria-label^="Add"], [aria-label^="Customize"]', { timeout: 30000 }).first().should("be.visible");
  });

  it("CUST-ORDER-A11Y-002: cart exposes payment and checkout controls", () => {
    loginClientAndOpenMenu();
    addFirstMenuItemToCart();

    cy.get('[data-cy="order-type-delivery"]').should("be.visible");
    cy.get('[data-cy="order-type-collection"]').should("be.visible");
    cy.get('[data-cy="payment-method-cod"]').should("be.visible");
    cy.get('[data-cy="payment-method-card"]').should("be.visible");
    cy.get('[data-cy="checkout-button"]').scrollIntoView().should("be.visible");
  });
});
