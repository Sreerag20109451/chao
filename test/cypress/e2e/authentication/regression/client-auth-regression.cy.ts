import { clearBrowserState, clientEmail, clientPassword, ensureClientOnLoginPage, loginAsClient, logoutClientIfVisible, visitClient, waitForClientOverlayToClear } from "../../../support/auth";

describe("Regression - Authentication - Client", () => {
  beforeEach(clearBrowserState);

  it("CUST-AUTH-REG-001: blocks submit for invalid email format", () => {
    ensureClientOnLoginPage();
    cy.get("#client-login-email").clear().type("not-an-email");
    cy.get("#client-login-password").clear().type("Valid123!", { log: false });
    cy.get('button[type="submit"]').click();

    cy.location("pathname", { timeout: 15000 }).should("not.eq", "/");
    cy.get("#client-login-email").then(($input) => {
      expect(($input[0] as HTMLInputElement).validationMessage).to.not.equal("");
    });
  });

  it("CUST-AUTH-REG-002: blocks submit for weak password", () => {
    ensureClientOnLoginPage();
    cy.get("#client-login-email").clear().type("client@example.com");
    cy.get("#client-login-password").clear().type("weak", { log: false });
    cy.get('button[type="submit"]').click();

    cy.location("pathname", { timeout: 15000 }).should("eq", "/login");
    cy.contains("Password must be at least 8 characters long", { timeout: 15000 }).should("be.visible");
  });

  it("CUST-AUTH-REG-003: registers a unique client and lands authenticated home", () => {
    const email = `e2e-client-${Date.now()}@example.com`;

    visitClient("/register");
    waitForClientOverlayToClear();
    cy.get("#client-register-name", { timeout: 20000 }).clear().type("E2E Client User");
    cy.get("#client-register-email").clear().type(email);
    cy.get("#client-register-password").clear().type("E2eClient@123", { log: false });
    cy.get('button[type="submit"]').click();

    cy.location("pathname", { timeout: 15000 }).should("eq", "/");
    cy.contains("Welcome,", { timeout: 15000 }).should("be.visible");
    cy.get('a[href="/profile"]', { timeout: 15000 }).should("be.visible");
    logoutClientIfVisible();
  });

  it("CUST-AUTH-REG-004: logs out and removes authenticated navigation", () => {
    loginAsClient(String(clientEmail), String(clientPassword));
    cy.location("pathname", { timeout: 15000 }).should("eq", "/");
    cy.get('button[aria-label="Logout"]', { timeout: 15000 }).click();

    cy.contains("Login", { timeout: 15000 }).should("be.visible");
    cy.get('a[href="/profile"]').should("not.exist");
  });
});
