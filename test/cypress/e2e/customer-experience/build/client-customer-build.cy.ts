import { clearBrowserState, loginAsClient, visitClient } from "../../../support/auth";

describe("Build - Customer Experience - Client", () => {
  beforeEach(clearBrowserState);

  it("CUST-EXP-BUILD-001: public home and contact routes render", () => {
    visitClient("/");
    cy.contains(/Chao|Thai/i, { timeout: 30000 }).should("be.visible");

    visitClient("/contact");
    cy.contains("Send us a Message", { timeout: 30000 }).should("be.visible");
    cy.contains("Find Us").should("be.visible");
  });

  it("CUST-EXP-BUILD-002: authenticated profile route renders account controls", () => {
    loginAsClient();
    visitClient("/profile");

    cy.contains("Your Profile", { timeout: 30000 }).should("be.visible");
    cy.contains("Personal Details").should("be.visible");
    cy.contains("Saved Addresses").should("be.visible");
  });

  it("CUST-EXP-BUILD-003: authenticated payment methods route renders checkout options", () => {
    loginAsClient();
    visitClient("/payments");

    cy.contains("Payment").should("be.visible");
    cy.contains("Checkout Options").should("be.visible");
    cy.contains("Card Payment").should("be.visible");
    cy.contains("Cash on Delivery").should("be.visible");
  });

  it("CUST-EXP-BUILD-004: authenticated order history route renders", () => {
    loginAsClient();
    visitClient("/orders");

    cy.contains("Order").should("be.visible");
    cy.contains(/History|No orders yet|Order #/, { timeout: 30000 }).should("be.visible");
  });
});
