import { clearBrowserState, visitClient, waitForClientOverlayToClear } from "../../../support/auth";

describe("Build - Authentication - Client", () => {
  beforeEach(clearBrowserState);

  it("CUST-AUTH-BUILD-001: client login route renders the auth form", () => {
    visitClient("/login");
    waitForClientOverlayToClear();

    cy.location("pathname", { timeout: 15000 }).should("eq", "/login");
    cy.get("#client-login-email", { timeout: 20000 }).should("be.visible");
    cy.get("#client-login-password").should("be.visible");
    cy.get('button[type="submit"]').should("be.enabled").and("contain", "Sign In");
  });

  it("CUST-AUTH-BUILD-002: client registration route renders the auth form", () => {
    visitClient("/register");
    waitForClientOverlayToClear();

    cy.location("pathname", { timeout: 15000 }).should("eq", "/register");
    cy.get("#client-register-name", { timeout: 20000 }).should("be.visible");
    cy.get("#client-register-email").should("be.visible");
    cy.get("#client-register-password").should("be.visible");
    cy.get('button[type="submit"]').should("be.enabled").and("contain", "Create Account");
  });
});
