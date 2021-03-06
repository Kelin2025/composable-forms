import { ValidationErrorItem } from "joi";
import { Event, Store, StoreValue } from "effector";

export enum Kind {
  FIELD = 0,
  CONDITIONAL_FIELD = 1,
  FORM = 1,
}

export type Field<T> = {
  $value: Store<T>;
  restored: Event<T | void>;
  $isDirty: Store<boolean>;
  $errors: Store<ValidationErrorItem[]>;
  $isValid: Store<boolean>;
  $hasErrors: Store<boolean>;
  $dirtyErrors: Store<ValidationErrorItem[]>;
  $isDirtyAndValid: Store<boolean>;
  $hasDirtyErrors: Store<boolean>;
  kind: Kind;
};

export type FieldsObject = {
  [key: string]: Field<any>;
};

export type Form<T extends FieldsObject> = {
  fields: FieldsObject;
} & Field<{ [key in keyof T]: StoreValue<T[key]["$value"]> }>;
