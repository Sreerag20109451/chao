import { clearBrowserState, clientEmail, clientPassword, ensureClientOnLoginPage, loginAsClient, logoutClientIfVisible } from "../../../support/auth";

describe("Smoke - Authentication - Client", () => {
  beforeEach(clearBrowserState);

  it("CUST-AUTH-SMOKE-001: seeded client can log in and reach authenticated home", () => {
    loginAsClient(String(clientEmail), String(clientPassword));

    cy.location("pathname", { timeout: 15000 }).should("eq", "/");
    cy.contains("Welcome,", { timeout: 15000 }).should("be.visible");
    logoutClientIfVisible();
  });

  it("CUST-AUTH-SMOKE-002: invalid client login remains outside authenticated home", () => {
    ensureClientOnLoginPage();
    cy.get("#client-login-email").clear().type(`invalid-${Date.now()}@example.com`);
    cy.get("#client-login-password").clear().type("Invalid123!", { log: false });
    cy.get('button[type="submit"]').click();

    cy.location("pathname", { timeout: 15000 }).should("not.eq", "/");
  });
});
