import { Field } from "../types";

export const valueIs = <T>(field: Field<T>, value: T) => {
  return field.$value.map((current) => current === value);
};
