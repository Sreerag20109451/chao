export const clientBaseUrl = Cypress.env("CUSTOMER_BASE_URL") || Cypress.env("CLIENT_BASE_URL") || "http://localhost:3000";
export const adminBaseUrl = Cypress.env("ADMIN_BASE_URL") || "http://localhost:3001";

export const clientEmail = Cypress.env("E2E_CUSTOMER_EMAIL") || "test@client.net";
export const clientPassword = Cypress.env("E2E_CUSTOMER_PASSWORD") || "clienttest123@";
export const adminEmail = Cypress.env("E2E_ADMIN_EMAIL") || "admin@test.net";
export const adminPassword = Cypress.env("E2E_ADMIN_PASSWORD") || "admintest123@";

export const visitClient = (path: string) => {
  return cy.visit(`${clientBaseUrl}${path}`);
};

export const visitAdmin = (path: string) => {
  return cy.visit(`${adminBaseUrl}${path}`, {
    onBeforeLoad(win) {
      win.localStorage.setItem("E2E_SUPPRESS_ADMIN_ALERTS", "true");
    },
  });
};

export const clearBrowserState = () => {
  cy.clearCookies();
  cy.clearLocalStorage();
};

export const dismissAdminOrderAlerts = () => {
  cy.get("body").then(($body) => {
    const rejectButtons = $body.find("button").filter((_, button) => button.textContent?.trim() === "Reject");
    if (rejectButtons.length) {
      cy.wrap(rejectButtons).each(($button) => {
        cy.wrap($button).click({ force: true });
      });
    }
  });
};

export const waitForClientOverlayToClear = () => {
  cy.get("body", { timeout: 15000 }).then(($body) => {
    const blockingOverlay = $body.find("div.fixed.inset-0.bg-zinc-950");
    if (blockingOverlay.length) {
      cy.get("div.fixed.inset-0.bg-zinc-950", { timeout: 20000 }).should("not.exist");
    }
  });
};

export const ensureClientOnLoginPage = () => {
  visitClient("/login");
  waitForClientOverlayToClear();
  cy.location("pathname", { timeout: 15000 }).then((pathname) => {
    if (pathname === "/") {
      return;
    }

    expect(pathname).to.eq("/login");
    cy.get("#client-login-email", { timeout: 20000 }).should("be.visible");
  });
};

export const loginAsClient = (email = String(clientEmail), password = String(clientPassword)) => {
  ensureClientOnLoginPage();
  cy.location("pathname", { timeout: 15000 }).then((pathname) => {
    if (pathname === "/") {
      return;
    }

    cy.get("#client-login-email").clear().type(email);
    cy.get("#client-login-password").clear().type(password, { log: false });
    cy.get('button[type="submit"]').click();
    cy.location("pathname", { timeout: 30000 }).should("eq", "/");
  });
};

export const logoutClientIfVisible = () => {
  cy.get("body").then(($body) => {
    const logoutBtn = $body.find('button[aria-label="Logout"]');
    if (logoutBtn.length) {
      cy.get('button[aria-label="Logout"]').click();
      cy.contains("Login", { timeout: 15000 }).should("be.visible");
    }
  });
};

export const logoutAdminIfVisible = () => {
  cy.contains("button", /Log out|Sign Out/, { timeout: 15000 }).first().click();
  cy.location("pathname", { timeout: 15000 }).should("eq", "/landing");
};

export const ensureAdminOnLoginPage = () => {
  visitAdmin("/login");
  cy.location("pathname", { timeout: 15000 }).then((pathname) => {
    if (pathname === "/") {
      return;
    }

    expect(pathname).to.eq("/login");
  });
};

export const loginAsAdmin = (email = String(adminEmail), password = String(adminPassword)) => {
  visitAdmin("/");
  cy.get("body", { timeout: 30000 }).should(($body) => {
    const text = $body.text();
    expect(text).to.match(/Dashboard Overview|Run your restaurant|Welcome back/);
  });
  cy.get("body").then(($body) => {
    if ($body.text().includes("Dashboard Overview")) {
      dismissAdminOrderAlerts();
      return;
    }

    return cy.contains(/Sign in to dashboard|Log in/).click().then(() => {
      cy.get("#login-email", { timeout: 20000 }).should("be.visible").clear().type(email);
      cy.get("#login-password").clear().type(password, { log: false });
      cy.get("#login-submit").click({ force: true });
      cy.contains("Dashboard Overview", { timeout: 30000 }).should("be.visible");
      dismissAdminOrderAlerts();
    });
  });
};
