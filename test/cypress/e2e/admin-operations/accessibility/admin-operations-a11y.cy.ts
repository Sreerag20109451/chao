import { clearBrowserState, loginAsAdmin, visitAdmin } from "../../../support/auth";

describe("Accessibility - Admin Operations", () => {
  beforeEach(() => {
    clearBrowserState();
    loginAsAdmin();
  });

  it("ADMIN-OPS-A11Y-001: sidebar marks the current admin page", () => {
    visitAdmin("/settings");

    cy.contains("a", "Settings").should("have.attr", "aria-current", "page");
    cy.contains("a", "Orders").should("not.have.attr", "aria-current", "page");
  });

  it("ADMIN-OPS-A11Y-002: settings controls have accessible names", () => {
    visitAdmin("/settings");

    cy.get("input[aria-label='Monday opening time']", { timeout: 30000 }).should("be.visible");
    cy.get("input[aria-label='Monday closing time']").should("be.visible");
    cy.get("input[aria-label='Monday closed']").should("exist");
  });

  it("ADMIN-OPS-A11Y-003: operational search inputs expose descriptive placeholders", () => {
    visitAdmin("/payments");
    cy.get('input[placeholder="Search by order, customer, method, status..."]', { timeout: 30000 }).should("be.visible");

    visitAdmin("/messages");
    cy.get('input[placeholder="Search messages by name, email, or text..."]', { timeout: 30000 }).should("be.visible");

    visitAdmin("/billing");
    cy.get('input[placeholder="Search menu to add items…"]', { timeout: 30000 }).should("be.visible");
  });
});
