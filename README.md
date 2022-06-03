# Composable forms

Highly-flexible forms library built on top of Effector

## Why "composable"?

The problem with most form-managers is that they are based on monolithic schemas.

But this leads to a lot of problems:

- **Sometimes you have just a single field**, and you don't want to create "a whole form" for that
- **Sometimes you have a custom form** with a variable structure which depends on specific conditions. Some of monolithic form managers don't support that at all, and others provide you with a frustrating configurations.
- **You have various fields - inputs, selects or even custom ones**, but API would be the same for all of them, and you'll have to create your wrappers for that.

This library allows you to **create simple fields**, then **combine them together**, and also easily **create dynamic forms** depending on your conditions.

## Install

```bash
npm i composable-forms
```

and don't forget peer dependencies

```bash
npm i effector joi
```

P.S. We use `joi` for validation schemas

## Usage

### Create fields

```tsx
import Joi from "joi";
import { createField } from "composable-forms";

const login = createField({
  initialValue: "",
  schema: Joi.string().required(),
});

const password = createField({
  initialValue: "",
  schema: Joi.string().required().min(3),
});
```

Fields provide a pack of useful stores:

```tsx
login.$value; // Current field value
login.$errors; // Errors array
login.$isDirty; // `true` if value changed, `false` otherwise
login.$isValid; // `true` if no errors, `false` otherwise
login.$hasErrors; // Like `$isValid` but reversed
login.$dirtyErrors; // Like `$errors` but returns empty array if `$isDirty` is `true`
login.$isDirtyAndValid; // Like `$isValid` but returns `true` if `$isDirty` is `true`
login.$hasDirtyErrors; // Like `$isValid` but returns `false` if `$isDirty` is `true`
```

> **NOTE**: All the stuff except `$value` and `$errors` will be called **"meta"**

### Combine fields together

```tsx
import { composeFields } from "composable-forms";

const loginForm = composeFields({
  fields: { login, password },
});
```

`composeFields` provide the same stores that `createField` - they combine all the values and errors from passed fields into one shape:

```tsx
loginForm.fields; // { login: Field<string>, password: Field<string> }
loginForm.$value; // Store<{ login: '', password: '' }>
loginForm.$errors; // Store<ValidationErrorItem[]>
// + meta
```

Forms also have the optional `schema` option, in case you need to add form-specific rules:

```tsx
import { composeFields } from "composable-forms";

const signupForm = composeFields({
  fields: { login, password, repeatPassword },
  schema: joi.object({
    repeatPassword: joi.any().valid(Joi.ref("password")),
  }),
});
```

If you want to access only form-specific errors, `signupForm.$ownErrors` does that

### Conditional fields

```tsx
import Joi from "joi";
import { isValue, createField, composeFields, conditionalField } from "composable-forms";

const type = createField({
  initialValue: "message",
  schema: Joi.string().valid("message", "menu", "tag"),
});

const messageOptions = composeFields(/* ... */);
const menuOptions = composeFields(/* ... */);
const tagOptions = composeFields(/* ... */);

const options = conditionalField({
  cases: [
    [isValue(type, "message"), messageOptions],
    [isValue(type, "menu"), menuOptions],
    [isValue(type, "tag"), tagOptions],
  ],
});
```

`conditionalField` returns the same stuff that `createField/composeFields` do, but with the value and errors of **the first matched case**.

Conditional fields support all **fields**, **forms** and **other conditional fields**.

## Custom fields

Library also provides built-in custom fields with ready-to-use API.
You can import them from `composable-forms/custom`

#### `createInput`

Like `createField` but with a `changed/inputChanged` events!

```tsx
import Joi from "joi";
import { createInput } from "composable-forms/custom";

const name = createInput({
  initialValue: "",
  schema: Joi.string().required(),
});

// Provides the same stuff that `createField` does
// + two additional events to attach to your fields:
name.changed; // Event<string | number>
name.inputChanged; // Event<InputEvent>
```

## Utilities

### `extractValues`

This method accepts an object with fields and extracts their `$value` stores.  
In combination with `patronum/spread` you can fill multiple fields with no boilerplate:

```tsx
import Joi from "joi";
import { spread } from "patronum";
import { createField, extractValues } from "composable-forms";

const userLoaded = createEvent<{ login: string; password: string }>();

const name = createField({ initialValue: "", schema: Joi.string() });
const surname = createField({ initialValue: "", schema: Joi.string() });

spread({
  source: userLoaded,
  targets: extractValues({ name, surname }),
});
```

### `isValue`

Creates a store which accepts a field and returns true/false whether it has a specific value or not.

```tsx
import Joi from "joi";
import { isValue, createField } from "composable-forms";

const type = createField({
  initialValue: "message",
  schema: Joi.string().valid("message", "menu", "tag"),
});

const isMessage = isValue(type, "message");
// `true` if type.$value is 'message'
// `false` otherwise
```

Useful in combo with `conditionalField`:

```tsx
import { conditionalField } from "composable-forms";

const options = conditionalField({
  cases: [
    [isValue(type, "message"), messageOptions],
    [isValue(type, "menu"), menuOptions],
    [isValue(type, "tag"), tagOptions],
  ],
});
```

### `createErrorsMeta`

If you want to create custom field, you might want to have all the meta as well:

```tsx
import { createEvent, createStore } from "effector";
import { validate, createErrorsMeta } from "composable-fields";

const createCounter = () => {
  const plus = createEvent();
  const minus = createEvent();
  const $value = createStore(0);
  const $errors = createStore([]);

  // Creates $isDirty and all the meta
  const meta = createErrorsMeta({
    value: $value,
    errors: $errors,
  });

  // You have to manually validate and set dirty state
  $errors.on($value, (_prev, value) => {
    return validate(value, params.schema);
  });

  meta.$isDirty.on([plus, minus], () => true);

  return { $value, $errors, plus, minus, ...meta };
};

const counter = createCounter();
```
