class Anonymous {
  [x: string]: unknown;
}

enum ValueTypes {
  string = "string",
  number = "number",
  Array = "Array",
  boolean = "boolean",
  Date = "Date",
  Object = "Object",
  unknown = "unknown",
}

const getType = (value: unknown) => {
  if (Array.isArray(value)) {
    return ValueTypes.Array;
  }
  if (value instanceof Object && !Array.isArray(value)) {
    return ValueTypes.Object;
  }
  if (typeof value === "string" && value.length >= 8 && !isNaN(Date.parse(value))) {
    return ValueTypes.Date;
  }
  if (typeof value === "string") {
    return ValueTypes.string;
  }
  if (typeof value === "number") {
    return ValueTypes.number;
  }
  if (value === true || value === false) {
    return ValueTypes.boolean;
  }
  return ValueTypes.unknown;
};

const quotationMark = (value: string) =>
  (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value) ? "" : '"');

const filterUnique = (origins: Array<ValueTypes>) => {
  const items = new Array<ValueTypes>();
  for (const origin of origins) {
    if (items.indexOf(origin) < 0) {
      items.push(origin);
    }
  }
  return items;
};

const constructSubType = (type: ValueTypes, object: Anonymous): string => {
  const validTypes = [ValueTypes.Array, ValueTypes.Object];
  const typeConstructor = {
    [ValueTypes.Object]: (object: Anonymous): string =>
      `{\n${constructClass(object).join(`\n`)}\n}`,
    [ValueTypes.Array]: (objects: Anonymous[]): string => {
      const subTypes = filterUnique(objects.map((obj) => getType(obj)));

      if (
        subTypes.length &&
        !subTypes.some((obj) => obj === ValueTypes.Object || obj === ValueTypes.Array)
      ) {
        return `Array<${subTypes.join("|")}>`;
      }
      // construct detailed subtype strings and dedupe them to avoid repeated unions
      const constructed = objects.map((obj) => constructSubType(getType(obj), obj));
      const uniqueConstructed = Array.from(new Set(constructed));
      const arrayType = uniqueConstructed.join("|");
      return `Array<${arrayType || `unknown`}>`;
    },
  };
  if (validTypes.every((funcType) => funcType !== type)) {
    return type;
  }

  if (type === ValueTypes.Array) {
    return typeConstructor.Array(object as unknown as Array<Anonymous>);
  }
  return typeConstructor.Object(object);
};

const constructClass = (object: Anonymous, isTopLevel = false): Array<string> => {
  const properties: string[] = [];
  const strict = isTopLevel && _buildOptions.strictPropertyInitialization;
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const element = object[key] as Anonymous;
      const type = getType(element);
      const strictMark = strict ? "!" : "";

      properties.push(
        `${quotationMark(key)}${key}${quotationMark(key)}${strictMark}: ${constructSubType(
          type,
          element
        )}`
      );
    }
  }
  return properties;
};

const buildContent = (object: Object, data: Object) => {
  const result: Anonymous = { ...data };
  const source: Anonymous = {};
  Object.assign(source, object);
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const value = source[key];
      // only treat a missing key when it's not present on result (avoid falsy-value overwrite)
      if (!Object.prototype.hasOwnProperty.call(result, key)) {
        result[key] = value;
        continue;
      }
      // merge nested objects only when both sides are objects
      if (
        Object.prototype.hasOwnProperty.call(result, key) &&
        getType(value) === ValueTypes.Object &&
        getType(result[key]) === ValueTypes.Object
      ) {
        const current = { [key]: value };

        result[key] = {
          ...(result[key] as Object),
          ...buildContent(current as unknown as Record<string, unknown>, {} as unknown as Record<string, unknown>),
        };
        continue;
      }
    }
  }
  return result;
};

/**
 *
 * @param className The class name to be built
 * @param jsonDatas The list of JSON data to be analyzed and build the Class
 * @returns The unformatted class  built
 */
const formatWithPrettier = (code: string): string => {
  try {
    // dynamically require prettier so code still works if prettier isn't installed
    // (fall back to raw output)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const prettier = require("prettier");
    return prettier.format(code, { parser: "typescript" });
  } catch (e) {
    return code;
  }
};

// build options shared during a single build invocation
let _buildOptions: { strictPropertyInitialization?: boolean } = {};

export const build = (
  className: string,
  jsonDatas: Array<Record<string, unknown>>,
  options?: { strictPropertyInitialization?: boolean }
) => {
  _buildOptions = options || {};
  const data = jsonDatas
    .map((val) => val as Object)
    .reduce(
      (prev, val) => ({ ...prev, ...buildContent(val, prev) }),
      {}
    ) as Anonymous;
  const classContent = constructClass(data, true).join(`\n`);
  const raw = `class ${className} {\n${classContent}\n}`;
  // reset options
  _buildOptions = {};
  return formatWithPrettier(raw);
};
