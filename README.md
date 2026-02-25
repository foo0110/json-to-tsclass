# json-to-tsclass

Convert list of JSON data into simple TypeScript Class

## Sample

---

```
import { build } from "js-to-tsclass";
import { writeFileSync } from "fs";

const data1 = JSON.parse(
  `{"field1":1,"field2":"2a","field3":[1,2],"field4":[1,"a"],"field5":{"field5-subField1":"id1","field5-subField2":{"field5-subfield2-A":1,"field5-subfield2-B":["j4"]}},"field6":[[2,"b"]],"field7":[[{"field7-subfield1":"f2"}]],"field8":[{"field8-subfield1":"f3","field8-subfield2":{"field8-subfield1a":12,"field8-subfieldb":[1,2,"we"]}},{"id":2}]}`
);

const data2 = JSON.parse(
  `{"field1":"1a","field5":{"field5-subField1":"id1","field5-subField3":{"field8-subfield1":"f3","field8-subfield2":{"field8-subfield1a":12,"field8-subfieldb":[1,2,"we"]}}},"field9":{"field9-subField1":"id1","field9-subField2":false,"field9-subField3":"2022-01-01"},"field10":null}`
);

const built = build("Sample", [data1, data2]);

writeFileSync("./SampleClass.ts", built);

```

What you will get with format applied

```
class Sample {
  field1: number;
  field2: string;
  field3: Array<number>;
  field4: Array<number | string>;
  field5: {
    "field5-subField1": string;
    "field5-subField2": {
      "field5-subfield2-A": number;
      "field5-subfield2-B": Array<string>;
    };
    field5: {
      "field5-subField1": string;
      "field5-subField3": {
        "field8-subfield1": string;
        "field8-subfield2": {
          "field8-subfield1a": number;
          "field8-subfieldb": Array<number | string>;
        };
      };
    };
  };
  field6: Array<Array<number | string>>;
  field7: Array<
    Array<{
      "field7-subfield1": string;
    }>
  >;
  field8: Array<
    | {
        "field8-subfield1": string;
        "field8-subfield2": {
          "field8-subfield1a": number;
          "field8-subfieldb": Array<number | string>;
        };
      }
    | {
        id: number;
      }
  >;
  field9: {
    "field9-subField1": string;
    "field9-subField2": boolean;
    "field9-subField3": Date;
  };
  field10: unknown;
}
```
