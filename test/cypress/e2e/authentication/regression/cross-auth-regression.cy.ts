import { adminEmail, adminPassword, clearBrowserState, clientEmail, clientPassword, ensureAdminOnLoginPage, ensureClientOnLoginPage, visitAdmin, visitClient } from "../../../support/auth";

describe("Regression - Authentication - Client And Admin", () => {
  beforeEach(clearBrowserState);

  it("AUTH-REG-CROSS-001: client portal keeps admin-role users on login", () => {
    ensureClientOnLoginPage();
    cy.get("#client-login-email").clear().type(String(adminEmail));
    cy.get("#client-login-password").clear().type(String(adminPassword), { log: false });
    cy.get('button[type="submit"]').click();

    cy.location("pathname", { timeout: 15000 }).should("eq", "/login");
    cy.get('a[href="/profile"]').should("not.exist");
  });

  it("AUTH-REG-CROSS-002: admin portal keeps client-role users away from protected routes", () => {
    ensureAdminOnLoginPage();
    cy.get("#login-email").clear().type(String(clientEmail));
    cy.get("#login-password").clear().type(String(clientPassword), { log: false });
    cy.get("#login-submit").click();

    visitAdmin("/settings");
    cy.location("pathname", { timeout: 15000 }).should("eq", "/landing");
  });
});
