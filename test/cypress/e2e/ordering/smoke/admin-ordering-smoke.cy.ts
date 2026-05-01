import { clearBrowserState, loginAsAdmin, visitAdmin } from "../../../support/auth";

describe("Smoke - Ordering - Admin", () => {
  beforeEach(clearBrowserState);

  it("ADMIN-ORDER-SMOKE-001: authenticated admin can open live orders", () => {
    loginAsAdmin();
    visitAdmin("/orders");

    cy.get('[data-cy="admin-orders-page"]', { timeout: 30000 }).should("be.visible");
    cy.get('[data-cy="admin-orders-search"]').should("be.visible");
  });
});
