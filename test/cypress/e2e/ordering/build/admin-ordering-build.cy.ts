import { clearBrowserState, loginAsAdmin, visitAdmin } from "../../../support/auth";

describe("Build - Ordering - Admin", () => {
  beforeEach(clearBrowserState);

  it("ADMIN-ORDER-BUILD-001: admin orders route renders for authenticated admin", () => {
    loginAsAdmin();
    cy.location("pathname", { timeout: 15000 }).should("eq", "/");

    visitAdmin("/orders");
    cy.get('[data-cy="admin-orders-page"]', { timeout: 30000 }).should("be.visible");
    cy.contains("Active Orders").should("be.visible");
  });
});
