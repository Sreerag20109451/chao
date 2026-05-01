import { clearBrowserState, loginAsAdmin, visitAdmin } from "../../../support/auth";

describe("Accessibility - Ordering - Admin", () => {
  beforeEach(clearBrowserState);

  it("ADMIN-ORDER-A11Y-001: admin orders page exposes search and table content", () => {
    loginAsAdmin();
    visitAdmin("/orders");

    cy.get('[data-cy="admin-orders-search"]', { timeout: 30000 }).should("be.visible");
    cy.contains("Active Orders").should("be.visible");
    cy.get("table").should("be.visible");
  });
});
