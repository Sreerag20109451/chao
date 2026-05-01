const adminBaseUrl = Cypress.env("ADMIN_BASE_URL") || "http://localhost:3001";

const adminEmail = Cypress.env("E2E_ADMIN_EMAIL") || "admin@test.net";
const adminPassword = Cypress.env("E2E_ADMIN_PASSWORD") || "admintest123@";
const clientEmail = Cypress.env("E2E_CUSTOMER_EMAIL") || "test@client.net";
const clientPassword = Cypress.env("E2E_CUSTOMER_PASSWORD") || "clienttest123@";

const visitAdmin = (path: string) => {
  cy.visit(`${adminBaseUrl}${path}`);
};

const logoutAdminIfVisible = () => {
  cy.contains("button", /Log out|Sign Out/, { timeout: 15000 }).first().click();
  cy.location("pathname", { timeout: 15000 }).should("eq", "/landing");
};

const ensureAdminOnLoginPage = () => {
  visitAdmin("/landing");
  cy.location("pathname", { timeout: 15000 }).should("eq", "/landing");
  visitAdmin("/login");
  cy.location("pathname", { timeout: 15000 }).then((pathname) => {
    if (pathname === "/") {
      logoutAdminIfVisible();
      visitAdmin("/login");
    }
    if (pathname === "/landing") {
      visitAdmin("/login");
    }
  });
  cy.location("pathname", { timeout: 15000 }).should("eq", "/login");
  cy.get("#login-email", { timeout: 20000 }).should("be.visible");
};

const loginAsAdmin = (email: string, password: string) => {
  ensureAdminOnLoginPage();
  cy.get("#login-email").clear().type(email);
  cy.get("#login-password").clear().type(password, { log: false });
  cy.get("#login-submit").click();
};

describe("Authentication - Admin Only", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("ADMIN-AUTH-GUARD-001: redirects unauthenticated user from protected route to landing", () => {
    visitAdmin("/settings");
    cy.location("pathname", { timeout: 15000 }).should("eq", "/landing");
    cy.contains("Chao Admin", { timeout: 15000 }).should("be.visible");
  });

  it("ADMIN-AUTH-LOGIN-001: logs in with valid admin credentials", () => {
    loginAsAdmin(String(adminEmail), String(adminPassword));
    cy.location("pathname", { timeout: 15000 }).should("eq", "/");
    cy.contains("Admin", { timeout: 15000 }).should("be.visible");
    logoutAdminIfVisible();
  });

  it("ADMIN-AUTH-LOGIN-002: shows fallback error for invalid credentials", () => {
    loginAsAdmin(`invalid-${Date.now()}@example.com`, "Invalid123!");
    cy.location("pathname", { timeout: 15000 }).should("not.eq", "/");
  });

  it("ADMIN-AUTH-NEG-VALIDATION-001: blocks submit for invalid email format", () => {
    ensureAdminOnLoginPage();
    cy.get("#login-email").clear().type("not-an-email");
    cy.get("#login-password").clear().type("Valid123!", { log: false });
    cy.get("#login-submit").click();

    cy.location("pathname", { timeout: 15000 }).should("not.eq", "/");
    cy.get("#login-email").then(($input) => {
      const validationMessage = ($input[0] as HTMLInputElement).validationMessage;
      expect(validationMessage).to.not.equal("");
    });
  });

  it("ADMIN-AUTH-NEG-VALIDATION-002: blocks submit for weak password", () => {
    ensureAdminOnLoginPage();
    cy.get("#login-email").clear().type("admin@example.com");
    cy.get("#login-password").clear().type("weak", { log: false });
    cy.get("#login-submit").click();

    cy.location("pathname", { timeout: 15000 }).should("eq", "/login");
    cy.contains("Password must be at least 8 characters long", { timeout: 15000 }).should("be.visible");
  });

  it("ADMIN-AUTH-ROLE-001: blocks client credentials on admin login", () => {
    loginAsAdmin(String(clientEmail), String(clientPassword));
    cy.location("pathname", { timeout: 15000 }).should("not.eq", "/");
  });

  it("ADMIN-AUTH-GUARD-002: redirects authenticated admin away from /login", () => {
    loginAsAdmin(String(adminEmail), String(adminPassword));
    cy.location("pathname", { timeout: 15000 }).should("eq", "/");

    visitAdmin("/login");
    cy.location("pathname", { timeout: 15000 }).should("eq", "/");
    logoutAdminIfVisible();
  });

  it("ADMIN-AUTH-LOGOUT-001: logs out and re-enables route protection", () => {
    loginAsAdmin(String(adminEmail), String(adminPassword));
    cy.location("pathname", { timeout: 15000 }).should("eq", "/");

    cy.contains("button", "Log out", { timeout: 15000 }).click();
    cy.location("pathname", { timeout: 15000 }).should("eq", "/landing");

    visitAdmin("/orders");
    cy.location("pathname", { timeout: 15000 }).should("eq", "/landing");
  });
});
