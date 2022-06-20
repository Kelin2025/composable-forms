import { is, createStore } from "effector";
import Joi, { ValidationErrorItem } from "joi";

import { createErrorsMeta, extractValues, NO_ERRORS, validate } from "../src/core";
import { createField } from "../src/forms";

const TEST_ERROR = {
  message: 'Field "Foo" should be be greater than whatever',
  path: ["foo"],
  type: "number.min",
} as ValidationErrorItem;

describe("createErrorsMeta", () => {
  const $value = createStore("");
  const errors = createStore([TEST_ERROR]);

  it("Returns correct configuration", () => {
    const meta = createErrorsMeta({ value: $value, errors });

    expect(is.store(meta.$isDirty)).toBeTruthy();
    expect(is.store(meta.$isValid)).toBeTruthy();
    expect(is.store(meta.$hasErrors)).toBeTruthy();
    expect(is.store(meta.$dirtyErrors)).toBeTruthy();
    expect(is.store(meta.$isDirtyAndValid)).toBeTruthy();
    expect(is.store(meta.$hasDirtyErrors)).toBeTruthy();

    expect(meta.$isDirty.getState()).toEqual(false);
    expect(meta.$isValid.getState()).toEqual(false);
    expect(meta.$hasErrors.getState()).toEqual(true);
    expect(meta.$dirtyErrors.getState()).toEqual([]);
    expect(meta.$isDirtyAndValid.getState()).toEqual(true);
    expect(meta.$hasDirtyErrors.getState()).toEqual(false);
  });

  it("Ignores errors if dirty", () => {
    const meta = createErrorsMeta({ value: $value, errors });

    expect(meta.$dirtyErrors.getState()).toEqual([]);
    expect(meta.$isDirtyAndValid.getState()).toEqual(true);
    expect(meta.$hasDirtyErrors.getState()).toEqual(false);
  });

  it("Has dirty errors if dirty", () => {
    const meta = createErrorsMeta({ value: $value, errors });

    // @ts-expect-error
    meta.$isDirty.setState(true);

    expect(meta.$dirtyErrors.getState()).toEqual([TEST_ERROR]);
    expect(meta.$isDirtyAndValid.getState()).toEqual(false);
    expect(meta.$hasDirtyErrors.getState()).toEqual(true);
  });
});

describe("extractValues", () => {
  it("Extracts $value stores from fields", () => {
    const fields = {
      foo: createField({ initialValue: "" }),
      bar: createField({ initialValue: "" }),
    };
    const values = extractValues(fields);

    expect(Object.keys(values)).toEqual(["foo", "bar"]);
    expect(values.foo).toBe(fields.foo.$value);
    expect(values.bar).toBe(fields.bar.$value);
  });
});

describe("validate", () => {
  it("Returns NO_ERRORS if no errors", () => {
    const errors = validate("Test", Joi.string());

    expect(errors).toBe(NO_ERRORS);
  });

  it("Returns array of errors if has errors", () => {
    const errors = validate("Foo", Joi.string().min(5));

    const ERRORS = [
      {
        message: '"value" length must be at least 5 characters long',
        path: [],
        type: "string.min",
        context: { limit: 5, value: "Foo", encoding: undefined, label: "value" },
      },
    ];

    expect(errors).toEqual(ERRORS);
  });
});
