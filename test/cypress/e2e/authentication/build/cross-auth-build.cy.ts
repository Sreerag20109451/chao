import { adminBaseUrl, clientBaseUrl } from "../../../support/auth";

describe("Build - Authentication - Client And Admin", () => {
  it("AUTH-BUILD-CROSS-001: client and admin auth origins are configured separately", () => {
    expect(String(clientBaseUrl)).to.not.equal(String(adminBaseUrl));
    expect(String(clientBaseUrl)).to.match(/^https?:\/\//);
    expect(String(adminBaseUrl)).to.match(/^https?:\/\//);
  });
});
