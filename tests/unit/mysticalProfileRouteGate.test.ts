import { shouldSubscribeMysticalProfile } from "@/lib/mysticalProfileRouteGate";

describe("shouldSubscribeMysticalProfile", () => {
  it("subscribes on home and tool routes", () => {
    expect(shouldSubscribeMysticalProfile("/")).toBe(true);
    expect(shouldSubscribeMysticalProfile("/tools/tarot")).toBe(true);
    expect(shouldSubscribeMysticalProfile("/profile")).toBe(true);
    expect(shouldSubscribeMysticalProfile("/ask-vedic-seer")).toBe(true);
  });

  it("skips marketing and legal routes", () => {
    expect(shouldSubscribeMysticalProfile("/privacy")).toBe(false);
    expect(shouldSubscribeMysticalProfile("/terms")).toBe(false);
    expect(shouldSubscribeMysticalProfile("/signin")).toBe(false);
    expect(shouldSubscribeMysticalProfile("/about")).toBe(false);
  });
});
