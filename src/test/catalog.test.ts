import { describe, expect, it } from "vitest";
import { MOCK_MOVIES, POPULAR_IDS } from "@/lib/mock-data";

describe("movie catalog", () => {
  it("contains exactly the 1000 movies from the backend CSV", () => {
    expect(MOCK_MOVIES).toHaveLength(1000);
    expect(new Set(MOCK_MOVIES.map((m) => m.id)).size).toBe(1000);
  });

  it("only uses catalog movies for popular picks", () => {
    const ids = new Set(MOCK_MOVIES.map((m) => m.id));
    expect(POPULAR_IDS.every((id) => ids.has(id))).toBe(true);
  });
});
