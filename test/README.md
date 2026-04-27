# Chao E2E Test Plan

This document defines the end-to-end testing approach for the Chao customer app, admin app, and the workflows that connect them. The current E2E package uses Cypress and lives in this `test` workspace.

## Current Test Setup

- E2E runner: Cypress 15.
- Cypress config: `cypress.config.ts`.
- Existing specs: `cypress/e2e/smoke.cy.ts` and `cypress/e2e/settings.cy.ts`.
- Default Cypress `baseUrl`: `http://localhost:3000`.
- Customer app: Next.js pages app in `../client`.
- Admin app: Next.js app using React Router routes in `../admin`.

Run Cypress from this directory:

```bash
npm install
npm run cypress:open
npm run cypress:run
```

Run one app locally before running tests:

```bash
cd ../client
npm install
npm run dev
```

or:

```bash
cd ../admin
npm install
npm run dev
```

Because both apps default to port `3000`, cross-app scenarios need an explicit multi-app setup, for example customer on `3000` and admin on `3001`, with Cypress `baseUrl` or environment variables pointing to both origins.

## Goals

The E2E suite should prove that a real user can complete critical restaurant ordering workflows and that staff can manage the operational state that customers depend on. It should cover the highest-risk flows first, keep test data isolated, and avoid asserting implementation details that make tests brittle.

Primary goals:

- Confirm customer discovery, menu browsing, customization, cart, checkout, order history, and account flows work from the browser.
- Confirm admin authentication, dashboard navigation, menu management, order operations, driver management, deals, billing, and settings flows work from the browser.
- Confirm cross-app behavior where admin changes affect the customer experience, especially menu availability, store status, order status, and notifications.
- Provide enough smoke coverage to catch broken deploys quickly and enough regression coverage for business-critical paths.

Non-goals for E2E:

- Exhaustively test every component state already covered by Jest or Vitest.
- Validate every visual styling detail.
- Test Firebase SDK internals.
- Test third-party payment processing in production mode.

## Test Environment Strategy

Use three levels of environments:

1. Local development: Run either customer or admin against local or test Firebase data. Use this for authoring and debugging specs.
2. Preview or staging: Run the full regression suite against deployed customer and admin apps with test-only Firebase projects or isolated collections.
3. Production smoke: Run only read-only smoke tests and safe account flows. Do not create real orders, mutate menus, or alter settings in production.

Recommended environment variables:

- `CUSTOMER_BASE_URL`: Customer app URL, for example `http://localhost:3000`.
- `ADMIN_BASE_URL`: Admin app URL, for example `http://localhost:3001`.
- `E2E_CUSTOMER_EMAIL`: Seeded customer account email.
- `E2E_CUSTOMER_PASSWORD`: Seeded customer account password.
- `E2E_ADMIN_EMAIL`: Seeded admin account email.
- `E2E_ADMIN_PASSWORD`: Seeded admin account password.
- `E2E_FIREBASE_PROJECT_ID`: Test Firebase project identifier.

Recommended Cypress config direction:

- Keep `baseUrl` as the primary app under test for simple specs.
- Use `Cypress.env("CUSTOMER_BASE_URL")` and `Cypress.env("ADMIN_BASE_URL")` for cross-app specs.
- Use `cy.session()` for login caching after the auth flow itself has been tested.
- Use `cy.intercept()` only for deterministic edge cases such as Firebase failures, closed-store responses, or unavailable menu data.

## Test Data Strategy

E2E tests need predictable seed data. Avoid relying on whatever data happens to exist in Firestore.

Required seeded entities:

- Customer account with a verified email, no active cart, one saved address, one payment method placeholder, and known order history.
- Customer account without an address or phone number for checkout validation tests.
- Admin account with permission to access all admin routes.
- Menu items in each major category, including at least one customisable curry or stir-fry with protein, side, spice, and allergen options.
- One unavailable menu item to verify customer filtering.
- One active deal and one inactive deal.
- Store settings for open, closed, and future-opening states.
- Orders in `pending`, `preparing`, `ready`, `delivered`, and `cancelled` statuses.
- At least one active driver and one inactive driver.

