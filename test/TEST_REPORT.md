# Chao E2E Test Report

Report date: 2026-04-27

## Summary

The E2E test suite currently has Cypress configured and includes two runnable spec files:

- `cypress/e2e/smoke.cy.ts`
- `cypress/e2e/settings.cy.ts`

Additional test cases are documented in:

- `README.md`
- `cypress/e2e/test-cases.comments.ts`

This report is a documentation/status report. The Cypress suite was not executed as part of this report because no running customer or admin development server was verified during generation.

## Current Coverage Status

| Area | Status | Notes |
| --- | --- | --- |
| Customer home smoke | Implemented | Covered by `smoke.cy.ts`. |
| Customer menu smoke | Implemented | Covered by `smoke.cy.ts`. |
| Customer cart smoke | Planned | Documented, not yet automated. |
| Customer navigation | Planned | Documented, not yet automated. |
| Customer authentication | Planned | Requires seeded users and stable selectors. |
| Customer menu filtering/customisation | Planned | Requires seeded menu data and stable selectors. |
| Customer checkout | Planned | Requires open-store settings, seeded customer data, and cleanup strategy. |
| Customer account/order history | Planned | Requires seeded order history. |
| Admin smoke/authentication | Planned | Requires seeded admin credentials and app running under Cypress. |
| Admin dashboard | Planned | Requires seeded operational data. |
| Admin menu management | Planned | Requires test data isolation and stable selectors. |
| Admin orders | Planned | Requires seeded order lifecycle data. |
| Admin settings | Partially implemented | `settings.cy.ts` contains early integration coverage, but login and cross-app assertions are still commented. |
| Admin deals, drivers, billing | Planned | Documented, not yet automated. |
| Cross-app integration | Planned | Requires customer/admin apps running on separate ports against the same test Firebase project. |

## Runnable Tests

### `smoke.cy.ts`

Result: Not executed in this report.

Implemented cases:

- `CUST-SMOKE-001` - Home page loads.
- `CUST-SMOKE-002` - Menu page loads.

Expected command:

```bash
cd test
npm run cypress:run -- --spec "cypress/e2e/smoke.cy.ts"
```

Prerequisite:

- Customer app must be running at `http://localhost:3000`.

### `settings.cy.ts`

Result: Not executed in this report.

Implemented or partially implemented cases:

- `INT-SETTINGS-003` - Store settings update reflects on customer app.
- `INT-SETTINGS-001` - Store closure blocks customer ordering.
- `INT-SETTINGS-002` - Opening hours display today's schedule first.

Known limitations:

- Admin login steps are still commented.
- Cross-app customer assertions are still commented.
- Selectors depend on current text and class structure.
- The tests assume admin and customer routes are available under the same Cypress `baseUrl`, which is not enough for the final cross-app setup.

Expected command:

```bash
cd test
npm run cypress:run -- --spec "cypress/e2e/settings.cy.ts"
```

Prerequisite:

- Admin or customer app must be running at `http://localhost:3000`, depending on the case under execution.
- Test database state must be safe to mutate.

## Test Case Inventory

| Category | Total Documented | Automated | Partial | Planned |
| --- | ---: | ---: | ---: | ---: |
| Customer smoke | 3 | 2 | 0 | 1 |
| Customer navigation | 3 | 0 | 0 | 3 |
| Customer authentication | 4 | 0 | 0 | 4 |
| Customer menu | 5 | 0 | 0 | 5 |
| Customer cart and checkout | 7 | 0 | 0 | 7 |
| Customer account | 5 | 0 | 0 | 5 |
| Admin smoke/authentication | 7 | 0 | 0 | 7 |
| Admin navigation/dashboard | 4 | 0 | 0 | 4 |
| Admin menu management | 9 | 0 | 0 | 9 |
| Admin orders | 7 | 0 | 0 | 7 |
| Admin settings | 5 | 0 | 3 | 2 |
| Admin deals | 3 | 0 | 0 | 3 |
| Admin drivers | 2 | 0 | 0 | 2 |
| Admin billing | 3 | 0 | 0 | 3 |
| Cross-app integration | 7 | 0 | 3 | 4 |

## Risks And Gaps

- Stable selectors are missing for many flows. Add `data-cy` or `data-testid` attributes before automating complex tests.
- Cypress currently has one `baseUrl`, but cross-app tests need separate customer and admin URLs.
- Authentication helpers are not implemented yet.
- Test Firebase seed and cleanup scripts are not implemented yet.
- Destructive admin menu import tests must only run against isolated test data.
- Current settings specs include commented login and cross-app verification steps, so they should not be treated as production-ready.

## Recommended Next Steps

1. Add stable selectors to core customer and admin controls.
2. Add Cypress environment variables for `CUSTOMER_BASE_URL`, `ADMIN_BASE_URL`, admin credentials, and customer credentials.
3. Create login helper commands with `cy.session()`.
4. Add seed/cleanup support for customers, menu items, store settings, orders, deals, and drivers.
5. Convert the documented smoke and critical cases into runnable `.cy.ts` specs in this order:
   - Customer smoke and empty cart.
   - Admin smoke and auth redirect.
   - Customer menu customisation.
   - Customer collection checkout.
   - Admin order status update.
   - Cross-app order status verification.

## Release Readiness

Current E2E readiness: Documentation complete, automation early-stage.

The suite should not yet be used as a merge gate for full release confidence. It can be used as a starting smoke suite once the customer app is running locally or in CI.
