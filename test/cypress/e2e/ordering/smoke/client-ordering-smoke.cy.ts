import { clearBrowserState, visitClient } from "../../../support/auth";
import { addFirstMenuItemToCart, loginClientAndOpenMenu } from "../../../support/ordering";

describe("Smoke - Ordering - Client", () => {
  beforeEach(clearBrowserState);

  it("CUST-ORDER-SMOKE-001: empty cart recovery opens the menu", () => {
    visitClient("/cart");
    cy.get('[data-cy="empty-cart-explore-menu"]').click();

    cy.location("pathname", { timeout: 15000 }).should("eq", "/menu");
    cy.get('[data-cy="menu-card"]', { timeout: 30000 }).should("have.length.greaterThan", 0);
  });

  it("CUST-ORDER-SMOKE-002: authenticated customer can add a menu item to cart", () => {
    loginClientAndOpenMenu();
    addFirstMenuItemToCart();

    cy.location("pathname", { timeout: 15000 }).should("eq", "/cart");
    cy.get('[data-cy="cart-item"]').should("have.length.greaterThan", 0);
    cy.get('[data-cy="cart-total"]').should("be.visible");
  });
});
