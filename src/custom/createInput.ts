import { Schema } from "joi";
import { createEvent } from "effector";

import { createField } from "../forms/createField";

/**
 * Creates a Field with `changed` & `inputChanged` events that can be passed to HTML inputs
 */
export const createInput = <T extends string | number>(params: {
  initialValue: T;
  schema?: Schema;
}) => {
  const field = createField(params);
  const changed = createEvent<T>();
  const inputChanged = createEvent<InputEvent>();

  field.$value
    .on(changed, (_prev, next) => next)
    // @ts-expect-error TS still does not like evt.target.value
    .on(inputChanged, (prev, evt) => evt.target.value);

  return { ...field, changed, inputChanged };
};
