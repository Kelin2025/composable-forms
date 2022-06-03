import { combine } from "effector";

import { createErrorsMeta } from "../core";
import { FieldsObject, Kind } from "../types";

/**
 * Takes an object of forms and combines them into one
 */
const mergeForms = <T extends FieldsObject>(params: { forms: T[] }) => {
  const $value = combine(
    combine(params.forms.map((form) => form.$value)),
    (forms) => Object.assign({}, ...forms)
  );
  const $errors = combine(
    combine(params.forms.map((form) => form.$errors)),
    (errors) => errors.flat()
  );
  const meta = createErrorsMeta({
    value: $value,
    errors: $errors,
  });

  return {
    fields: params.forms.reduce(
      (res, form) => Object.assign(res, form.fields),
      {}
    ),
    value: $value,
    errors: $errors,
    ...meta,
    kind: Kind.FORM,
  };
};
