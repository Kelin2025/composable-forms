import { ValidationErrorItem } from "joi";
import { combine, createStore, Store } from "effector";

import { NO_ERRORS } from "./validate";

/** Creates validation meta for a specific `{ value, errors }` pair */
export const createErrorsMeta = <T>(params: {
  value: Store<T>;
  errors: Store<ValidationErrorItem[]>;
}) => {
  const $isDirty = createStore(false);
  const $isValid = params.errors.map((errors) => errors.length === 0);
  const $hasErrors = params.errors.map((errors) => errors.length > 0);
  const $dirtyErrors = combine($isDirty, params.errors, (isDirty, errors) =>
    isDirty ? errors : NO_ERRORS
  );
  const $isDirtyAndValid = $dirtyErrors.map((errors) => errors.length === 0);
  const $hasDirtyErrors = $dirtyErrors.map((errors) => errors.length > 0);

  return {
    $isDirty,
    $isValid,
    $hasErrors,
    $dirtyErrors,
    $isDirtyAndValid,
    $hasDirtyErrors,
  };
};
