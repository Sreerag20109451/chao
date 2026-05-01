import { clearBrowserState, loginAsClient, visitClient } from "../../../support/auth";

describe("Accessibility - Customer Experience - Client", () => {
  beforeEach(clearBrowserState);

  it("CUST-EXP-A11Y-001: contact form exposes programmatic labels", () => {
    visitClient("/contact");

    cy.get("label[for='name']").should("be.visible");
    cy.get("label[for='email']").should("be.visible");
    cy.get("label[for='message']").should("be.visible");
    cy.get("#name,#email,#message").should("have.length", 3);
  });

  it("CUST-EXP-A11Y-002: profile fields and account links are keyboard reachable", () => {
    loginAsClient();
    visitClient("/profile");

    cy.get("#name").focus().should("be.focused");
    cy.get("#email").focus().should("be.focused");
    cy.get("#phone").focus().should("be.focused");
    cy.contains("a", "Order History").should("have.attr", "href", "/orders");
    cy.contains("a", "Payment Methods").should("have.attr", "href", "/payments");
  });

  it("CUST-EXP-A11Y-003: payments page communicates secure card handling", () => {
    loginAsClient();
    visitClient("/payments");

    cy.contains("Security").should("be.visible");
    cy.contains(/PCI DSS|Stripe/i).should("be.visible");
    cy.contains("a", "Go to checkout").should("have.attr", "href", "/cart");
  });
});
