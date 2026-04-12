import { getSafeAuthRedirectAfterSignIn } from "@/lib/safeAuthRedirect"

describe("getSafeAuthRedirectAfterSignIn", () => {
  it("returns null for null, empty, or non-relative paths", () => {
    expect(getSafeAuthRedirectAfterSignIn(null)).toBeNull()
    expect(getSafeAuthRedirectAfterSignIn("")).toBeNull()
    expect(getSafeAuthRedirectAfterSignIn("   ")).toBeNull()
    expect(getSafeAuthRedirectAfterSignIn("//evil.com")).toBeNull()
    expect(getSafeAuthRedirectAfterSignIn("https://x.test/foo")).toBeNull()
  })

  it("allows known exact paths", () => {
    expect(getSafeAuthRedirectAfterSignIn("/profile")).toBe("/profile")
    expect(getSafeAuthRedirectAfterSignIn("/tools")).toBe("/tools")
    expect(getSafeAuthRedirectAfterSignIn("/mystical-profile")).toBe("/mystical-profile")
    expect(getSafeAuthRedirectAfterSignIn("/community/attribution")).toBe("/community/attribution")
  })

  it("maps unknown community subpaths to attribution", () => {
    expect(getSafeAuthRedirectAfterSignIn("/community/discussions")).toBe("/community/attribution")
    expect(getSafeAuthRedirectAfterSignIn("/community/foo/bar")).toBe("/community/attribution")
  })

  it("allows /community index", () => {
    expect(getSafeAuthRedirectAfterSignIn("/community")).toBe("/community")
    expect(getSafeAuthRedirectAfterSignIn("/community/")).toBe("/community")
  })

  it("normalizes attribution subpaths to attribution root", () => {
    expect(getSafeAuthRedirectAfterSignIn("/community/attribution/extra")).toBe("/community/attribution")
  })

  it("allows tools and learn prefixes", () => {
    expect(getSafeAuthRedirectAfterSignIn("/tools/tarot")).toBe("/tools/tarot")
    expect(getSafeAuthRedirectAfterSignIn("/learn/some-slug")).toBe("/learn/some-slug")
  })

  it("rejects api, traversal, and unknown paths", () => {
    expect(getSafeAuthRedirectAfterSignIn("/api/foo")).toBeNull()
    expect(getSafeAuthRedirectAfterSignIn("/_next/static")).toBeNull()
    expect(getSafeAuthRedirectAfterSignIn("/profile/../admin")).toBeNull()
    expect(getSafeAuthRedirectAfterSignIn("/does-not-exist")).toBeNull()
  })

  it("strips query and hash before validating", () => {
    expect(getSafeAuthRedirectAfterSignIn("/profile?x=1")).toBe("/profile")
    expect(getSafeAuthRedirectAfterSignIn("/tools/tarot#tab")).toBe("/tools/tarot")
  })
})
