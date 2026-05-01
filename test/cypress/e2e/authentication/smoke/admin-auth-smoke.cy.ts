import { adminEmail, adminPassword, clearBrowserState, loginAsAdmin, logoutAdminIfVisible, visitAdmin } from "../../../support/auth";

describe("Smoke - Authentication - Admin", () => {
  beforeEach(clearBrowserState);

  it("ADMIN-AUTH-SMOKE-001: unauthenticated admin user is redirected from protected settings", () => {
    visitAdmin("/settings");

    cy.location("pathname", { timeout: 15000 }).should("eq", "/landing");
    cy.contains("Chao Admin", { timeout: 15000 }).should("be.visible");
  });

  it("ADMIN-AUTH-SMOKE-002: seeded admin can log in and reach dashboard", () => {
    loginAsAdmin(String(adminEmail), String(adminPassword));

    cy.location("pathname", { timeout: 15000 }).should("eq", "/");
    cy.contains("Admin", { timeout: 15000 }).should("be.visible");
    logoutAdminIfVisible();
  });
});
