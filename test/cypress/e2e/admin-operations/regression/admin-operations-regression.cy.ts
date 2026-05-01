import { clearBrowserState, loginAsAdmin, visitAdmin } from "../../../support/auth";

describe("Regression - Admin Operations", () => {
  beforeEach(() => {
    clearBrowserState();
    loginAsAdmin();
  });

  it("ADMIN-OPS-REG-001: menu search filters without leaving menu management", () => {
    visitAdmin("/menu");
    cy.get('input[placeholder="Search dishes..."]', { timeout: 30000 }).clear().type("curry");
    cy.location("pathname").should("eq", "/menu");
    cy.contains("Menu Roster").should("be.visible");
  });

  it("ADMIN-OPS-REG-002: settings page exposes restaurant and operating-hours controls", () => {
    visitAdmin("/settings");

    cy.contains("Store Information", { timeout: 30000 }).should("be.visible");
    cy.contains("Operating Hours").should("be.visible");
    cy.get("input[aria-label$='opening time']").should("have.length.greaterThan", 0);
    cy.get("input[aria-label$='closing time']").should("have.length.greaterThan", 0);
    cy.contains("button", "Save Changes").should("be.visible");
  });

  it("ADMIN-OPS-REG-003: billing POS cannot process an empty order", () => {
    visitAdmin("/billing");

    cy.contains("Current order", { timeout: 30000 }).should("be.visible");
    cy.contains("Basket is empty").should("be.visible");
    cy.contains("button", "Process Payment & Print").should("be.disabled");
  });

  it("ADMIN-OPS-REG-004: deals item search is available inside the deal dialog", () => {
    visitAdmin("/deals");

    cy.contains("Create New Deal", { timeout: 30000 }).click();
    cy.get('input[placeholder="Find item..."]').clear().type("curry");
    cy.contains(/No items match your search|Include Items from Menu|Curry/i).should("be.visible");
  });
});
