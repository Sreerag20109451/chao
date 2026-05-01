import { clientBaseUrl, loginAsClient, visitClient, waitForClientOverlayToClear } from "./auth";

export const enableOrderingTestMode = () => {
  cy.visit(clientBaseUrl, {
    onBeforeLoad(win) {
      win.localStorage.setItem("E2E_FORCE_STORE_OPEN", "true");
    },
  });
};

export const loginClientAndOpenMenu = () => {
  enableOrderingTestMode();
  loginAsClient();
  cy.location("pathname", { timeout: 15000 }).should("eq", "/");
  visitClient("/menu");
  waitForClientOverlayToClear();
  cy.get('[data-cy="menu-card"]', { timeout: 30000 }).should("have.length.greaterThan", 0);
};

export const addFirstMenuItemToCart = (extraQuantityClicks = 0) => {
  cy.get("body").then(($body) => {
    const directAddButtons = $body.find('[data-cy="add-menu-item-to-cart"]');

    if (directAddButtons.length) {
      cy.get('[data-cy="add-menu-item-to-cart"]').first().click();
    } else {
      cy.get('[data-cy="customize-menu-item"]', { timeout: 30000 }).first().click();
      cy.get('[data-cy="customize-add-to-cart"]', { timeout: 10000 }).click();
    }
  });

  cy.get('a[aria-label="View Cart"]', { timeout: 10000 }).click();
  cy.get('[data-cy="cart-item"]', { timeout: 20000 }).should("have.length.greaterThan", 0);

  for (let i = 0; i < extraQuantityClicks; i += 1) {
    cy.get('[data-cy="cart-item-increment"]').first().click();
  }
};

export const chooseCollectionOrder = () => {
  cy.get('[data-cy="order-type-collection"]').click();
};

export const fillCheckoutPhoneIfVisible = (phone = "0891234567") => {
  cy.get("body").then(($body) => {
    if ($body.find('[data-cy="checkout-phone"]').length) {
      cy.get('[data-cy="checkout-phone"]').clear().type(phone);
    }
  });
};

export const prepareCollectionCart = (extraQuantityClicks = 3) => {
  loginClientAndOpenMenu();
  addFirstMenuItemToCart(extraQuantityClicks);
  chooseCollectionOrder();
  fillCheckoutPhoneIfVisible();
};