Data isolation rules:

- Prefix records created by tests with `e2e-` and a run id, for example `e2e-menu-item-${Date.now()}`.
- Clean up records after each spec when practical.
- Prefer idempotent seed scripts for staging over UI setup steps inside every test.
- Keep destructive tests, such as full menu replacement, out of routine smoke runs unless they use an isolated database.

## Suite Structure

Recommended spec layout:

```text
cypress/e2e/
  customer/
    smoke.cy.ts
    navigation.cy.ts
    auth.cy.ts
    menu.cy.ts
    cart-checkout.cy.ts
    account.cy.ts
  admin/
    smoke.cy.ts
    auth.cy.ts
    dashboard.cy.ts
    menu-management.cy.ts
    orders.cy.ts
    settings.cy.ts
    deals.cy.ts
    drivers.cy.ts
    billing.cy.ts
  integration/
    admin-to-customer-menu.cy.ts
    admin-to-customer-orders.cy.ts
    store-status.cy.ts
```

Use test tags or naming conventions to split execution:

- `smoke`: Fast checks for deploy confidence.
- `critical`: Revenue and operations paths.
- `regression`: Broader coverage before release.
- `destructive`: Tests that mutate large data sets or require isolated databases.

## Customer Test Cases

### Customer Smoke

`CUST-SMOKE-001` - Home page loads

- Preconditions: Customer app is running.
- Steps: Visit `/`; wait for page content; verify Chao brand content is visible.
- Expected result: Home renders without console-level app failure and shows primary navigation.
- Priority: Smoke.

`CUST-SMOKE-002` - Menu page loads

- Preconditions: Seeded menu exists.
- Steps: Visit `/menu`; verify the menu header and dish count are visible.
- Expected result: Menu renders available dishes and no loading spinner remains.
- Priority: Smoke.

`CUST-SMOKE-003` - Empty cart state loads

- Preconditions: Browser storage is cleared.
- Steps: Visit `/cart`.
- Expected result: Empty cart message and link back to `/menu` are visible.
- Priority: Smoke.

### Customer Navigation

`CUST-NAV-001` - Primary navigation routes work

- Preconditions: Customer app is running.
- Steps: Visit `/`; use navbar links to open Menu, Contact, Cart, Login, and Register.
- Expected result: Each route loads the correct page content and URL.
- Priority: Regression.

`CUST-NAV-002` - Footer links and restaurant information render

- Preconditions: Customer app is running.
- Steps: Visit `/`; scroll to footer; verify contact details, opening information, and important links.
- Expected result: Footer content is visible and links navigate successfully.
- Priority: Regression.

`CUST-NAV-003` - Mobile navigation opens and closes

- Preconditions: Viewport is set to a mobile size.
- Steps: Visit `/`; open the mobile menu; navigate to `/menu`; return and close the menu.
- Expected result: Mobile menu is keyboard/click accessible and does not trap the user.
- Priority: Regression.

### Customer Authentication

`CUST-AUTH-001` - Customer can register

- Preconditions: Test email is unused.
- Steps: Visit `/register`; fill required fields; submit.
- Expected result: Account is created, user becomes authenticated, and the UI reflects logged-in state.
- Priority: Critical.

`CUST-AUTH-002` - Customer can log in

- Preconditions: Seeded customer account exists.
- Steps: Visit `/login`; enter valid credentials; submit.
- Expected result: User is authenticated and account/profile links become available.
- Priority: Critical.

`CUST-AUTH-003` - Invalid login shows validation

- Preconditions: Customer app is running.
- Steps: Visit `/login`; enter invalid credentials; submit.
- Expected result: Login fails with a visible error and user remains logged out.
- Priority: Regression.

`CUST-AUTH-004` - Customer can log out

- Preconditions: Customer is logged in.
- Steps: Use account/logout control.
- Expected result: Session ends, authenticated links disappear, and protected account pages no longer render user data.
- Priority: Critical.

### Customer Menu

`CUST-MENU-001` - Category filters update visible dishes

- Preconditions: Seeded menu has items in each category.
- Steps: Visit `/menu`; select each category filter.
- Expected result: Dish count and cards update to match the selected category.
- Priority: Critical.

