import { Store, combine, createEvent, sample } from "effector";

import { Field, Kind } from "../types";
import { NO_ERRORS, createErrorsMeta } from "../core";
import { restoreField } from "../lib/restore-field";

type Case<T> = [Store<T>, T | ((value: T) => boolean), Field<T>];

/**
 * Returns first field that satisfied a specific condition
 */
export const conditionalField = <T extends Case<any>[]>(params: { cases: T }) => {
  // TODO: No restore for conditionalField?
  const restored = createEvent<T[number][1]["$value"]>();

  const mappedCases = params.cases.map(([source, predicate, field]) => {
    return {
      source,
      predicate,
      fieldStores: {
        filter: source.map((value) => {
          return typeof predicate === "function" ? predicate(value) : value === predicate;
        }),
        value: field.$value,
        isDirty: field.$isDirty,
        errors: field.$errors,
        isValid: field.$isValid,
        hasErrors: field.$hasErrors,
        dirtyErrors: field.$dirtyErrors,
        isDirtyAndValid: field.$isDirtyAndValid,
        hasDirtyErrors: field.$hasDirtyErrors,
      },
      field,
    };
  });

  // TODO: Solve this hell somehow
  const $combinedCases = combine(...mappedCases.map((curCase) => combine(curCase.fieldStores)));

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

  const fieldPredicateCases = mappedCases.filter((sourceCase) => {
    return mappedCases.some((fieldCase) => {
      // TODO: Add check for field Kind
      return fieldCase.fieldStores.value === sourceCase.source;
    });
  });

  const prioritizedCases = [...mappedCases].sort((a, b) => {
    if (fieldPredicateCases.includes(a)) {
      return -1;
    }
    if (fieldPredicateCases.includes(b)) {
      return -1;
    }
    return 0;
  });

  for (const fieldCase of prioritizedCases) {
    const currentCaseRestored = sample({
      clock: restored,
      filter: fieldCase.fieldStores.filter,
    });

    restoreField({
      field: fieldCase.field,
      trigger: currentCaseRestored,
    });
  }

  return {
    $value: $value as T[number][2]["$value"],
    restored,
    $errors,
    ...meta,
    kind: Kind.CONDITIONAL_FIELD,
  };
};
