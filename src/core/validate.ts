import { AnySchema, ValidationErrorItem } from "joi";

export const NO_ERRORS: ValidationErrorItem[] = [];

/**
 * Validates `value` with the passed `schema`.
 * Returns normalized errors list or a static empty array
 */
export const validate = <T>(value: T, schema: AnySchema) => {
  const error = schema.validate(value).error;
  return error ? error.details : NO_ERRORS;
};