`CUST-MENU-002` - Unavailable items are hidden

- Preconditions: Seeded unavailable item exists.
- Steps: Visit `/menu`; search visible card names or filter relevant category.
- Expected result: Unavailable item is not shown to customers.
- Priority: Critical.

`CUST-MENU-003` - Menu load error is visible

- Preconditions: Menu listener is forced to fail through intercept or test Firebase rule.
- Steps: Visit `/menu`.
- Expected result: User sees a friendly menu load error and the page does not crash.
- Priority: Regression.

`CUST-MENU-004` - Customer can customise a dish

- Preconditions: Seeded customisable menu item exists with protein, side, and spice options.
- Steps: Visit `/menu`; open a customisable dish; select protein, side, and spice; add to cart.
- Expected result: Cart count updates and selected customisations are preserved.
- Priority: Critical.

`CUST-MENU-005` - Deal information is visible only when active

- Preconditions: One active and one inactive deal exist.
- Steps: Visit `/menu`; inspect menu cards associated with deals.
- Expected result: Active deal appears where applicable; inactive deal is not promoted.
- Priority: Regression.

### Customer Cart And Checkout

`CUST-CART-001` - Cart totals update when quantities change

- Preconditions: Cart contains at least one item.
- Steps: Visit `/cart`; increase and decrease item quantity.
- Expected result: Quantity, subtotal, service charge, delivery fee, and total update correctly.
- Priority: Critical.

`CUST-CART-002` - Customer can remove an item

- Preconditions: Cart contains at least one item.
- Steps: Visit `/cart`; remove the item.
- Expected result: Item is removed; empty cart state appears when no items remain.
- Priority: Critical.

`CUST-CART-003` - Delivery requires an address

- Preconditions: Customer is logged in without saved addresses and cart has items.
- Steps: Visit `/cart`; select delivery; attempt checkout.
- Expected result: Checkout is disabled or blocked until an address is added.
- Priority: Critical.

`CUST-CART-004` - Phone number is required

- Preconditions: Customer has no phone number and cart has items.
- Steps: Visit `/cart`; leave phone blank; attempt checkout.
- Expected result: Checkout is disabled or blocked until a phone number is provided.
- Priority: Critical.

`CUST-CART-005` - Collection checkout creates an order

- Preconditions: Store is open, customer is logged in, and cart has items.
- Steps: Visit `/cart`; select collection; enter phone if needed; choose pickup time; place order.
- Expected result: Order is created, cart clears, confirmation is visible, and order appears in order history.
- Priority: Critical.

`CUST-CART-006` - Delivery checkout creates an order with address

- Preconditions: Store is open, customer has a saved address, and cart has items.
- Steps: Visit `/cart`; select delivery; choose address; place order.
- Expected result: Delivery order is created with selected address and correct delivery fee.
- Priority: Critical.

`CUST-CART-007` - Closed store blocks checkout

- Preconditions: Store settings make the store closed.
- Steps: Add an item to cart; visit `/cart`.
- Expected result: Checkout is disabled and closed-store messaging is visible.
- Priority: Critical.

### Customer Account

`CUST-ACCOUNT-001` - Profile page renders saved customer details

- Preconditions: Customer is logged in with seeded profile data.
- Steps: Visit `/profile`.
- Expected result: Profile details, addresses, payment methods, and account actions render.
- Priority: Regression.

`CUST-ACCOUNT-002` - Customer can add a delivery address

- Preconditions: Customer is logged in.
- Steps: Visit profile or cart address flow; add a new address.
- Expected result: Address is saved and can be selected for delivery.
- Priority: Critical.

`CUST-ACCOUNT-003` - Order history renders existing orders

- Preconditions: Customer has seeded orders.
- Steps: Visit `/orders`.
- Expected result: Orders display status, total, order type, date/time, and items.
- Priority: Critical.

`CUST-ACCOUNT-004` - Empty order history gives recovery path

- Preconditions: Customer has no orders.
- Steps: Visit `/orders`.
- Expected result: Empty state appears with link to menu.
- Priority: Regression.

