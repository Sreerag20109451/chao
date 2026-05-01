import { clearBrowserState, clientBaseUrl } from "../../../support/auth";
import { addFirstMenuItemToCart, chooseCollectionOrder, fillCheckoutPhoneIfVisible, loginClientAndOpenMenu, prepareCollectionCart } from "../../../support/ordering";

describe("Regression - Ordering - Client", () => {
  beforeEach(clearBrowserState);

  it("CUST-ORDER-REG-001: cart quantity controls update the visible cart item", () => {
    loginClientAndOpenMenu();
    addFirstMenuItemToCart();

    cy.get('[data-cy="cart-item"]').first().within(() => {
      cy.contains(/^1$/).should("be.visible");
      cy.get('[data-cy="cart-item-increment"]').click();
      cy.contains(/^2$/).should("be.visible");
      cy.get('[data-cy="cart-item-decrement"]').click();
      cy.contains(/^1$/).should("be.visible");
    });
  });

  it("CUST-ORDER-REG-002: collection cash checkout places a pending order", () => {
    prepareCollectionCart(3);

    cy.get('[data-cy="payment-method-cod"]').click();
    cy.get('[data-cy="checkout-button"]', { timeout: 15000 }).should("not.be.disabled").click();

    cy.contains("Order Received!", { timeout: 30000 }).should("be.visible");
    cy.contains("Status: Pending Confirmation").should("be.visible");
  });

  it("CUST-ORDER-REG-003: card checkout posts a Stripe Checkout request without collecting card data in app", () => {
    prepareCollectionCart(3);

    cy.fixture("stripe-test-cards").then((cards) => {
      expect(cards.successfulVisa.number).to.equal("4242424242424242");
    });

    cy.intercept("POST", "/api/payments/create-checkout-session", (req) => {
      expect(req.body.paymentMethod).to.be.undefined;
      expect(req.body.items).to.have.length.greaterThan(0);
      expect(req.body.orderType).to.equal("collection");
      expect(req.body.savePaymentMethod).to.equal(true);
      req.reply({
        statusCode: 200,
        body: {
          sessionId: "cs_test_ordering_e2e",
          url: `${clientBaseUrl}/cart?stripe_checkout_started=1`,
        },
      });
    }).as("createStripeCheckout");

    cy.get('[data-cy="payment-method-card"]').click();
    cy.get('[data-cy="save-payment-method"]').should("be.checked");
    cy.get('[data-cy="checkout-button"]', { timeout: 15000 }).should("not.be.disabled").click();

    cy.wait("@createStripeCheckout");
    cy.location("search", { timeout: 15000 }).should("include", "stripe_checkout_started=1");
  });
});
