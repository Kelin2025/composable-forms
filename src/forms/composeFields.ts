import { ObjectSchema } from "joi";
import { createStore, combine, createEvent, StoreValue, split } from "effector";

import { restoreField } from "../lib/restore-field";
import { Kind, FieldsObject } from "../types";
import { NO_ERRORS, createErrorsMeta, validate, extractValues, anySchema } from "../core";

/** Combines passed object into a form and creates validation meta for it */
export const composeFields = <T extends FieldsObject>(params: {
  fields: T;
  schema?: ObjectSchema;
}) => {
  const fieldsArray = Object.values(params.fields);
  const valuesObj = extractValues(params.fields);
  const $value = combine(valuesObj);
  const restored = createEvent<StoreValue<typeof $value> | void>();
  const $ownErrors = createStore(NO_ERRORS);
  const $errors = combine(
    combine(fieldsArray.map((field) => field.$errors)),
    $ownErrors,
    (fieldErrors, ownErrors) => {
      const allErrors = [...fieldErrors.flat(), ...ownErrors];
      return allErrors.length ? allErrors : NO_ERRORS;
    }
  );
  const meta = createErrorsMeta({
    value: $value,
    errors: $errors,
  });

  meta.$isDirty.on(combine(fieldsArray.map((field) => field.$isDirty)), (_prev, dirties) =>
    dirties.some(Boolean)
  );

  if (params.schema) {
    $ownErrors.on($value, (_prev, value) => {
      return validate(value, params.schema || anySchema);
    });
  }

  const { reset, __: restoredValue } = split(restored, {
    reset: (value): value is void => value === undefined,
  });
  for (const fieldKey in params.fields) {
    restoreField({
      field: params.fields[fieldKey],
      fn: () => undefined,
      trigger: reset,
    });
    restoreField({
      field: params.fields[fieldKey],
      fn: (value) => value![fieldKey],
      trigger: restoredValue,
    });
  }

  return {
    fields: params.fields,
    $value,
    restored,
    $ownErrors,
    $errors,
    ...meta,
    kind: Kind.FORM,
  };
};
