import { describe, expect, it } from "@jest/globals";
import {
  matchesAnyRoutePrefix,
  matchesRoutePrefix,
} from "@/lib/route-prefix";

describe("matchesRoutePrefix", () => {
  it("matches the exact route root", () => {
    expect(matchesRoutePrefix("/api/supplier", "/api/supplier")).toBe(true);
  });

  it("matches nested routes under the prefix", () => {
    expect(matchesRoutePrefix("/api/supplier/applications", "/api/supplier")).toBe(true);
  });

  it("does not match sibling prefixes that only share the same start", () => {
    expect(matchesRoutePrefix("/api/suppliers", "/api/supplier")).toBe(false);
  });

  it("normalizes a trailing slash in the configured prefix", () => {
    expect(matchesRoutePrefix("/supplier/login", "/supplier/")).toBe(true);
  });
});

describe("matchesAnyRoutePrefix", () => {
  it("matches when any configured prefix applies", () => {
    expect(matchesAnyRoutePrefix("/apply/test-visa", ["/user", "/apply"])).toBe(true);
  });
});
