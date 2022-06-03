import { Store, combine } from "effector";

import { Field, Kind } from "../types";
import { NO_ERRORS, createErrorsMeta } from "../core";

/**
 * Returns first field that satisfied a specific condition
 */
export const conditionalField = <T extends Field<any>>(params: {
  cases: [Store<boolean>, T][];
}) => {
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

  return {
    $value,
    $errors,
    ...meta,
    kind: Kind.CONDITIONAL_FIELD,
  };
};
