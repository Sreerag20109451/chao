import { clearBrowserState, visitAdmin } from "../../../support/auth";

describe("Build - Authentication - Admin", () => {
  beforeEach(clearBrowserState);

  it("ADMIN-AUTH-BUILD-001: admin landing route renders public auth entry", () => {
    visitAdmin("/landing");

    cy.location("pathname", { timeout: 15000 }).should("eq", "/landing");
    cy.contains("Chao Admin", { timeout: 20000 }).should("be.visible");
  });

  it("ADMIN-AUTH-BUILD-002: admin login route renders the auth form", () => {
    visitAdmin("/login");

    cy.location("pathname", { timeout: 15000 }).should("eq", "/login");
    cy.get("#login-email", { timeout: 20000 }).should("be.visible");
    cy.get("#login-password").should("be.visible");
    cy.get("#login-submit").contains("Sign in").should("be.enabled");
  });
});
