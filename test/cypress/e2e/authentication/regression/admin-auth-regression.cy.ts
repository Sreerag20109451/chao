import { adminEmail, adminPassword, clearBrowserState, ensureAdminOnLoginPage, loginAsAdmin, logoutAdminIfVisible, visitAdmin } from "../../../support/auth";

describe("Regression - Authentication - Admin", () => {
  beforeEach(clearBrowserState);

  it("ADMIN-AUTH-REG-001: invalid admin login remains outside dashboard", () => {
    ensureAdminOnLoginPage();
    cy.get("#login-email").clear().type(`invalid-${Date.now()}@example.com`);
    cy.get("#login-password").clear().type("Invalid123!", { log: false });
    cy.get("#login-submit").click();

    cy.location("pathname", { timeout: 15000 }).should("not.eq", "/");
  });

  it("ADMIN-AUTH-REG-002: blocks submit for invalid email format", () => {
    ensureAdminOnLoginPage();
    cy.get("#login-email").clear().type("not-an-email");
    cy.get("#login-password").clear().type("Valid123!", { log: false });
    cy.get("#login-submit").click();

    cy.location("pathname", { timeout: 15000 }).should("not.eq", "/");
    cy.get("#login-email").then(($input) => {
      expect(($input[0] as HTMLInputElement).validationMessage).to.not.equal("");
    });
  });

  it("ADMIN-AUTH-REG-003: blocks submit for weak password", () => {
    ensureAdminOnLoginPage();
    cy.get("#login-email").clear().type("admin@example.com");
    cy.get("#login-password").clear().type("weak", { log: false });
    cy.get("#login-submit").click();

    cy.location("pathname", { timeout: 15000 }).should("eq", "/login");
    cy.contains("Password must be at least 8 characters long", { timeout: 15000 }).should("be.visible");
  });

  it("ADMIN-AUTH-REG-004: authenticated admin is redirected away from login", () => {
    loginAsAdmin(String(adminEmail), String(adminPassword));
    cy.location("pathname", { timeout: 15000 }).should("eq", "/");

    visitAdmin("/login");
    cy.location("pathname", { timeout: 15000 }).should("eq", "/");
    logoutAdminIfVisible();
  });

  it("ADMIN-AUTH-REG-005: logout re-enables protected route guard", () => {
    loginAsAdmin(String(adminEmail), String(adminPassword));
    cy.location("pathname", { timeout: 15000 }).should("eq", "/");

    cy.contains("button", "Log out", { timeout: 15000 }).click();
    cy.location("pathname", { timeout: 15000 }).should("eq", "/landing");

    visitAdmin("/orders");
    cy.location("pathname", { timeout: 15000 }).should("eq", "/landing");
  });
});
