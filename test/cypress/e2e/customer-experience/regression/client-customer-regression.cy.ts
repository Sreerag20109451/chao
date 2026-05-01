import { clearBrowserState, loginAsClient, visitClient } from "../../../support/auth";

describe("Regression - Customer Experience - Client", () => {
  beforeEach(clearBrowserState);

  it("CUST-EXP-REG-001: contact email field uses browser email validation", () => {
    visitClient("/contact");

    cy.get("#name").type("E2E Customer");
    cy.get("#email").type("not-an-email");
    cy.get("#message").type("Invalid email should be blocked by the browser.");
    cy.contains("button", "Send Message").click();
    cy.get("#email").then(($input) => {
      const input = $input[0] as HTMLInputElement;
      expect(input.checkValidity()).to.equal(false);
    });
  });

  it("CUST-EXP-REG-002: profile form exposes editable name email and phone fields", () => {
    loginAsClient();
    visitClient("/profile");

    cy.get("label[for='name']").should("be.visible");
    cy.get("#name").should("be.visible").and("not.be.disabled");
    cy.get("label[for='email']").should("be.visible");
    cy.get("#email").should("be.visible");
    cy.get("label[for='phone']").should("be.visible");
    cy.get("#phone").clear().type("0891234567");
    cy.contains("button", "Save Profile").should("be.visible");
  });

  it("CUST-EXP-REG-003: order history empty state links customers back to menu", () => {
    loginAsClient();
    visitClient("/orders");

    cy.get("body").then(($body) => {
      if ($body.text().includes("No orders yet")) {
        cy.contains("Explore Menu").click();
        cy.location("pathname", { timeout: 15000 }).should("eq", "/menu");
      } else {
        cy.contains("Order #").should("be.visible");
      }
    });
  });
});