`CUST-ACCOUNT-005` - Payments page handles saved methods

- Preconditions: Customer has seeded payment method placeholder data.
- Steps: Visit `/payments`.
- Expected result: Payment methods render with primary marker and security copy.
- Priority: Regression.

## Admin Test Cases

### Admin Smoke

`ADMIN-SMOKE-001` - Public landing page loads

- Preconditions: Admin app is running and no admin session exists.
- Steps: Visit `/landing`.
- Expected result: Landing page content and login/register options are visible.
- Priority: Smoke.

`ADMIN-SMOKE-002` - Protected routes redirect when unauthenticated

- Preconditions: No admin session exists.
- Steps: Visit `/`, `/menu`, `/orders`, and `/settings`.
- Expected result: User is redirected to `/landing`.
- Priority: Smoke.

`ADMIN-SMOKE-003` - Dashboard loads for authenticated admin

- Preconditions: Admin is logged in.
- Steps: Visit `/`.
- Expected result: Dashboard shell, navbar, sidebar, and dashboard content render.
- Priority: Smoke.

### Admin Authentication

`ADMIN-AUTH-001` - Admin can log in

- Preconditions: Seeded admin account exists.
- Steps: Visit `/login`; submit valid credentials.
- Expected result: Admin is redirected to dashboard.
- Priority: Critical.

`ADMIN-AUTH-002` - Invalid admin login is rejected

- Preconditions: Admin app is running.
- Steps: Visit `/login`; submit invalid credentials.
- Expected result: Error is visible and private routes remain unavailable.
- Priority: Regression.

`ADMIN-AUTH-003` - Authenticated admin is redirected away from public routes

- Preconditions: Admin is logged in.
- Steps: Visit `/landing`, `/login`, and `/register`.
- Expected result: Admin is redirected to dashboard.
- Priority: Regression.

`ADMIN-AUTH-004` - Admin can log out

- Preconditions: Admin is logged in.
- Steps: Use logout control.
- Expected result: Session ends and protected routes redirect to `/landing`.
- Priority: Critical.

### Admin Navigation And Dashboard

`ADMIN-NAV-001` - Sidebar navigation opens all private pages

- Preconditions: Admin is logged in.
- Steps: Use sidebar links for Dashboard, Billing, Menu, Deals, Orders, Drivers, and Settings.
- Expected result: Each page loads the correct heading and URL.
- Priority: Critical.

`ADMIN-NAV-002` - Responsive navigation works on mobile viewport

- Preconditions: Admin is logged in and viewport is mobile.
- Steps: Open admin navigation; navigate to Orders and Settings.
- Expected result: Navigation is usable and content remains accessible.
- Priority: Regression.

`ADMIN-DASH-001` - Dashboard summary renders seeded metrics

- Preconditions: Seeded orders and menu data exist.
- Steps: Visit `/`.
- Expected result: Dashboard metrics match seeded data and no loading state remains.
- Priority: Critical.

`ADMIN-DASH-002` - Dashboard handles empty data

- Preconditions: Test database has no orders.
- Steps: Visit `/`.
- Expected result: Empty or zero state appears without crashing.
- Priority: Regression.

### Admin Menu Management

`ADMIN-MENU-001` - Admin can view menu items

- Preconditions: Seeded menu exists and admin is logged in.
- Steps: Visit `/menu`.
- Expected result: Menu Management heading, search, category information, and menu rows/cards render.
- Priority: Critical.

`ADMIN-MENU-002` - Admin can search menu items

- Preconditions: Seeded menu exists.
- Steps: Visit `/menu`; search by item name and category.
- Expected result: List filters to matching items and resets when search is cleared.
- Priority: Regression.

`ADMIN-MENU-003` - Admin can add a simple menu item

- Preconditions: Admin is logged in.
- Steps: Visit `/menu`; open add item dialog; fill name, description, base price, category, and emoji; save.
- Expected result: Success toast appears and the new item is listed.
- Priority: Critical.

`ADMIN-MENU-004` - Admin can add a customisable menu item

