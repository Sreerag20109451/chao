# Chao E2E Test Report

Report date: 2026-04-30

## Summary

The authentication, ordering, customer experience, and admin operations modules now have organized Cypress E2E test systems split by execution layer and app scope.

Execution commands:

```bash
cd test
npm run cypress:run:auth
npm run cypress:run:ordering
npm run cypress:run:customer
npm run cypress:run:admin-ops
```

Latest result:

| Module | Specs | Tests | Passing | Failing | Duration |
| --- | ---: | ---: | ---: | ---: | ---: |
| Authentication | 12 | 27 | 27 | 0 | 03:27 |
| Ordering | 12 | 18 | 18 | 0 | 04:22 |
| Customer Experience | 4 | 13 | 13 | 0 | 01:45 |
| Admin Operations | 4 | 18 | 18 | 0 | 03:46 |

Status: Passed.

Execution status note: all structured modules were executed and passed through stable module-level runs. A monolithic `npm run cypress:run:modules` run was attempted but hung in this local Electron environment, so the authoritative result is the one-by-one module execution above.

## Authentication Coverage

| Layer | Client | Admin | Client And Admin |
| --- | ---: | ---: | ---: |
| Build | 2 passing | 2 passing | 1 passing |
| Smoke | 2 passing | 2 passing | 2 passing |
| Regression | 4 passing | 5 passing | 2 passing |
| Accessibility | 2 passing | 2 passing | 1 passing |

Total: 27 passing.

## Ordering Coverage

| Layer | Client | Admin | Client And Admin |
| --- | ---: | ---: | ---: |
| Build | 3 passing | 1 passing | 1 passing |
| Smoke | 2 passing | 1 passing | 1 passing |
| Regression | 3 passing | 1 passing | 1 passing |
| Accessibility | 2 passing | 1 passing | 1 passing |

Total: 18 passing.

Stripe card coverage uses a fixture of official Stripe test card values. The in-app test verifies the app redirects to Stripe Checkout and does not collect or send raw card numbers itself.

## Added Module Coverage

| Module | Covered Surfaces | Automated Tests | Coverage Target |
| --- | --- | ---: | --- |
| Customer Experience | Home, contact, profile, payment methods, order history | 13 | At least 80% functional surface coverage |
| Admin Operations | Dashboard, menu, settings, deals, payments, messages, drivers, billing/POS | 18 | At least 80% functional surface coverage |

These suites favor non-destructive tests by default. They verify routing, primary controls, search/filter affordances, form validation, accessible labels, protected authenticated surfaces, POS validation, messages, dashboard, and delivery driver surfaces without saving settings, creating drivers, or modifying menu/deal records.

## Spec Inventory

| Layer | Scope | Spec |
| --- | --- | --- |
| Build | Client | `cypress/e2e/authentication/build/client-auth-build.cy.ts` |
| Build | Admin | `cypress/e2e/authentication/build/admin-auth-build.cy.ts` |
| Build | Client And Admin | `cypress/e2e/authentication/build/cross-auth-build.cy.ts` |
| Smoke | Client | `cypress/e2e/authentication/smoke/client-auth-smoke.cy.ts` |
| Smoke | Admin | `cypress/e2e/authentication/smoke/admin-auth-smoke.cy.ts` |
| Smoke | Client And Admin | `cypress/e2e/authentication/smoke/cross-auth-smoke.cy.ts` |
| Regression | Client | `cypress/e2e/authentication/regression/client-auth-regression.cy.ts` |
| Regression | Admin | `cypress/e2e/authentication/regression/admin-auth-regression.cy.ts` |
| Regression | Client And Admin | `cypress/e2e/authentication/regression/cross-auth-regression.cy.ts` |
| Accessibility | Client | `cypress/e2e/authentication/accessibility/client-auth-a11y.cy.ts` |
| Accessibility | Admin | `cypress/e2e/authentication/accessibility/admin-auth-a11y.cy.ts` |
| Accessibility | Client And Admin | `cypress/e2e/authentication/accessibility/cross-auth-a11y.cy.ts` |
| Build | Client | `cypress/e2e/ordering/build/client-ordering-build.cy.ts` |
| Build | Admin | `cypress/e2e/ordering/build/admin-ordering-build.cy.ts` |
| Build | Client And Admin | `cypress/e2e/ordering/build/cross-ordering-build.cy.ts` |
| Smoke | Client | `cypress/e2e/ordering/smoke/client-ordering-smoke.cy.ts` |
| Smoke | Admin | `cypress/e2e/ordering/smoke/admin-ordering-smoke.cy.ts` |
| Smoke | Client And Admin | `cypress/e2e/ordering/smoke/cross-ordering-smoke.cy.ts` |
| Regression | Client | `cypress/e2e/ordering/regression/client-ordering-regression.cy.ts` |
| Regression | Admin | `cypress/e2e/ordering/regression/admin-ordering-regression.cy.ts` |
| Regression | Client And Admin | `cypress/e2e/ordering/regression/cross-ordering-regression.cy.ts` |
| Accessibility | Client | `cypress/e2e/ordering/accessibility/client-ordering-a11y.cy.ts` |
| Accessibility | Admin | `cypress/e2e/ordering/accessibility/admin-ordering-a11y.cy.ts` |
| Accessibility | Client And Admin | `cypress/e2e/ordering/accessibility/cross-ordering-a11y.cy.ts` |
| Build | Client | `cypress/e2e/customer-experience/build/client-customer-build.cy.ts` |
| Smoke | Client | `cypress/e2e/customer-experience/smoke/client-customer-smoke.cy.ts` |
| Regression | Client | `cypress/e2e/customer-experience/regression/client-customer-regression.cy.ts` |
| Accessibility | Client | `cypress/e2e/customer-experience/accessibility/client-customer-a11y.cy.ts` |
| Build | Admin | `cypress/e2e/admin-operations/build/admin-operations-build.cy.ts` |
| Smoke | Admin | `cypress/e2e/admin-operations/smoke/admin-operations-smoke.cy.ts` |
| Regression | Admin | `cypress/e2e/admin-operations/regression/admin-operations-regression.cy.ts` |
| Accessibility | Admin | `cypress/e2e/admin-operations/accessibility/admin-operations-a11y.cy.ts` |

