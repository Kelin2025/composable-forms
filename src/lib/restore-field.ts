import { Event, sample } from "effector";

import { Field, Kind } from "../types";

/**
 * Reduces the amount of updates when using `.restored()`
 * by applying updates directly to stores instead of
 * using `sample({ clock, target: field. restored })`
 * */
export const restoreField = <T, U>(params: {
  field: Field<T>;
  trigger: Event<U>;
  fn?: (value: U) => T;
}) => {
  // @ts-expect-error
  const { field, trigger, fn = (x: U): T => x } = params;

  if (field.kind === Kind.FIELD) {
    field.$value.on(trigger, (_prev, value) => {
      const mappedValue = fn(value);
      return mappedValue === undefined ? field.$value.defaultState : mappedValue;
    });
    field.$isDirty.on(trigger, () => false);
    sample({
      clock: trigger,
      fn,
      target: field.restored,
    });
  } else {
    sample({
      clock: trigger,
      fn,
      target: field.restored,
    });
  }
};
