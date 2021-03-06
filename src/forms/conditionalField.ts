import { Store, combine, createEvent, sample } from "effector";

import { Field, Kind } from "../types";
import { NO_ERRORS, createErrorsMeta } from "../core";

/**
 * Returns first field that satisfied a specific condition
 */
export const conditionalField = <T extends [Store<boolean>, Field<any>][]>(params: {
  cases: T;
}) => {
  // TODO: No restore for conditionalField?
  const restored = createEvent<T[number][1]["$value"]>();

  // TODO: Solve this hell somehow
  const $combinedCases = combine(
    ...params.cases.map(
      ([
        filter,
        {
          $value,
          $isDirty,
          $errors,
          $isValid,
          $hasErrors,
          $dirtyErrors,
          $isDirtyAndValid,
          $hasDirtyErrors,
        },
      ]) =>
        combine({
          filter,
          value: $value,
          isDirty: $isDirty,
          errors: $errors,
          isValid: $isValid,
          hasErrors: $hasErrors,
          dirtyErrors: $dirtyErrors,
          isDirtyAndValid: $isDirtyAndValid,
          hasDirtyErrors: $hasDirtyErrors,
        })
    )
  );
  const $validCase = $combinedCases.map((fieldCases) => {
    for (const field of fieldCases) {
      if (field.filter) {
        return field;
      }
    }
    return null;
  });
  const $value = $validCase.map((field) => (field ? field.value : null));
  const $errors = $validCase.map((field) => (field ? field.errors : NO_ERRORS));
  const meta = createErrorsMeta({
    value: $value,
    errors: $errors,
  });

  meta.$isDirty.on($validCase, (_prev, field) => (field ? field.isDirty : false));

  for (const fieldCase of params.cases) {
    sample({
      clock: restored,
      filter: fieldCase[0],
      target: fieldCase[1].restored,
    });
  }

  return {
    $value: $value as T[number][1]["$value"],
    restored,
    $errors,
    ...meta,
    kind: Kind.CONDITIONAL_FIELD,
  };
};
