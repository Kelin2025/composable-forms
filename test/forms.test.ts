import { composeFields, conditionalField, createField } from "../src/forms";

describe("createField", () => {
  it("Returns correct configuration", () => {});

  it("Updates $isDirty on $value change", () => {
    const field = createField({
      initialValue: "",
    });

    // @ts-expect-error
    field.$value.setState("Test");

    expect(field.$isDirty.getState()).toBeTruthy();
  });

  it("Restores value and resets dirty state", () => {
    const field = createField({
      initialValue: "Foo",
    });

    // @ts-expect-error
    field.$value.setState("Test");

    field.restored("Bar");

    expect(field.$value.getState()).toBe("Bar");
    expect(field.$isDirty.getState()).toBeFalsy();
  });
});

describe("conditionalField", () => {
  it("Returns correct configuration", () => {});

  it("Matches currently active field", () => {
    const type = createField({
      initialValue: "Current",
    });

    const cond = conditionalField({
      cases: [
        [type.$value, "Bar", createField({ initialValue: "1" })],
        [type.$value, "Baz", createField({ initialValue: "2" })],
        [type.$value, "Current", createField({ initialValue: "3" })],
      ],
    });

    expect(cond.$value.getState()).toBe("3");
  });

  it("Restores correct store", () => {
    const type = createField({
      initialValue: "Current",
    });

    const a = createField({ initialValue: "1" });
    const b = createField({ initialValue: "2" });
    const c = createField({ initialValue: "3" });

    const cond = conditionalField({
      cases: [
        [type.$value, "Bar", a],
        [type.$value, "Baz", b],
        [type.$value, "Current", c],
      ],
    });

    cond.restored("Restored");

    expect(a.$value.getState()).toBe("1");
    expect(b.$value.getState()).toBe("2");
    expect(c.$value.getState()).toBe("Restored");
  });

  it("Field as predicate", () => {
    const a = createField({ initialValue: "Current" });
    const b = createField({ initialValue: "2" });
    const c = createField({ initialValue: "3" });

    const cond = conditionalField({
      cases: [
        [a.$value, "Current", a],
        [a.$value, "Baz", b],
        [a.$value, "Foo", c],
      ],
    });

    cond.restored("Baz");

    expect(a.$value.getState()).toBe("Baz");
    expect(b.$value.getState()).toBe("2");
    expect(c.$value.getState()).toBe("3");
  });

  it("Field as nested predicate", () => {
    const a = createField({ initialValue: "1" });
    const b = createField({ initialValue: "2" });
    const c = createField({ initialValue: "3" });

    const d = conditionalField({
      cases: [
        [a.$value, "1", a],
        [a.$value, "Foo", b],
        [a.$value, "Bar", c],
      ],
    });

    const e = conditionalField({
      cases: [
        [a.$value, "Foo", a],
        [d.$value, "1", d],
        [b.$value, "Current", c],
      ],
    });

    e.restored("Test");

    expect(a.$value.getState()).toBe("Test");
    expect(b.$value.getState()).toBe("2");
    expect(c.$value.getState()).toBe("3");
  });
});

describe("composeFields", () => {
  it("Returns correct configuration", () => {});

  it("Restores all fields", () => {
    const a = createField({ initialValue: "A" });
    const b = createField({ initialValue: "B" });
    const c = createField({ initialValue: "C" });

    const form = composeFields({
      fields: { a, b, c },
    });

    form.restored({
      a: "aa",
      b: "bb",
      c: "cc",
    });

    expect(a.$value.getState()).toBe("aa");
    expect(b.$value.getState()).toBe("bb");
    expect(c.$value.getState()).toBe("cc");
  });

  it("composeField field as conditionalField predicate", () => {
    const a = createField({ initialValue: "A" });
    const b = createField({ initialValue: "B" });
    const correct = createField({ initialValue: "Correct" });
    const incorrect = createField({ initialValue: "Incorrect" });

    const form = composeFields({
      fields: {
        a,
        b,
        cond: conditionalField({
          cases: [
            [a.$value, "A", incorrect],
            [a.$value, "aa", correct],
          ],
        }),
      },
    });

    form.restored({
      a: "aa",
      b: "bb",
      cond: "cc",
    });

    expect(a.$value.getState()).toBe("aa");
    expect(b.$value.getState()).toBe("bb");
    expect(correct.$value.getState()).toBe("cc");
    expect(incorrect.$value.getState()).toBe("Incorrect");
  });

  it("composeFields with two nested conditionalField's", () => {
    const blockData = {
      type: "filter",
      options: {
        type: "tags",
        tag_ids: [2],
      },
    };

    const blockType = createField({ initialValue: "message" });
    const filterType = createField({ initialValue: "tags" });
    const tagIds = createField({ initialValue: [0] });

    const filterOptions = composeFields({
      fields: {
        type: filterType,
        tag_ids: tagIds,
      },
    });

    const message = createField({ initialValue: "Message" });

    const messageOptions = composeFields({
      fields: {
        message,
      },
    });

    const blockOptions = conditionalField({
      cases: [
        [blockType.$value, "filter", filterOptions],
        [blockType.$value, "message", messageOptions],
      ],
    });

    const block = composeFields({
      fields: {
        type: blockType,
        options: blockOptions,
      },
    });

    // @ts-expect-error TODO: Solve Union problem
    block.restored(blockData);

    expect(block.$value.getState()).toEqual(blockData);
    expect(blockType.$value.getState()).toBe("filter");
    expect(filterType.$value.getState()).toBe("tags");
    expect(tagIds.$value.getState()).toEqual([2]);
    expect(message.$value.getState()).toBe("Message");
  });
});
