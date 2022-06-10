import { build } from "./../src/build";
import data1 from "./test-data/data1.json";
import data2 from "./test-data/data2.json";

describe("build JSON data", () => {
  it("should build and match snapshot", () => {
    const result = build("Data", [
      JSON.parse(JSON.stringify(data1)),
      JSON.parse(JSON.stringify(data2)),
    ]);
    expect(result).toMatchSnapshot();
  });
});
