import { getAuthCaptchaMode } from "@/lib/recaptchaClient";

describe("recaptchaClient auth captcha mode", () => {
  const originalMode = process.env.NEXT_PUBLIC_AUTH_CAPTCHA_MODE;

  afterEach(() => {
    if (originalMode === undefined) {
      delete process.env.NEXT_PUBLIC_AUTH_CAPTCHA_MODE;
    } else {
      process.env.NEXT_PUBLIC_AUTH_CAPTCHA_MODE = originalMode;
    }
  });

  it("defaults to enforce mode when unset", () => {
    delete process.env.NEXT_PUBLIC_AUTH_CAPTCHA_MODE;

    expect(getAuthCaptchaMode()).toBe("enforce");
  });

  it("requires an explicit adaptive override", () => {
    process.env.NEXT_PUBLIC_AUTH_CAPTCHA_MODE = "adaptive";

    expect(getAuthCaptchaMode()).toBe("adaptive");
  });

  it("treats invalid mode values as enforce", () => {
    process.env.NEXT_PUBLIC_AUTH_CAPTCHA_MODE = "unexpected";

    expect(getAuthCaptchaMode()).toBe("enforce");
  });
});
