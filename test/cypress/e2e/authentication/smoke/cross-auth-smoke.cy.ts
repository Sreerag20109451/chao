import { adminEmail, adminPassword, clearBrowserState, clientEmail, clientPassword, ensureAdminOnLoginPage, ensureClientOnLoginPage } from "../../../support/auth";

describe("Smoke - Authentication - Client And Admin", () => {
  beforeEach(clearBrowserState);

  it("AUTH-SMOKE-CROSS-001: admin credentials are blocked on the client portal", () => {
    ensureClientOnLoginPage();
    cy.get("#client-login-email").clear().type(String(adminEmail));
    cy.get("#client-login-password").clear().type(String(adminPassword), { log: false });
    cy.get('button[type="submit"]').click();

    cy.location("pathname", { timeout: 15000 }).should("eq", "/login");
    cy.contains("This account is for the admin dashboard. Please use the admin portal.", { timeout: 15000 }).should("be.visible");
  });

  it("AUTH-SMOKE-CROSS-002: client credentials are blocked on the admin portal", () => {
    ensureAdminOnLoginPage();
    cy.get("#login-email").clear().type(String(clientEmail));
    cy.get("#login-password").clear().type(String(clientPassword), { log: false });
    cy.get("#login-submit").click();

    cy.location("pathname", { timeout: 15000 }).should("not.eq", "/");
  });
});
