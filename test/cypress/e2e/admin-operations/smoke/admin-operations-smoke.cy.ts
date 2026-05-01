import { clearBrowserState, loginAsAdmin, visitAdmin } from "../../../support/auth";

describe("Smoke - Admin Operations", () => {
  beforeEach(() => {
    clearBrowserState();
    loginAsAdmin();
  });

  it("ADMIN-OPS-SMOKE-001: sidebar navigation reaches core admin modules", () => {
    cy.contains("a", "Menu Items").click();
    cy.location("pathname", { timeout: 15000 }).should("eq", "/menu");
    cy.contains("Menu Management").should("be.visible");

    cy.contains("a", "Settings").click();
    cy.location("pathname", { timeout: 15000 }).should("eq", "/settings");
    cy.contains("Settings").should("be.visible");
  });

  it("ADMIN-OPS-SMOKE-002: admin searchable list pages expose search controls", () => {
    visitAdmin("/menu");
    cy.get('input[placeholder="Search dishes..."]', { timeout: 30000 }).should("be.visible");

    visitAdmin("/payments");
    cy.get('input[placeholder="Search by order, customer, method, status..."]', { timeout: 30000 }).should("be.visible");

    visitAdmin("/messages");
    cy.get('input[placeholder="Search messages by name, email, or text..."]', { timeout: 30000 }).should("be.visible");

    visitAdmin("/drivers");
    cy.get('input[placeholder="Search roster..."]', { timeout: 30000 }).should("be.visible");
  });

  it("ADMIN-OPS-SMOKE-003: create dialogs open without submitting data", () => {
    visitAdmin("/menu");
    cy.contains("Add Menu Item", { timeout: 30000 }).click();
    cy.contains("Add New Item").should("be.visible");

    visitAdmin("/deals");
    cy.contains("Create New Deal", { timeout: 30000 }).click();
    cy.contains("Configure Deal").should("be.visible");

    visitAdmin("/drivers");
    cy.contains("Add New Driver", { timeout: 30000 }).click();
    cy.contains(/Add New Driver|Edit Driver/).should("be.visible");
  });
});