- Preconditions: Admin is logged in.
- Steps: Create item in a customisable category; select meats, sides, spice levels, and allergens; save.
- Expected result: Item saves with all selected options and appears in customer menu when available.
- Priority: Critical.

`ADMIN-MENU-005` - Required fields are validated

- Preconditions: Admin is logged in.
- Steps: Open add item dialog; submit with missing name or category.
- Expected result: Validation toast appears and no item is created.
- Priority: Regression.

`ADMIN-MENU-006` - Admin can edit a menu item

- Preconditions: Seeded editable item exists.
- Steps: Open edit action; change price or description; save.
- Expected result: Success toast appears and updated values persist after reload.
- Priority: Critical.

`ADMIN-MENU-007` - Admin can toggle availability

- Preconditions: Seeded available item exists.
- Steps: Toggle availability off; reload admin menu; open customer menu.
- Expected result: Admin shows unavailable state and customer menu hides the item.
- Priority: Critical.

`ADMIN-MENU-008` - Admin can delete a menu item

- Preconditions: Seeded disposable item exists.
- Steps: Trigger delete; confirm toast action.
- Expected result: Item is removed from admin and customer menu.
- Priority: Regression.

`ADMIN-MENU-009` - Full menu import is protected

- Preconditions: Admin is logged in and isolated test database is used.
- Steps: Click full menu import; cancel confirmation; repeat and confirm in isolated environment.
- Expected result: Cancel does nothing; confirm replaces menu and shows added/deleted counts.
- Priority: Destructive.

### Admin Orders

`ADMIN-ORDERS-001` - Admin can view live orders

- Preconditions: Seeded orders exist.
- Steps: Visit `/orders`.
- Expected result: Active Orders heading, live order count, rows, statuses, totals, and placed time render.
- Priority: Critical.

`ADMIN-ORDERS-002` - Admin can search orders

- Preconditions: Seeded orders include distinct customer names and ids.
- Steps: Search by customer name and order id.
- Expected result: Matching rows remain and non-matching rows are hidden.
- Priority: Regression.

`ADMIN-ORDERS-003` - Admin can accept a pending order

- Preconditions: Pending order exists.
- Steps: Visit `/orders`; click Accept.
- Expected result: Order status changes to `preparing` and customer notification/order history updates.
- Priority: Critical.

`ADMIN-ORDERS-004` - Admin can reject a pending order

- Preconditions: Pending order exists.
- Steps: Visit `/orders`; click Reject.
- Expected result: Order status changes to `cancelled` and customer notification/order history updates.
- Priority: Critical.

`ADMIN-ORDERS-005` - Admin can move order through statuses

- Preconditions: Order exists.
- Steps: Change status from `preparing` to `ready` to `delivered` using the status selector.
- Expected result: Each status persists and customer order history reflects the latest status.
- Priority: Critical.

`ADMIN-ORDERS-006` - Admin can update prep time

- Preconditions: Order exists.
- Steps: Change prep time input and blur.
- Expected result: Prep time persists and target time updates.
- Priority: Regression.

`ADMIN-ORDERS-007` - Admin can open invoice

- Preconditions: Order exists with customer and item data.
- Steps: Click invoice action.
- Expected result: Invoice opens with order id, customer, items, totals, date/time, and delivery driver when applicable.
- Priority: Critical.

### Admin Settings

`ADMIN-SETTINGS-001` - Admin can view current settings

- Preconditions: Settings document exists.
- Steps: Visit `/settings`.
- Expected result: Store name, hours, closure, prep time, and relevant settings render.
- Priority: Critical.

`ADMIN-SETTINGS-002` - Admin can update store name

- Preconditions: Admin is logged in.
- Steps: Change store name; save.
- Expected result: Success message appears and setting persists after reload.
- Priority: Regression.

`ADMIN-SETTINGS-003` - Admin can update opening hours

- Preconditions: Admin is logged in.
- Steps: Change today's open and close times; save.
- Expected result: Hours persist and customer home displays updated hours.
- Priority: Critical.

`ADMIN-SETTINGS-004` - Admin can close the store

