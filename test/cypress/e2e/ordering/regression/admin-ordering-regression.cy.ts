import { clearBrowserState, loginAsAdmin, visitAdmin } from "../../../support/auth";

describe("Regression - Ordering - Admin", () => {
  beforeEach(clearBrowserState);

  it("ADMIN-ORDER-REG-001: admin can search live orders without leaving orders page", () => {
    loginAsAdmin();
    visitAdmin("/orders");

    cy.get('[data-cy="admin-orders-search"]', { timeout: 30000 }).clear().type("e2e");
    cy.location("pathname", { timeout: 15000 }).should("eq", "/orders");
    cy.get('[data-cy="admin-orders-page"]').should("be.visible");
  });
});
