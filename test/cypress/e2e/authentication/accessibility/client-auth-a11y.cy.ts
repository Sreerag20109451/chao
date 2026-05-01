import { clearBrowserState, visitClient, waitForClientOverlayToClear } from "../../../support/auth";

describe("Accessibility - Authentication - Client", () => {
  beforeEach(clearBrowserState);

  it("CUST-AUTH-A11Y-001: client login form exposes labels, errors, and password toggle state", () => {
    visitClient("/login");
    waitForClientOverlayToClear();

    cy.get('label[for="client-login-email"]').should("be.visible");
    cy.get("#client-login-email").should("have.attr", "type", "email");
    cy.get('label[for="client-login-password"]').should("be.visible");
    cy.get('button[aria-label="Show password"]').click().should("have.attr", "aria-pressed", "true");
    cy.get("#client-login-password").should("have.attr", "type", "text");
  });

  it("CUST-AUTH-A11Y-002: client registration form exposes programmatic labels", () => {
    visitClient("/register");
    waitForClientOverlayToClear();

    cy.get('label[for="client-register-name"]').should("be.visible");
    cy.get('label[for="client-register-email"]').should("be.visible");
    cy.get('label[for="client-register-password"]').should("be.visible");
    cy.get('button[aria-label="Show password"]').should("have.attr", "aria-pressed", "false");
  });
});
