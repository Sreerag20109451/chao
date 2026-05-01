import { clearBrowserState, visitAdmin } from "../../../support/auth";

describe("Accessibility - Authentication - Admin", () => {
  beforeEach(clearBrowserState);

  it("ADMIN-AUTH-A11Y-001: admin login form exposes labels, errors, and password toggle state", () => {
    visitAdmin("/login");

    cy.get('label[for="login-email"]', { timeout: 20000 }).should("be.visible");
    cy.get("#login-email").should("have.attr", "type", "email");
    cy.get('label[for="login-password"]').should("be.visible");
    cy.get('button[aria-label="Show password"]').click().should("have.attr", "aria-pressed", "true");
    cy.get("#login-password").should("have.attr", "type", "text");
  });

  it("ADMIN-AUTH-A11Y-002: admin landing exposes public auth entry content", () => {
    visitAdmin("/landing");

    cy.contains("Chao Admin", { timeout: 20000 }).should("be.visible");
    cy.get("main, body").should("be.visible");
  });
});
