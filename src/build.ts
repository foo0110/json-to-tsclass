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
  if (
    value instanceof Object &&
    !Object.prototype.hasOwnProperty.call(value, "length")
  ) {
    return ValueTypes.Object;
  }
  if (
    typeof value === "string" &&
    value.length >= 8 &&
    !isNaN(Date.parse(value))
  ) {
    return ValueTypes.Date;
  }
  if (typeof value === "string") {
    return ValueTypes.string;
  }
  if (typeof value === "number") {
    return ValueTypes.number;
  }
  if (value && Object.prototype.hasOwnProperty.call(value, "length")) {
    return ValueTypes.Array;
  }
  if (value === true || value === false) {
    return ValueTypes.boolean;
  }
  return ValueTypes.unknown;
};

const quotationMark = (value: string) =>
  `${/[-, ,.]/gm.test(value) ? "'" : ""}`;

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
        !subTypes.some(
          (obj) => obj === ValueTypes.Object || obj === ValueTypes.Array
        )
      ) {
        return `Array<${subTypes.join("|")}>`;
      }
      return `Array<${objects
        .map((obj) => constructSubType(getType(obj), obj))
        .join("|")}>`;
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

const constructClass = (object: Anonymous): Array<string> => {
  const properties = [];
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const element = object[key] as Anonymous;
      const type = getType(element);

      properties.push(
        `${quotationMark(key)}${key}${quotationMark(key)}: ${constructSubType(
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
      if (!result[key]) {
        result[key] = value;
        continue;
      }
      if (result[key] && getType(value) === ValueTypes.Object) {
        const current = { [key]: value };

        result[key] = {
          ...(result[key] as Object),
          ...buildContent(current as unknown as JSON, {} as unknown as JSON),
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
export const build = (className: string, jsonDatas: Array<JSON>) => {
  const data = jsonDatas
    .map((val) => val as Object)
    .reduce(
      (prev, val) => ({ ...prev, ...buildContent(val, prev) }),
      {}
    ) as Anonymous;
  const classContent = constructClass(data).join(`\n`);
  return `class ${className} {\n${classContent}\n}`;
};