## Available Scripts

| Purpose | Command |
| --- | --- |
| Full authentication module | `npm run cypress:run:auth` |
| All client auth specs | `npm run cypress:run:auth:client` |
| All admin auth specs | `npm run cypress:run:auth:admin` |
| All cross-portal auth specs | `npm run cypress:run:auth:cross` |
| Build layer | `npm run cypress:run:auth:build` |
| Smoke layer | `npm run cypress:run:auth:smoke` |
| Regression layer | `npm run cypress:run:auth:regression` |
| Accessibility layer | `npm run cypress:run:auth:accessibility` |
| Full ordering module | `npm run cypress:run:ordering` |
| All client ordering specs | `npm run cypress:run:ordering:client` |
| All admin ordering specs | `npm run cypress:run:ordering:admin` |
| All cross-portal ordering specs | `npm run cypress:run:ordering:cross` |
| Ordering build layer | `npm run cypress:run:ordering:build` |
| Ordering smoke layer | `npm run cypress:run:ordering:smoke` |
| Ordering regression layer | `npm run cypress:run:ordering:regression` |
| Ordering accessibility layer | `npm run cypress:run:ordering:accessibility` |
| Full customer experience module | `npm run cypress:run:customer` |
| Customer build layer | `npm run cypress:run:customer:build` |
| Customer smoke layer | `npm run cypress:run:customer:smoke` |
| Customer regression layer | `npm run cypress:run:customer:regression` |
| Customer accessibility layer | `npm run cypress:run:customer:accessibility` |
| Full admin operations module | `npm run cypress:run:admin-ops` |
| Admin operations build layer | `npm run cypress:run:admin-ops:build` |
| Admin operations smoke layer | `npm run cypress:run:admin-ops:smoke` |
| Admin operations regression layer | `npm run cypress:run:admin-ops:regression` |
| Admin operations accessibility layer | `npm run cypress:run:admin-ops:accessibility` |
| All structured modules | `npm run cypress:run:modules` |

## Test Data

Default authentication credentials used by the suite:

| Account | Email | Password Source |
| --- | --- | --- |
| Client | `test@client.net` | `E2E_CUSTOMER_PASSWORD` or default `clienttest123@` |
| Admin | `admin@test.net` | `E2E_ADMIN_PASSWORD` or default `admintest123@` |

The suite also supports:

- `CUSTOMER_BASE_URL` or `CLIENT_BASE_URL`
- `ADMIN_BASE_URL`
- `E2E_CUSTOMER_EMAIL`
- `E2E_CUSTOMER_PASSWORD`
- `E2E_ADMIN_EMAIL`
- `E2E_ADMIN_PASSWORD`

Ordering test data:

| Data | Value |
| --- | --- |
| Stripe successful Visa | `4242424242424242` |
| Stripe generic decline | `4000000000000002` |
| Stripe 3DS required | `4000002500003155` |

## Runtime Notes

- Cypress must run with the customer app on `http://localhost:3000` and admin app on `http://localhost:3001`, unless URLs are overridden through environment variables.
- On this Windows environment, Cypress required `ELECTRON_RUN_AS_NODE` to be cleared before execution.
- Cypress prints an `allowCypressEnv` migration warning. It does not fail the suite.

## Automatic Report Libraries

Recommended for this project:

| Library | Best Use | Notes |
| --- | --- | --- |
| `cypress-mochawesome-reporter` | Human-readable local HTML reports | Best first choice for developer-friendly Cypress reports with screenshots embedded. |
| `mochawesome` + `mochawesome-merge` + `mochawesome-report-generator` | Custom merged HTML/JSON reports | More manual setup, useful if you want custom merge/report scripts. |
| `mocha-junit-reporter` | CI systems such as GitHub Actions, Jenkins, GitLab | Produces JUnit XML that CI tools can parse for test dashboards. |
| `allure-cypress` | Rich historical QA reports | Good for larger QA process, categories, attachments, trend history. More setup than Mochawesome. |
| Cypress Cloud | Hosted dashboard, screenshots, videos, flake analytics | Easiest hosted option, but requires Cypress Cloud setup and project recording. |

Recommended path:

1. Add `cypress-mochawesome-reporter` for local HTML reports.
2. Add `mocha-junit-reporter` later when CI is introduced.
3. Consider Allure only if the test suite grows into a formal QA dashboard.

Suggested install:

```bash
cd test
npm install --save-dev cypress-mochawesome-reporter
```

Suggested Cypress config after install:

```ts
import { defineConfig } from "cypress";

export default defineConfig({
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "reports/cypress",
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      require("cypress-mochawesome-reporter/plugin")(on);
      return config;
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
  },
});
```

Suggested support import after install:

```ts
import "cypress-mochawesome-reporter/register";
```

Suggested report script:

```json
"cypress:run:auth:report": "cypress run --spec \"cypress/e2e/authentication/{build,smoke,regression,accessibility}/*.cy.ts\""
```

## Next Steps

1. Install and configure `cypress-mochawesome-reporter`.
2. Add `reports/` to `.gitignore` if reports should stay local.
3. Repeat this build/smoke/regression/accessibility structure for the next module.
4. Update `Test_Cases.csv` as each module is automated.
