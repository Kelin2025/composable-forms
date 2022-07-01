import { Event, sample } from "effector";

import { Field, Kind } from "../types";

export const restoreField = <T>(params: { field: Field<T>; trigger: Event<T> }) => {
  const { field, trigger } = params;

  if (field.kind === Kind.FIELD) {
    field.$value.on(trigger, (_prev, value) => {
      return value === undefined ? field.$value.defaultState : value;
    });
    field.$isDirty.on(trigger, () => false);
    sample({
      clock: trigger,
      target: field.restored,
    });
  } else {
    sample({
      clock: trigger,
      target: field.restored,
    });
  }
};
