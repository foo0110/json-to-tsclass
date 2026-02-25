import { build } from "./../src/build";

describe("edge cases for build", () => {
  it("quotes keys that are not valid identifiers", () => {
    const result = build("Q", [{ "a-b": 1, normal: 2 } as unknown as JSON]);
    expect(result).toContain("\"a-b\": number");
    expect(result).toContain("normal: number");
  });

  it("detects arrays correctly (Array.isArray)", () => {
    const result = build("Arr", [{ list: [1, 2, 3], nested: [[1, 2], [3]] } as unknown as JSON]);
    expect(result).toContain("list: Array<number>");
    expect(result).toContain("nested: Array<Array<number>>");
  });
});
