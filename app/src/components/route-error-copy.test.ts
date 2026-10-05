import { describe, expect, it } from "vitest";

import { ROUTE_ERROR_LINE, ROUTE_ERROR_RETRY } from "@/components/route-error-copy";
import { CAST } from "@/content/cast";

describe("route error copy (D10, warm)", () => {
  it("names the fish and is not the plain system line", () => {
    expect(ROUTE_ERROR_LINE).toContain(CAST.fish);
    expect(ROUTE_ERROR_LINE).not.toMatch(/something went wrong/i);
  });

  it("offers a warm retry, not the plain Try again", () => {
    expect(ROUTE_ERROR_RETRY).not.toBe("Try again");
  });
});