- Preconditions: Store is currently open.
- Steps: Enable closed-store setting; save; visit customer cart/home.
- Expected result: Customer sees closed-store messaging and checkout is blocked.
- Priority: Critical.

`ADMIN-SETTINGS-005` - Admin can reopen the store

- Preconditions: Store is closed.
- Steps: Disable closed-store setting; save; visit customer cart/home.
- Expected result: Closed-store messaging clears and checkout is available when other requirements are met.
- Priority: Critical.

### Admin Deals

`ADMIN-DEALS-001` - Admin can view deals

- Preconditions: Seeded deals exist.
- Steps: Visit `/deals`.
- Expected result: Deals page renders active and inactive deals.
- Priority: Regression.

`ADMIN-DEALS-002` - Admin can create a deal

- Preconditions: Admin is logged in and required menu items exist.
- Steps: Add deal details and save.
- Expected result: Deal is created and appears in admin deals list.
- Priority: Critical.

`ADMIN-DEALS-003` - Admin can toggle deal active state

- Preconditions: Deal exists.
- Steps: Toggle active state; visit customer menu.
- Expected result: Active deal appears to customers; inactive deal does not.
- Priority: Critical.

### Admin Drivers

`ADMIN-DRIVERS-001` - Admin can view drivers

- Preconditions: Seeded active and inactive drivers exist.
- Steps: Visit `/drivers`.
- Expected result: Driver list renders names, working status, and contact details.
- Priority: Regression.

`ADMIN-DRIVERS-002` - Admin can set active driver

- Preconditions: Driver exists.
- Steps: Mark a driver as working today.
- Expected result: Driver state persists and delivery invoices can include active driver.
- Priority: Critical.

### Admin Billing

`ADMIN-BILLING-001` - Admin can view billing summary

- Preconditions: Seeded delivered orders exist.
- Steps: Visit `/billing`.
- Expected result: Billing summary renders totals for the selected period.
- Priority: Critical.

`ADMIN-BILLING-002` - Admin can filter billing period

- Preconditions: Orders exist across multiple dates.
- Steps: Change date or period filters.
- Expected result: Revenue, order counts, fees, and exports update to the selected period.
- Priority: Regression.

`ADMIN-BILLING-003` - Billing excludes cancelled orders from revenue

- Preconditions: Delivered and cancelled orders exist.
- Steps: Visit billing summary.
- Expected result: Cancelled order totals do not inflate revenue.
- Priority: Critical.

## Cross-App Integration Test Cases

`INT-MENU-001` - Admin-created item appears on customer menu

- Preconditions: Customer and admin apps run against the same test Firebase project.
- Steps: Log in to admin; create an available menu item; visit customer `/menu`; filter to item category.
- Expected result: Customer sees the new item with correct details.
- Priority: Critical.

`INT-MENU-002` - Admin availability change hides item from customers

- Preconditions: Available seeded item exists.
- Steps: Toggle item unavailable in admin; visit customer `/menu`.
- Expected result: Item no longer appears to customers.
- Priority: Critical.

`INT-ORDER-001` - Customer order appears in admin orders

- Preconditions: Store is open and both apps share test data.
- Steps: Customer places collection order; admin visits `/orders`.
- Expected result: New pending order appears with customer name, order type, items, and total.
- Priority: Critical.

`INT-ORDER-002` - Admin status update appears in customer order history

- Preconditions: Customer has a pending order.
- Steps: Admin changes status to `preparing`, `ready`, and `delivered`; customer visits `/orders`.
- Expected result: Customer order status updates after each admin change.
- Priority: Critical.

`INT-ORDER-003` - Admin cancellation appears in customer order history

- Preconditions: Customer has a pending order.
- Steps: Admin rejects or changes order to `cancelled`; customer visits `/orders`.
- Expected result: Customer sees cancelled status and relevant notification.
- Priority: Critical.

`INT-SETTINGS-001` - Store closure blocks customer checkout

- Preconditions: Store is initially open.
- Steps: Admin closes store in settings; customer adds item to cart.
- Expected result: Customer cannot place order and sees closed-store messaging.
- Priority: Critical.

`INT-SETTINGS-002` - Opening hours display today's schedule first

