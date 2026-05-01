import { adminBaseUrl, clearBrowserState, visitClient, waitForClientOverlayToClear } from "../../../support/auth";

describe("Accessibility - Authentication - Client And Admin", () => {
  beforeEach(clearBrowserState);

  it("AUTH-A11Y-CROSS-001: client and admin auth pages expose distinct accessible form controls", () => {
    visitClient("/login");
    waitForClientOverlayToClear();
    cy.get("#client-login-email").should("be.visible");
    cy.get('button[aria-label="Show password"]').should("be.visible");

    cy.origin(String(adminBaseUrl), () => {
      cy.visit("/login");
      cy.get("body", { timeout: 20000 }).then(($body) => {
        if ($body.text().trim().length === 0) {
          cy.reload();
        }
      });
      cy.get("#login-email", { timeout: 20000 }).should("be.visible");
      cy.get('button[aria-label="Show password"]').should("be.visible");
    });
  });
});
