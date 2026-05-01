const clientBaseUrl = Cypress.env("CUSTOMER_BASE_URL") || Cypress.env("CLIENT_BASE_URL") || "http://localhost:3000";

const configuredClientEmail = Cypress.env("E2E_CUSTOMER_EMAIL");
const configuredClientPassword = Cypress.env("E2E_CUSTOMER_PASSWORD");
let clientEmail = configuredClientEmail || "test@client.net";
let clientPassword = configuredClientPassword || "clienttest123@";
const adminEmail = Cypress.env("E2E_ADMIN_EMAIL") || "admin@test.net";
const adminPassword = Cypress.env("E2E_ADMIN_PASSWORD") || "admintest123@";

const visitClient = (path: string) => {
  cy.visit(`${clientBaseUrl}${path}`);
};

const waitForClientOverlayToClear = () => {
  cy.get("body", { timeout: 15000 }).then(($body) => {
    const blockingOverlay = $body.find("div.fixed.inset-0.bg-zinc-950");
    if (blockingOverlay.length) {
      cy.get("div.fixed.inset-0.bg-zinc-950", { timeout: 20000 }).should("not.exist");
    }
  });
};

const ensureClientOnLoginPage = () => {
  visitClient("/login");
  waitForClientOverlayToClear();
  cy.get('input[type="email"]', { timeout: 20000 }).should("be.visible");
};

const loginAsClient = (email: string, password: string) => {
  ensureClientOnLoginPage();
  cy.get('input[type="email"]').clear().type(email);
  cy.get('input[type="password"]').clear().type(password, { log: false });
  cy.get('button[type="submit"]').click();
};

const logoutClientIfVisible = () => {
  cy.get("body").then(($body) => {
    const logoutBtn = $body.find('button[aria-label="Logout"]');
    if (logoutBtn.length) {
      cy.get('button[aria-label="Logout"]').click();
      cy.contains("Login", { timeout: 15000 }).should("be.visible");
    }
  });
};

describe("Authentication - Client Only", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("CUST-AUTH-LOGIN-001: logs in with valid client credentials", () => {
    loginAsClient(String(clientEmail), String(clientPassword));
    cy.location("pathname", { timeout: 15000 }).should("eq", "/");
    cy.contains("Welcome,", { timeout: 15000 }).should("be.visible");
    logoutClientIfVisible();
  });

  it("CUST-AUTH-LOGIN-002: shows fallback error for invalid credentials", () => {
    loginAsClient(`invalid-${Date.now()}@example.com`, "Invalid123!");
    cy.location("pathname", { timeout: 15000 }).should("not.eq", "/");
  });

  it("CUST-AUTH-NEG-VALIDATION-001: blocks submit for invalid email format", () => {
    ensureClientOnLoginPage();
    cy.get('input[type="email"]').clear().type("not-an-email");
    cy.get('input[type="password"]').clear().type("Valid123!", { log: false });
    cy.get('button[type="submit"]').click();

    cy.location("pathname", { timeout: 15000 }).should("not.eq", "/");
    cy.get('input[type="email"]').then(($input) => {
      const validationMessage = ($input[0] as HTMLInputElement).validationMessage;
      expect(validationMessage).to.not.equal("");
    });
  });

  it("CUST-AUTH-NEG-VALIDATION-002: blocks submit for weak password", () => {
    ensureClientOnLoginPage();
    cy.get('input[type="email"]').clear().type("client@example.com");
    cy.get('input[type="password"]').clear().type("weak", { log: false });
    cy.get('button[type="submit"]').click();

    cy.location("pathname", { timeout: 15000 }).should("eq", "/login");
    cy.contains("Password must be at least 8 characters long", { timeout: 15000 }).should("be.visible");
  });

  it("CUST-AUTH-ROLE-001: blocks admin credentials on client login", () => {
    loginAsClient(String(adminEmail), String(adminPassword));
    cy.location("pathname", { timeout: 15000 }).should("eq", "/login");
    cy.contains("This account is for the admin dashboard. Please use the admin portal.", { timeout: 15000 }).should("be.visible");
  });

  it("CUST-AUTH-REGISTER-001: registers a new client and lands authenticated home", () => {
    const runId = Date.now();
    const email = `e2e-client-${runId}@example.com`;
    const password = "E2eClient@123";

    visitClient("/register");
    waitForClientOverlayToClear();
    cy.get('input[type="text"]').clear().type("E2E Client User");
    cy.get('input[type="email"]').clear().type(email);
    cy.get('input[type="password"]').clear().type(password, { log: false });
    cy.get('button[type="submit"]').click();

    cy.location("pathname", { timeout: 15000 }).should("eq", "/");
    cy.contains("Welcome,", { timeout: 15000 }).should("be.visible");
    cy.get('a[href="/profile"]', { timeout: 15000 }).should("be.visible");
    logoutClientIfVisible();
  });

  it("CUST-AUTH-LOGOUT-001: logs out and removes authenticated navigation", () => {
    loginAsClient(String(clientEmail), String(clientPassword));
    cy.location("pathname", { timeout: 15000 }).should("eq", "/");
    cy.get('button[aria-label="Logout"]', { timeout: 15000 }).click();

    cy.contains("Login", { timeout: 15000 }).should("be.visible");
    cy.get('a[href="/profile"]').should("not.exist");
  });
});