- Preconditions: Settings contain full week schedule.
- Steps: Visit customer home.
- Expected result: Today's opening hours appear first and are labelled as today.
- Priority: Regression.

`INT-DEALS-001` - Active deal is customer-visible

- Preconditions: Admin can create or toggle deals.
- Steps: Admin activates a deal; customer visits `/menu`.
- Expected result: Deal is visible in customer menu card or promotion area.
- Priority: Regression.

## Accessibility And UX Coverage

Add accessibility checks to the core smoke suite after stable selectors exist:

- Pages have meaningful headings.
- Buttons and inputs have accessible names.
- Dialogs can be opened, closed, and submitted with keyboard interaction.
- Focus is not lost after opening customization, address, or admin edit dialogs.
- Error messages are visible and associated with the relevant action.
- Mobile viewports remain navigable for customer and admin shells.

Recommended viewport checks:

- Mobile: `375x667`.
- Tablet: `768x1024`.
- Desktop: `1280x720`.

## Reliability Requirements

Use stable selectors for new E2E coverage. Prefer `data-testid` or `data-cy` attributes on important controls and avoid selecting by long Tailwind class names.

Recommended selectors:

- Customer: `customer-navbar`, `menu-category-filter`, `menu-card`, `customize-modal`, `add-to-cart`, `cart-item`, `checkout-button`, `order-type-delivery`, `order-type-collection`.
- Admin: `admin-sidebar`, `admin-menu-add-item`, `admin-menu-item-row`, `admin-order-row`, `admin-order-status`, `admin-settings-save`, `admin-deal-row`, `admin-driver-row`.

Reliability rules:

- Wait for user-visible states, not arbitrary timeouts.
- Assert persisted data after reload for mutations.
- Keep each test independent by logging in through `cy.session()` and creating its own data.
- Do not depend on test execution order.
- Clean local storage, session storage, and cookies between tests unless `cy.session()` is deliberately used.
- Capture screenshots on failure and keep Cypress videos disabled unless debugging flaky CI failures.

## Execution Plan

Phase 1: Smoke and routing

- Keep `smoke.cy.ts` green for customer home and menu.
- Add admin smoke tests for landing, unauthenticated redirects, and authenticated dashboard.
- Add customer empty cart and navigation smoke.

Phase 2: Critical customer revenue path

- Add customer auth helpers.
- Add deterministic menu seed.
- Cover menu customization, cart totals, collection checkout, delivery checkout, and order history.

Phase 3: Critical admin operations

- Add admin auth helpers.
- Cover menu add/edit/availability, orders status changes, settings store closure, and billing summary.

Phase 4: Cross-app integration

- Run customer and admin apps simultaneously on separate ports.
- Add admin-to-customer menu and settings tests.
- Add customer-order-to-admin and admin-status-to-customer tests.

Phase 5: Hardening

- Add accessibility checks to smoke tests.
- Add mobile viewport coverage.
- Add CI job with seeded test database.
- Track and quarantine flaky tests only with an owner and removal date.

## CI Recommendation

Run E2E in CI after unit tests and builds pass:

1. Install dependencies for `client`, `admin`, and `test`.
2. Build or start the app under test.
3. Seed test Firebase data.
4. Run Cypress smoke suite for every pull request.
5. Run critical and regression suites on main branch and before release.
6. Upload Cypress screenshots as artifacts on failure.

Suggested pipeline split:

- Pull requests: smoke plus critical customer checkout with mocked or isolated test data.
- Main branch: full customer and admin regression.
- Nightly: cross-app integration, destructive isolated tests, mobile coverage, and accessibility checks.

## Acceptance Criteria For E2E Coverage

The E2E suite is considered production-ready when:

- Smoke tests cover customer home/menu/cart and admin landing/authenticated dashboard.
- Critical customer ordering path passes for collection and delivery.
- Critical admin menu, orders, settings, and billing paths pass.
- At least one cross-app order status scenario proves customer and admin share the same operational data.
- Test data setup and cleanup are automated.
- CI can run smoke tests reliably without manual credentials.
- All new E2E specs use stable selectors instead of fragile class selectors.
