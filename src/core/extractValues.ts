import { FieldsObject } from "../types";

// Takes an object of fields and returns an object of its $value stores
export const extractValues = <T extends FieldsObject>(fields: T) => {
  // @ts-expect-error
  const valuesObj: { [key in keyof T]: T[key]["$value"] } = {};
  for (const k in fields) {
    valuesObj[k] = fields[k].$value;
  }
  return valuesObj;
};
