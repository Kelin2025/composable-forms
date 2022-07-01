import { Schema } from "joi";
import { sample, createEvent, createStore } from "effector";

import { Kind } from "../types";
import { validate, createErrorsMeta, NO_ERRORS } from "../core";

/** Create a basic field */
export const createField = <T>(params: { initialValue: T; schema?: Schema }) => {
  const restored = createEvent<T | void>();
  const $value = createStore(params.initialValue);
  const $errors = createStore(
    params.schema ? validate(params.initialValue, params.schema) : NO_ERRORS
  );
  const meta = createErrorsMeta({
    value: $value,
    errors: $errors,
  });

  meta.$isDirty.on($value, () => true);

  $value.on(restored, (_prev, next) => (next === undefined ? params.initialValue : next));

  meta.$isDirty.on(sample({ clock: restored }), () => false);

  if (params.schema) {
    $errors.on($value, (_prev, value) => {
      return validate(value, params.schema!);
    });
  }

  return {
    $value,
    restored,
    $errors,
    ...meta,
    kind: Kind.FIELD,
  };
};
