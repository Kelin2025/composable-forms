import { ObjectSchema } from "joi";
import { createStore, combine } from "effector";

import { Kind, FieldsObject } from "../types";
import { NO_ERRORS, createErrorsMeta, validate, extractValues } from "../core";

/** Combines passed object into a form and creates validation meta for it */
export const composeFields = <T extends FieldsObject>(params: {
  fields: T;
  schema?: ObjectSchema;
}) => {
  const fieldsArray = Object.values(params.fields);
  const valuesObj = extractValues(params.fields);
  const $value = combine(valuesObj);
  const $ownErrors = createStore(NO_ERRORS);
  const $errors = combine(
    combine(fieldsArray.map((field) => field.$errors)),
    $ownErrors,
    ([fieldErrors, ownErrors]) => {
      const allErrors = [...fieldErrors, ...ownErrors];
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
    $ownErrors.on($value, (_prev, value) => validate(value, params.schema!));
  }

  return {
    fields: params.fields,
    $value,
    $ownErrors,
    $errors,
    ...meta,
    kind: Kind.FORM,
  };
};
