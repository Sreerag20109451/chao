import { adminBaseUrl, clientBaseUrl } from "../../../support/auth";

describe("Build - Ordering - Client And Admin", () => {
  it("ORDER-BUILD-CROSS-001: ordering module has separate client and admin origins", () => {
    expect(String(clientBaseUrl)).to.match(/^https?:\/\//);
    expect(String(adminBaseUrl)).to.match(/^https?:\/\//);
    expect(String(clientBaseUrl)).to.not.equal(String(adminBaseUrl));
  });
});
