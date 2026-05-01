import { clearBrowserState, visitClient, waitForClientOverlayToClear } from "../../../support/auth";

describe("Build - Ordering - Client", () => {
  beforeEach(clearBrowserState);

  it("CUST-ORDER-BUILD-001: menu route renders ordering entry points", () => {
    visitClient("/menu");
    waitForClientOverlayToClear();

    cy.location("pathname", { timeout: 15000 }).should("eq", "/menu");
    cy.get('[data-cy="menu-category-filter"]', { timeout: 30000 }).should("have.length.greaterThan", 0);
    cy.get('[data-cy="menu-card"]', { timeout: 30000 }).should("have.length.greaterThan", 0);
  });

  it("CUST-ORDER-BUILD-002: cart route renders empty cart recovery", () => {
    visitClient("/cart");

    cy.get('[data-cy="empty-cart"]', { timeout: 15000 }).should("be.visible");
    cy.get('[data-cy="empty-cart-explore-menu"]').should("have.attr", "href", "/menu");
  });

  it("CUST-ORDER-BUILD-003: customer order history route renders", () => {
    visitClient("/orders");

    cy.location("pathname", { timeout: 15000 }).should("eq", "/orders");
  });
});
