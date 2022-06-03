import { Schema } from "joi";
import { createStore } from "effector";

import { Kind } from "../types";
import { validate, createErrorsMeta } from "../core";

/** Create a basic field */
export const createField = <T>(params: { initialValue: T; schema: Schema }) => {
  const $value = createStore(params.initialValue);
  const $errors = createStore(validate(params.initialValue, params.schema));
  const meta = createErrorsMeta({
    value: $value,
    errors: $errors,
  });

  meta.$isDirty.on($value, () => true);

  $errors.on($value, (_prev, value) => {
    return validate(value, params.schema);
  });

  return {
    $value,
    $errors,
    ...meta,
    kind: Kind.FIELD,
  };
};
