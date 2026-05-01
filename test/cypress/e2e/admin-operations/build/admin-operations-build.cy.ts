import { clearBrowserState, loginAsAdmin, visitAdmin } from "../../../support/auth";

describe("Build - Admin Operations", () => {
  beforeEach(() => {
    clearBrowserState();
    loginAsAdmin();
  });

  const routes = [
    { path: "/", text: "Dashboard Overview" },
    { path: "/menu", text: "Menu Management" },
    { path: "/settings", text: "Settings" },
    { path: "/deals", text: "Restaurant Deals" },
    { path: "/payments", text: "Payments" },
    { path: "/messages", text: "Messages" },
    { path: "/drivers", text: "Delivery Drivers" },
    { path: "/billing", text: "Current order" },
  ];

  routes.forEach(({ path, text }) => {
    it(`ADMIN-OPS-BUILD-${path === "/" ? "DASHBOARD" : path.slice(1).toUpperCase()}: ${path} renders`, () => {
      visitAdmin(path);
      cy.get("body", { timeout: 30000 }).then(($body) => {
        if ($body.text().trim().length === 0) {
          cy.reload();
        }
      });
      cy.contains(text, { timeout: 30000 }).should("be.visible");
    });
  });
});
