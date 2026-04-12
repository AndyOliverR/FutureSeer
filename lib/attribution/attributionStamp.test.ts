import {
  appendAttribution,
  stripAttributionForDisplay,
} from "./attributionStamp";

describe("stripAttributionForDisplay", () => {
  it("removes footer matching appendAttribution", () => {
    const body = "The Moon speaks of change.";
    const stamped = appendAttribution(body, {
      markerFamily: "ask-western-seer",
    });
    expect(stripAttributionForDisplay(stamped)).toBe(body);
  });

  it("returns text unchanged when no footer", () => {
    const t = "Plain reading.\n\nNo marker here.";
    expect(stripAttributionForDisplay(t)).toBe(t);
  });
});
