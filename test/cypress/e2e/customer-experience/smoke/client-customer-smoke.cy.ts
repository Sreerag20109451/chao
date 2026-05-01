import { clearBrowserState, loginAsClient, visitClient } from "../../../support/auth";

describe("Smoke - Customer Experience - Client", () => {
  beforeEach(clearBrowserState);

  it("CUST-EXP-SMOKE-001: contact form enables submission only when required fields are complete", () => {
    visitClient("/contact");

    cy.contains("button", "Send Message").should("be.disabled");
    cy.get("#name").type("E2E Customer");
    cy.get("#email").type("customer@example.com");
    cy.get("#message").type("Checking customer contact form coverage.");
    cy.contains("button", "Send Message").should("not.be.disabled");
  });

  it("CUST-EXP-SMOKE-002: profile quick links navigate to order and payment modules", () => {
    loginAsClient();
    visitClient("/profile");

    cy.contains("Order History").click();
    cy.location("pathname", { timeout: 15000 }).should("eq", "/orders");

    visitClient("/profile");
    cy.contains("Payment Methods").click();
    cy.location("pathname", { timeout: 15000 }).should("eq", "/payments");
  });

  it("CUST-EXP-SMOKE-003: payment method actions route back to checkout", () => {
    loginAsClient();
    visitClient("/payments");

    cy.contains("a", "Go to checkout").first().click();
    cy.location("pathname", { timeout: 15000 }).should("eq", "/cart");
    cy.get('[data-cy="empty-cart"], [data-cy="cart-item"]', { timeout: 15000 }).should("exist");
  });
});
